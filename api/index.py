"""
api/index.py
------------
Vercel Serverless Function entry point.

This file is the bridge between Vercel's Python runtime (@vercel/python)
and the FastAPI application defined in backend_app/main.py.

Vercel routes all /api/* requests here via vercel.json rewrites.
The @vercel/python runtime automatically detects the ASGI `app` variable
and wraps it for the serverless environment.
"""

# With backend_app at the repository root, there's no path conflicts
# and Vercel automatically bundles it for us via zero-config!
from backend_app.main import app  # noqa: E402, F401
