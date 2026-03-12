# StockWhiz - Portfolio Management System

StockWhiz is a full-stack web application designed for data-driven investing. It allows users to explore market sectors, search for stocks, and manage custom investment portfolios with AI-powered opportunity insights and real-time data analysis.

## 🚀 Features

- **Single Portfolio Model**: Every staff member gets a personalized, auto-provisioned portfolio for tracking holdings.
- **StockWhiz AI Chatbot**: A smart assistant powered by Google Gemini that provides real-time stock price analysis and investment guidance.
- **Gold & Silver Analysis**: Interactive visual regression and price analysis for precious metals.
- **Creative Market Exploration**: Interactive dashboard to browse through different market sectors (IT, Banking, Automobile, etc.).
- **Dynamic Portfolio Management**: Add stocks via live search or sector-specific filtering with real-time price updates.
- **AI-Powered Insights**: Automated classification of stocks into "Strong", "Moderate", or "Low" opportunity levels based on 52-week highs and current discounts.
- **Secure Staff Authentication**: Custom token-based authentication system using cryptographic signing for secure staff access.
- **Modern UI**: Fullscreen, responsive design with glassmorphism elements, custom animations, and a professional aesthetic.

## 🛠️ Tech Stack

**Frontend:**
- React.js (Vite)
- React Router DOM (Navigation)
- Axios (API Communication)
- CSS3 (Custom Styling & Glassmorphism)
- Recharts (Data Visualization)

**Backend:**
- Django (Web Framework)
- Django REST Framework (API)
- SQLite (Database)
- Google Gemini AI (Chatbot Engine)
- yfinance (Financial Data Provider)
- Custom Token Auth (Security)

## 📋 Installation & Setup

### Prerequisites
- Python 3.13.x
- Node.js & npm
- PM2 (Optional, for production-like deployment)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend/Portfolio_Project
   ```
2. Create and activate your virtual environment:
   ```powershell
   # On Windows (inside backend/Portfolio_Project)
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r ../../requirements.txt
   ```
4. Configure environment variables:
   Create a `.env` file in `backend/Portfolio_Project/` and add:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

5. Apply migrations:
   ```bash
   python manage.py makemigrations Staff Portfolio Chatbot EDA ML
   python manage.py migrate
   ```
6. Start the Django server:
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend/Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## � Deployment with PM2

To keep the services running in the background:

**Backend:**
```bash
cd backend/Portfolio_Project
pm2 start venv\Scripts\python.exe --name stockwhiz-backend -- manage.py runserver 0.0.0.0:8000
```

**Frontend:**
```bash
cd frontend/Frontend
pm2 start npm --name stockwhiz-frontend -- run dev -- --host
```

## �🔐 Authentication & Access

- **Default User**: `user` / `user` (Staff account)
- **Staff Signup**: Create a new account with **Name**, **Phone**, **Email**, and **Username** via the `/signup` route.
- **Staff Login**: Access your single-portfolio dashboard via the `/login` route.
- **Token Security**: Tokens are cryptographically signed and stored in local storage for session persistence.

---
Developed as a Portfolio Django Project.
