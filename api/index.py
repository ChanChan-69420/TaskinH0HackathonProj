"""
api/index.py
------------
Vercel Serverless Function entry point.

This file is the bridge between Vercel's Python runtime (@vercel/python)
and the FastAPI application defined in backend/app/main.py.

Vercel routes all /api/* requests here via vercel.json rewrites.
The @vercel/python runtime automatically detects the ASGI `app` variable
and wraps it for the serverless environment.
"""

import sys
import os

# Resolve the absolute path to the backend/ directory so that
# internal imports like `from app.config import ...` resolve
# to backend/app/config.py (not the Next.js app/ directory at root).
_BACKEND_DIR = os.path.normpath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend")
)

if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

# Import the FastAPI application instance.
# Vercel's Python runtime picks up the `app` variable automatically.
from app.main import app  # noqa: E402, F401
