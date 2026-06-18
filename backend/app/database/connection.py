"""
app/database/connection.py
--------------------------
Creates the SQLAlchemy engine and session factory.
Exposes `get_db()` as a FastAPI dependency that yields a DB session and
guarantees it is closed after each request.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.config import DATABASE_URL

# ── Engine (PostgreSQL only) ──────────────────────────────────────────────────
if DATABASE_URL.startswith("postgresql"):
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        connect_args={"connect_timeout": 20},
    )
else:
    engine = create_engine(DATABASE_URL)

# ── Session factory ───────────────────────────────────────────────────────────
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)


# ── FastAPI dependency ────────────────────────────────────────────────────────
def get_db():
    """
    Yield a SQLAlchemy session for the duration of a single request.
    Always closed in the finally block — even on exceptions.

    Usage in a route:
        def my_route(db: Session = Depends(get_db)):
            ...
    """
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()