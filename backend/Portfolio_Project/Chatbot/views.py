from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
import openai
import os
import google.generativeai as genai

class ChatBotView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        message = request.data.get('message', '').lower()
        if not message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Smart Tool: Check for stock price queries
        price_context = ""
        if "price" in message or "cost" in message:
            try:
                import yfinance as yf
                import re
                # Simple regex to find symbols or names
                words = message.split()
                # Try to find a ticker-like word or common names
                for word in words:
                    if len(word) >= 2 and word.isalpha():
                        t = yf.Ticker(word.upper())
                        info = t.info
                        if info.get('currentPrice') or info.get('regularMarketPrice'):
                            price = info.get('currentPrice') or info.get('regularMarketPrice')
                            price_context = f"\n[TOOL DATA: Current price of {word.upper()} is {price} {info.get('currency', 'USD')}]"
                            break
            except:
                pass

        # Try to get Gemini API key from environment variable first
        api_key = os.getenv("GEMINI_API_KEY", "AIzaSyAKmdOZJv_6Upt0Alay5_vvxf5vv04PPpY")
        
        if not api_key or api_key == "PLACEHOLDER_KEY_HERE":
            return Response({"reply": "AI Assistant is currently offline. Please provide your Gemini API key in backend/Portfolio_Project/Chatbot/views.py."}, status=status.HTTP_200_OK)

        system_prompt = (
            "You are StockWhiz AI. "
            "Reply in max 2-3 SHORT points. Use simple language. "
            "Bold key terms. No intro/outro. No 'As an AI'."
            f"{price_context}"
        )

        try:
            # Check if it's a Google API Key (Gemini)
            if api_key.startswith("AIza"):
                genai.configure(api_key=api_key)
                
                # List of models to try in order of preference
                models_to_try = ["gemini-3-flash-preview", "gemini-2.0-flash", "gemini-flash-latest"]
                last_error = ""
                
                for model_name in models_to_try:
                    try:
                        model = genai.GenerativeModel(
                            model_name=model_name,
                            generation_config={
                                "temperature": 0.7,
                                "top_p": 0.95,
                                "top_k": 64,
                                "max_output_tokens": 250,
                            }
                        )
                        response = model.generate_content(f"{system_prompt}\n\nUser: {message}")
                        
                        if response.candidates and response.candidates[0].content.parts:
                            return Response({"reply": response.text}, status=status.HTTP_200_OK)
                        else:
                            last_error = "Safety filter blocked response"
                            continue
                    except Exception as inner_e:
                        last_error = str(inner_e)
                        if "429" in last_error:
                            print(f"Quota exceeded for {model_name}. Trying next...")
                            continue
                        print(f"Error with {model_name}: {last_error}")
                        continue
                
                # If all models fail
                if "429" in last_error:
                    return Response({"reply": "I've reached my daily limit for today! Please try again later or check your Gemini API quota at ai.google.dev."}, status=status.HTTP_200_OK)
                return Response({"reply": f"I'm having some trouble connecting. Error: {last_error[:50]}..."}, status=status.HTTP_200_OK)
            else:
                # Use OpenAI gpt-3.5-turbo (fastest stable model)
                client = openai.OpenAI(api_key=api_key)
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": message},
                    ],
                    max_tokens=250,
                    temperature=0.7
                )
                reply = response.choices[0].message.content
            
            return Response({"reply": reply}, status=status.HTTP_200_OK)
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"Chatbot API error: {e}")
            return Response({"reply": "I'm having a bit of trouble reaching my brain! Please check your API key or try again in a moment."}, status=status.HTTP_200_OK)
