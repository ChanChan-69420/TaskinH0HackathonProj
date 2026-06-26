from fastapi.testclient import TestClient
from app.main import app
from app.database.connection import SessionLocal
from app.models.user import User

client = TestClient(app)

# Create a user directly in DB
db = SessionLocal()
user = db.query(User).first()
if not user:
    user = User(email="test@test.com", username="test", password_hash="test")
    db.add(user)
    db.commit()
    db.refresh(user)

from app.api.auth import create_access_token
token = create_access_token(str(user.id))
headers = {"Authorization": f"Bearer {token}"}

# 1. Create Task
res1 = client.post("/api/tasks", json={
    "title": "Test Task",
    "description": "Test Desc",
    "priority": "high",
    "difficulty": "Normal"
}, headers=headers)
print("Create Task:", res1.status_code, res1.text)

if res1.status_code == 201:
    task_id = res1.json()["id"]

    # 2. Add subtask
    res2 = client.post(f"/api/tasks/{task_id}/subtasks", json={
        "title": "Test Subtask"
    }, headers=headers)
    print("Add Subtask:", res2.status_code, res2.text)

    # 3. Get Task
    res3 = client.get(f"/api/tasks/{task_id}", headers=headers)
    print("Get Task:", res3.status_code, res3.text)
