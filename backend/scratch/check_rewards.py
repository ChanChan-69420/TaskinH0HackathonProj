from sqlalchemy import create_engine, inspect
from app.config import DATABASE_URL

engine = create_engine(DATABASE_URL)
insp = inspect(engine)
try:
    cols = insp.get_columns("rewards")
    print("Columns in 'rewards' table:")
    for col in cols:
        print(f" - {col['name']}: {col['type']}")
except Exception as e:
    print("Error:", e)
