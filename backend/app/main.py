"""
app/main.py
-----------
FastAPI application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import ALLOWED_ORIGINS
from app.database.connection import engine
from app.database.base import Base

# Import all models so Base.metadata knows every table
import app.models  # noqa: F401
Base.metadata.create_all(bind=engine)

# Auto-migration for tasks.difficulty, rewards.redeemed, and streak columns
from sqlalchemy import text, inspect as sa_inspect
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'Normal';"))
        conn.execute(text("ALTER TABLE rewards ADD COLUMN IF NOT EXISTS redeemed BOOLEAN DEFAULT FALSE;"))
        conn.execute(text("ALTER TABLE user_gamification ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0 NOT NULL;"))
        conn.execute(text("ALTER TABLE user_gamification ADD COLUMN IF NOT EXISTS last_active_at DATE;"))
        conn.commit()
    except Exception:
        pass
    # SQLite fallback: ALTER TABLE without IF NOT EXISTS
    try:
        inspector = sa_inspect(engine)
        cols = [c["name"] for c in inspector.get_columns("user_gamification")]
        if "current_streak" not in cols:
            conn.execute(text("ALTER TABLE user_gamification ADD COLUMN current_streak INTEGER NOT NULL DEFAULT 0;"))
        if "last_active_at" not in cols:
            conn.execute(text("ALTER TABLE user_gamification ADD COLUMN last_active_at DATE;"))
        if "difficulty" not in cols:
            inspector2 = sa_inspect(engine)
            task_cols = [c["name"] for c in inspector2.get_columns("tasks")]
            if "difficulty" not in task_cols:
                conn.execute(text("ALTER TABLE tasks ADD COLUMN difficulty VARCHAR(20) DEFAULT 'Normal';"))
        if "redeemed" not in cols:
            inspector3 = sa_inspect(engine)
            rew_cols = [c["name"] for c in inspector3.get_columns("rewards")]
            if "redeemed" not in rew_cols:
                conn.execute(text("ALTER TABLE rewards ADD COLUMN redeemed BOOLEAN DEFAULT FALSE;"))
        conn.commit()
    except Exception as e:
        print(f"Skipping SQLite auto-migration: {e}")

app = FastAPI(
    title="Gamified To-Do API",
    description="Backend for the Gamified To-Do list app. Uses Gemini AI for task breakdown and reward pricing.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers (uncomment as each part is added) ─────────────────────────────────
from app.api.auth import router as auth_router          # Part 2
from app.api.tasks import router as tasks_router        # Part 3
from app.api.subtasks import router as subtasks_router  # Part 4
from app.api.rewards import router as rewards_router    # Part 5
from app.api.gamification import router as stats_router # Part 6

app.include_router(auth_router,    prefix="/api", tags=["Auth"])
app.include_router(tasks_router,   prefix="/api", tags=["Tasks"])
app.include_router(subtasks_router,prefix="/api", tags=["Subtasks"])
app.include_router(rewards_router, prefix="/api", tags=["Rewards"])
app.include_router(stats_router,   prefix="/api", tags=["Gamification"])


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Gamified To-Do API is running"}