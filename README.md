# StockWhiz - Portfolio Management System

StockWhiz is a full-stack web application designed for data-driven investing. It allows users to explore market sectors, search for stocks, and manage custom investment portfolios with AI-powered opportunity insights.

## 🚀 Features

- **Single Portfolio Model**: Every staff member gets a personalized, auto-provisioned portfolio for tracking holdings.
- **Creative Market Exploration**: Interactive dashboard to browse through different market sectors (IT, Banking, Automobile, etc.).
- **Dynamic Portfolio Management**: Add stocks via live search or sector-specific filtering with real-time price updates.
- **AI-Powered Insights**: Automated classification of stocks into "Strong", "Moderate", or "Low" opportunity levels based on 52-week highs and current discounts.
- **Secure Staff Authentication**: Custom token-based authentication system using cryptographic signing for secure staff access.
- **Modern UI**: Fullscreen, responsive design with glassmorphism elements and a professional aesthetic.

## 🛠️ Tech Stack

**Frontend:**
- React.js (Vite)
- React Router DOM (Navigation)
- Axios (API Communication)
- CSS3 (Custom Styling & Glassmorphism)

**Backend:**
- Django (Web Framework)
- Django REST Framework (API)
- SQLite (Database)
- Custom Token Auth (Security)

## 📋 Installation & Setup

### Prerequisites
- Python 3.13.x
- Node.js & npm

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend/Portfolio_Project
   ```
2. Activate your virtual environment:
   ```powershell
   # Windows
   ..\..\venv\Scripts\activate
   ```
3. Apply migrations:
   ```bash
   python manage.py makemigrations Staff Portfolio
   python manage.py migrate
   ```
4. Start the Django server:
   ```bash
   python manage.py runserver 8000
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

## 🔐 Authentication & Access

- **Default User**: `user` / `user` (Staff account)
- **Staff Signup**: Create a new account with **Name**, **Phone**, **Email**, and **Username** via the `/signup` route.
- **Staff Login**: Access your single-portfolio dashboard via the `/login` route.
- **Token Security**: Tokens are cryptographically signed and stored in local storage for session persistence.

## 📸 Screenshots

*(Add your screenshots here)*

---
Developed as a Portfolio Django Project.
