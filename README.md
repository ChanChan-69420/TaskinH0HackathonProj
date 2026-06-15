# Gamified To-Do List Application

This project is split into a Next.js frontend and a FastAPI (Python) backend to keep the directory structure neat and organized.

## Project Structure

* **`frontend/`**: The Next.js web application built with React, TailwindCSS, and Shadcn UI.
* **`backend/`**: The FastAPI Python backend handling authentication, tasks, gamification, and database logic.

---

## Getting Started

### 1. Frontend Setup

To set up and run the frontend development server:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

### 2. Backend Setup

To set up and run the backend API server:

```bash
# Navigate to the backend directory
cd backend

# Create a Python virtual environment (if not already done)
python -m venv venv

# Activate the virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Windows (CMD):
.\venv\Scripts\activate.bat
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn app.main:app --reload
```

The backend API will run on [http://localhost:8000](http://localhost:8000). You can access interactive API documentation at [http://localhost:8000/docs](http://localhost:8000/docs).
