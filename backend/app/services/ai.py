"""
app/services/ai.py
------------------
All communication with Google Gemini AI lives here.

Two functions are exposed:
  breakdown_task()   — given a task title + description, returns a list of subtasks
  analyze_reward()   — given a reward name + description, suggests a fair points cost

Why a separate file?
  Keeping AI logic here means the API endpoints (subtasks.py, rewards.py)
  stay clean and readable. If we ever switch from Gemini to another AI,
  we only change this one file.

How Gemini works (simple version):
  1. We send a text prompt (a question/instruction) to Gemini
  2. Gemini sends back a text response
  3. We parse that text into Python data (a list or a dict)
  4. We return it to the endpoint that called us
"""

import json
import re

import google.generativeai as genai

from app.config import GOOGLE_API_KEY


def _get_model():
    """
    Configure and return the Gemini model.
    Called every time we need AI — checks the key is present first.
    """
    if not GOOGLE_API_KEY:
        raise ValueError(
            "GOOGLE_API_KEY is not set in your .env file. "
            "Get a free key at https://aistudio.google.com/app/apikey "
            "and add it to your .env file."
        )
    genai.configure(api_key=GOOGLE_API_KEY)
    # gemini-1.5-flash is fast and free-tier friendly
    return genai.GenerativeModel("gemini-1.5-flash")


def _extract_json(text: str) -> str:
    """
    Strip markdown code fences from Gemini's response if present.

    Gemini sometimes wraps JSON in ```json ... ``` even when we ask it not to.
    This function removes those fences so json.loads() can parse it cleanly.

    Example input:  ```json\n[{"title": "Do X"}]\n```
    Example output: [{"title": "Do X"}]
    """
    text = text.strip()
    # Remove ```json ... ``` or ``` ... ``` wrappers
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


# ── Function 1: Break down a task into subtasks ────────────────────────────────

def breakdown_task(task_title: str, task_description: str) -> list[dict]:
    """
    Ask Gemini to split a task into 5–8 actionable subtasks.

    Returns a list of dicts like:
        [
            {"title": "Research the topic", "estimated_time": 20},
            {"title": "Write the outline",  "estimated_time": 15},
            ...
        ]

    If AI fails for any reason, returns an empty list (the endpoint
    handles this gracefully by telling the frontend AI is unavailable).

    Parameters:
        task_title       — e.g. "Build a login page"
        task_description — e.g. "Create a form with email, password, and submit button"
    """
    model = _get_model()

    prompt = f"""
You are a productivity assistant. Break down the following task into 5 to 8 small,
actionable subtasks that a developer can complete one by one.

Task Title: {task_title}
Task Description: {task_description if task_description else "No description provided"}

Rules:
- Each subtask should take 10 to 60 minutes
- Subtasks should be in a logical order
- Be specific and actionable (start with a verb like "Create", "Write", "Test", "Add")
- Return ONLY a valid JSON array, no explanation, no markdown, no extra text

Return format (copy this exactly):
[
    {{"title": "Subtask title here", "estimated_time": 30}},
    {{"title": "Another subtask", "estimated_time": 20}}
]
"""

    try:
        response = model.generate_content(prompt)
        clean_json = _extract_json(response.text)
        subtasks = json.loads(clean_json)

        # Validate the structure we got back
        if not isinstance(subtasks, list):
            return []

        # Make sure each item has at least a title
        validated = []
        for item in subtasks:
            if isinstance(item, dict) and "title" in item:
                validated.append({
                    "title": str(item["title"]),
                    "estimated_time": int(item.get("estimated_time", 30)),
                })

        return validated

    except (json.JSONDecodeError, ValueError, Exception):
        # If anything goes wrong with AI, return empty list
        # The endpoint will tell the user AI is temporarily unavailable
        return []


# ── Function 2: Suggest a fair points cost for a reward ───────────────────────

def analyze_reward(reward_name: str, reward_description: str) -> dict:
    """
    Ask Gemini to suggest a fair points cost for a real-life reward.

    The idea: bigger/more indulgent rewards should cost more points,
    encouraging the user to complete more tasks to earn them.

    Returns a dict like:
        {
            "suggested_cost": 150,
            "reasoning": "30 minutes of social media is a moderate indulgence..."
        }

    If AI fails, returns a safe default of 100 points.

    Parameters:
        reward_name        — e.g. "30 minutes of Instagram"
        reward_description — e.g. "Scroll Instagram guilt-free for half an hour"
    """
    model = _get_model()

    prompt = f"""
You are a gamification expert helping someone stay productive.
They earn points by completing tasks, and spend points on real-life rewards.

Suggest a fair points cost for this reward (between 50 and 500 points).

Reward Name: {reward_name}
Reward Description: {reward_description if reward_description else "No description provided"}

Pricing guide:
- 50–100 points  = small reward (5-min break, a glass of water, a short walk)
- 100–200 points = medium reward (15–30 min of leisure, a snack, an episode of a show)
- 200–350 points = large reward (an hour of gaming, ordering food, a movie)
- 350–500 points = big reward (a full day off, a purchase, a special outing)

Rules:
- Return ONLY valid JSON, no explanation outside the JSON, no markdown
- Be encouraging — rewards should feel achievable but earned

Return format (copy this exactly):
{{"suggested_cost": 150, "reasoning": "Your one sentence explanation here"}}
"""

    try:
        response = model.generate_content(prompt)
        clean_json = _extract_json(response.text)
        result = json.loads(clean_json)

        # Validate the structure
        if not isinstance(result, dict):
            return {"suggested_cost": 100, "reasoning": "Default cost applied."}

        suggested_cost = int(result.get("suggested_cost", 100))
        # Clamp to allowed range
        suggested_cost = max(50, min(500, suggested_cost))

        return {
            "suggested_cost": suggested_cost,
            "reasoning": str(result.get("reasoning", "AI suggested this cost.")),
        }

    except (json.JSONDecodeError, ValueError, Exception):
        return {
            "suggested_cost": 100,
            "reasoning": "Could not get AI suggestion. Default cost applied.",
        }