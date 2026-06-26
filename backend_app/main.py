"""
app/main.py
-----------
FastAPI application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend_app.config import ALLOWED_ORIGINS
from backend_app.database.connection import engine
from backend_app.database.base import Base

# Import all models so Base.metadata knows every table
try:
    import backend_app.models  # noqa: F401
    Base.metadata.create_all(bind=engine)

    # Auto-migration for tasks, rewards, and users tables
    from sqlalchemy import text
    with engine.connect() as conn:
        is_sqlite = engine.dialect.name == "sqlite"
        statements = [
            ("tasks", "difficulty", "ALTER TABLE tasks ADD COLUMN difficulty VARCHAR(20) DEFAULT 'Normal';" if is_sqlite else "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'Normal';"),
            ("rewards", "redeemed", "ALTER TABLE rewards ADD COLUMN redeemed BOOLEAN DEFAULT FALSE;" if is_sqlite else "ALTER TABLE rewards ADD COLUMN IF NOT EXISTS redeemed BOOLEAN DEFAULT FALSE;"),
            ("users", "reset_otp", "ALTER TABLE users ADD COLUMN reset_otp VARCHAR(10) NULL;" if is_sqlite else "ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp VARCHAR(10) NULL;"),
            ("users", "reset_otp_expires_at", "ALTER TABLE users ADD COLUMN reset_otp_expires_at TIMESTAMP NULL;" if is_sqlite else "ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp_expires_at TIMESTAMP NULL;"),
            ("users", "has_completed_onboarding", "ALTER TABLE users ADD COLUMN has_completed_onboarding BOOLEAN DEFAULT FALSE;" if is_sqlite else "ALTER TABLE users ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT FALSE;"),
            ("users", "avatar_id", "ALTER TABLE users ADD COLUMN avatar_id VARCHAR(50) DEFAULT 'avatar-male';" if is_sqlite else "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_id VARCHAR(50) DEFAULT 'avatar-male';"),
            ("user_gamification", "current_streak", "ALTER TABLE user_gamification ADD COLUMN current_streak INTEGER DEFAULT 0;" if is_sqlite else "ALTER TABLE user_gamification ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;"),
            ("user_gamification", "last_active_at", "ALTER TABLE user_gamification ADD COLUMN last_active_at DATE NULL;" if is_sqlite else "ALTER TABLE user_gamification ADD COLUMN IF NOT EXISTS last_active_at DATE NULL;")
        ]
        for table, col, sql in statements:
            try:
                conn.execute(text(sql))
                conn.commit()
            except Exception as e:
                err_msg = str(e).lower()
                if "duplicate column" in err_msg or "already exists" in err_msg or "duplicate column name" in err_msg:
                    pass
                else:
                    print(f"Skipping migration for {table}.{col}: {e}")
except Exception as e:
    print(f"Database initialization failed at startup: {e}")

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
from backend_app.api.auth import router as auth_router          # Part 2
from backend_app.api.tasks import router as tasks_router        # Part 3
from backend_app.api.subtasks import router as subtasks_router  # Part 4
from backend_app.api.rewards import router as rewards_router    # Part 5
from backend_app.api.gamification import router as stats_router # Part 6

app.include_router(auth_router,    prefix="/api", tags=["Auth"])
app.include_router(tasks_router,   prefix="/api", tags=["Tasks"])
app.include_router(subtasks_router,prefix="/api", tags=["Subtasks"])
app.include_router(rewards_router, prefix="/api", tags=["Rewards"])
app.include_router(stats_router,   prefix="/api", tags=["Gamification"])


@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Gamified To-Do API is running"}