# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import os
import json

app = FastAPI()

# Allow frontend dev server (React) to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to your domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = Path(__file__).parent / "jsondata.json"

# Try MongoDB first if you have MONGODB_URI in .env, else fallback to local json file
try:
    from pymongo import MongoClient
    from dotenv import load_dotenv
    load_dotenv()
    MONGO_URI = os.getenv("MONGODB_URI")
    if MONGO_URI:
        client = MongoClient(MONGO_URI)
        db = client.get_default_database()  # or db name
        coll = db.get_collection("data")
        use_mongo = True
    else:
        use_mongo = False
except Exception:
    use_mongo = False

@app.get("/")
def home():
    return {"message": "Backend running"}

@app.get("/data")
def get_all_data():
    """
    Returns {"data": [...] } matching the frontend expectation.
    """
    try:
        if use_mongo:
            docs = list(coll.find({}, {"_id": 0}))
            return {"data": docs}
        else:
            if not DATA_PATH.exists():
                raise HTTPException(status_code=404, detail="jsondata.json not found")
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                raw = json.load(f)
                # If file stores an object {"data": [...] } or list directly handle both
                if isinstance(raw, dict) and "data" in raw:
                    return {"data": raw["data"]}
                if isinstance(raw, list):
                    return {"data": raw}
                return {"data": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
