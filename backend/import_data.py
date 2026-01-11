from pymongo import MongoClient
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Mongo DB connection
client = MongoClient(os.getenv("MONGODB_URI"))
db = client["blackcoffer_db"]
collection = db["data"]

# Load JSON file
with open("jsondata.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Insert into MongoDB
collection.insert_many(data)

print("Data imported successfully!")
