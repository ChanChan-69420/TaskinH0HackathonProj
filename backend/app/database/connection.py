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

# ── Engine ────────────────────────────────────────────────────────────────────
try:
    if DATABASE_URL.startswith("postgresql"):
        # Test connection quickly using a 20-second timeout
        test_engine = create_engine(DATABASE_URL, connect_args={"connect_timeout": 20})
        with test_engine.connect() as conn:
            pass
        test_engine.dispose()
        
        # Connection works! Setup the production PostgreSQL engine.
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            connect_args={"connect_timeout": 20},
        )
    else:
        engine = create_engine(DATABASE_URL)
except Exception as e:
    print(f"PostgreSQL connection failed: {e}")
    print("Falling back to local SQLite database (todo.db)...")
    engine = create_engine(
        "sqlite:///./todo.db",
        connect_args={"check_same_thread": False}
    )

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