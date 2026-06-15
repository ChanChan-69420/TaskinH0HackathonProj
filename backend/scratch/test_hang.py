import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

print("Step 1: Importing database connection...")
from app.database.connection import engine
print("Step 1 OK: Database engine initialized.")

print("Step 2: Connecting to database engine...")
try:
    with engine.connect() as conn:
        print("Step 2 OK: Connection to engine succeeded.")
except Exception as e:
    print(f"Step 2 Failed: Connection error: {e}")

print("Step 3: Creating metadata tables...")
from app.database.base import Base
import app.models
Base.metadata.create_all(bind=engine)
print("Step 3 OK: Metadata tables created.")

print("Step 4: Running auto-migrations...")
from sqlalchemy import text
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'Normal';"))
        conn.execute(text("ALTER TABLE rewards ADD COLUMN IF NOT EXISTS redeemed BOOLEAN DEFAULT FALSE;"))
        conn.commit()
        print("Step 4 OK: Auto-migrations complete.")
    except Exception as e:
        print(f"Step 4 Failed: Migration error: {e}")

print("Step 5: Importing app.main...")
import app.main
print("Step 5 OK: Main imported successfully!")
