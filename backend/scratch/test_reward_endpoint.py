import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.models.user import User
from app.models.reward import Reward

db: Session = SessionLocal()
try:
    user = db.query(User).first()
    if not user:
        print("No users found! Let's create a dummy user.")
        user = User(
            email="test_user@example.com",
            username="testuser",
            password_hash="dummy_hash"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Created user: {user.username} with ID {user.id}")
    else:
        print(f"Found existing user: {user.username} with ID {user.id}")
        
    print("Trying to create a reward...")
    reward = Reward(
        user_id=user.id,
        name="Test Reward",
        description="Test description",
        cost=150
    )
    db.add(reward)
    db.commit()
    db.refresh(reward)
    print(f"Successfully created reward: {reward.name} (ID: {reward.id})")
    
    # Clean up
    db.delete(reward)
    db.commit()
    print("Deleted test reward successfully.")
    
except Exception as e:
    print("An error occurred:")
    import traceback
    traceback.print_exc()
finally:
    db.close()
