<div align="center">

# 🚀 FinVise.AI

### AI-Powered Financial Analysis Platform

Analyze publicly traded companies using real-time financial data, interactive visualizations, and AI-generated investment insights.

<p align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</p>

*A modern full-stack financial analysis platform powered by AI.*

</div>

---

# 📖 Overview

FinVise.AI is a modern AI-powered financial analysis platform that enables users to evaluate publicly traded companies using real-time financial market data and advanced AI models.

The platform combines financial metrics, historical stock charts, AI-generated investment reports, personalized watchlists, secure authentication, and support for both cloud and local AI models into a clean and intuitive dashboard.

The application focuses on delivering institutional-style stock analysis while maintaining an easy-to-use user experience.

---

# ✨ Features

## 📊 Dashboard

- Real-time stock analysis
- Company overview
- Financial health metrics
- Interactive historical price charts
- AI-generated financial reports
- Investment strengths & risks
- AI investment verdict
- Cached AI analysis
- Refresh Analysis button
- Persistent dashboard history
- Market status indicator

---

## ⭐ Watchlist

- Personalized watchlist
- Add stocks directly from Dashboard
- Remove stocks
- Search watchlist
- Import watchlist
- Mini trend charts
- AI verdict indicators
- Market status
- Market overview cards
- Live watchlist updates
- One-click dashboard analysis

---

## ⚙️ Settings

- User profile
- Display name management
- AI engine selection
- Persistent user preferences
- Secure session management

---

## 🤖 AI Engines

### ☁️ Groq Cloud AI

- Fast inference
- High reasoning capability
- Llama 3.3 70B

### 💻 Ollama Local AI

- Offline inference
- Local execution
- phi3:mini model
- Privacy-focused workflow

---

## 🔐 Authentication

- User Registration
- Email & Password Login
- JWT Authentication
- Protected Routes
- Secure Password Hashing
- User-specific Dashboard
- User-specific Watchlist
- Persistent User Sessions

---

# 🛠 Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts
- Lucide React

---

## Backend

- FastAPI
- Python
- JWT Authentication
- REST APIs
- SQLAlchemy

---

## AI

- Ollama
- Groq API
- Llama 3.3 70B
- phi3:mini

---

## APIs

- Finnhub API

---

## Database

- SQLite

---

# 📂 Project Structure

```text
FinVise.AI
│
├── frontend
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   └── styles/
│
├── backend
│   ├── api/
│   ├── auth/
│   ├── database/
│   ├── models/
│   ├── routes/
│   ├── schemas/
│   ├── services/
│   └── utils/
│
└── README.md
```

---

# 🚀 Core Functionalities

### 📈 Stock Analysis

- Company Profile
- Market Price
- P/E Ratio
- Debt-to-Equity
- Gross Profit Margin
- Historical Price Charts
- Market Status
- AI Financial Analysis
- Investment Verdict

---

### 📑 AI Advisory Report

Each report includes:

- Executive Summary
- Company Overview
- Financial Strengths
- Investment Risks
- AI Verdict
- Investment Recommendation

---

### 👤 User Workspace

Every registered user has their own isolated workspace.

- Dashboard History
- AI Analysis Cache
- Watchlist
- Settings
- Authentication Session

No user can access another user's data.

---

# 🔒 Security

- JWT Authentication
- Password Hashing
- Protected API Routes
- Secure Session Management
- User Data Isolation

---

# 📊 Application Workflow

```text
User Login
      │
      ▼
Dashboard
      │
Search Stock
      │
      ▼
Fetch Real-Time Market Data
      │
      ▼
Generate AI Report
      │
      ▼
Save Analysis
      │
      ▼
Display Dashboard
      │
      ▼
Add to Watchlist
      │
      ▼
Refresh AI Analysis Anytime
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/FinVise.AI.git

cd FinVise.AI
```

---

## Backend Setup

Create virtual environment

```bash
python -m venv .venv
```

Windows

```bash
.venv\Scripts\activate
```

Linux / macOS

```bash
source .venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run FastAPI

```bash
uvicorn app.main:app --reload
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

# 🔑 Environment Variables

Backend `.env`

```env
FINNHUB_API_KEY=your_finnhub_api_key

GROQ_API_KEY=your_groq_api_key

JWT_SECRET=your_secret_key
```

---

# 🖥 Screenshots

Add your project screenshots here.

```
Landing Page

Dashboard

Watchlist

Settings

Login

Registration
```

---

# 🎯 Future Roadmap

- 📊 Stock Comparison
- 📈 Portfolio Management
- 🔍 Advanced Stock Screener
- 📰 Financial News Integration
- 🔔 Price Alerts
- 📄 PDF Report Export
- 🤖 AI Chat Assistant
- 🌙 Enhanced Dark Theme
- 📱 Progressive Web App (PWA)
- ☁️ Cloud Deployment

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository

2. Create a new branch

```bash
git checkout -b feature/new-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push the branch

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

# 📜 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Sujal Kanchan**

- GitHub: https://github.com/sujalvk888
- Project: FinVise.AI

---

<div align="center">

### ⭐ If you found this project helpful, consider giving it a star!

Built with ❤️ using **Next.js**, **FastAPI**, **Tailwind CSS**, and **Artificial Intelligence**

</div>
