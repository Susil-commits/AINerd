"""
Seed database with problems + generate Gemini embeddings.
Run once after setting up the Supabase schema.

Usage:
    cd backend
    python ../scripts/seed_db.py
"""
# pyright: reportMissingImports=false, reportMissingModuleSource=false
import os
import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))
if sys.platform == "win32":
    try:
        getattr(sys.stdout, "reconfigure", lambda **_: None)(encoding="utf-8")
    except Exception:
        pass

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

from pydantic import SecretStr
from db.supabase_client import get_supabase
from langchain_google_genai import GoogleGenerativeAIEmbeddings

SEED_FILE = Path(__file__).parent.parent / "data" / "seed_problems.json"


def embed_text(text: str, embeddings_model) -> list[float]:
    return embeddings_model.embed_query(text, output_dimensionality=768)


def main():
    print("🌱 Seeding database...")
    supabase = get_supabase()

    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=SecretStr(os.environ["GEMINI_API_KEY"]),
    )

    with open(SEED_FILE) as f:
        problems = json.load(f)

    print(f"   Loaded {len(problems)} problems")

    for i, p in enumerate(problems):
        # Generate embedding on the full problem text
        embed_input = f"{p['title']}: {p['text']}"
        embedding = embed_text(embed_input, embeddings)

        row = {
            "title": p["title"],
            "text": p["text"],
            "skill_id": p["skill_id"],
            "difficulty": p["difficulty"],
            "expected_steps": p["expected_steps"],
            "source": "hand_curated",
            "embedding": embedding,
        }

        result = supabase.table("problems").insert(row).execute()
        print(f"   [{i+1}/{len(problems)}] ✅ {p['title']} ({p['skill_id']})")

    print(f"\n✅ Done! {len(problems)} problems seeded.")
    print("   You can now start the backend: uvicorn main:app --reload")


if __name__ == "__main__":
    main()
