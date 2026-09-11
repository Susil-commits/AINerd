"""
Extract real student response sequences from the ASSISTments 2009-2010 Skill Builder dataset.
Source: pyBKT official benchmark dataset (CAHLR/pyBKT-examples/master/data/as.csv)
"""
import urllib.request
import io
import csv
import json
import sys
from collections import defaultdict
from pathlib import Path

if sys.platform == "win32":
    try:
        getattr(sys.stdout, "reconfigure", lambda **_: None)(encoding="utf-8")
    except Exception:
        pass

TARGET_SKILLS = {
    "Equation Solving Two or Fewer Steps": {
        "skill_id": "6.EE.B.7",
        "skill_name": "Solving one-step equations"
    },
    "Addition and Subtraction Fractions": {
        "skill_id": "4.NF.B.3",
        "skill_name": "Adding and subtracting fractions"
    },
    "Equivalent Fractions": {
        "skill_id": "4.NF.A.1",
        "skill_name": "Equivalent fractions"
    },
    "Equation Solving More Than Two Steps": {
        "skill_id": "7.EE.B.4",
        "skill_name": "Solving multi-step equations"
    }
}

def main():
    url = "https://raw.githubusercontent.com/CAHLR/pyBKT-examples/master/data/as.csv"
    print(f"📥 Downloading ASSISTments 2009-2010 dataset from:\n   {url}")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode("latin1")

    print(f"✅ Downloaded {len(content) / (1024*1024):.1f} MB of interaction logs.")
    reader = csv.DictReader(io.StringIO(content))
    skill_user_sequences = {k: defaultdict(list) for k in TARGET_SKILLS}

    for row in reader:
        skill = row.get("skill_name")
        if skill in TARGET_SKILLS:
            user = row.get("user_id")
            correct = row.get("correct")
            order = int(row.get("order_id", 0))
            if correct in ("0", "1") and user:
                skill_user_sequences[skill][user].append((order, int(correct)))

    out_data = {
        "dataset": "ASSISTments 2009-2010 Skill Builder",
        "source_url": url,
        "skills": {}
    }

    for assist_name, meta in TARGET_SKILLS.items():
        user_dict = skill_user_sequences[assist_name]
        seqs = []
        for u, items in user_dict.items():
            items.sort(key=lambda x: x[0])
            seqs.append([x[1] for x in items])
        # Filter for meaningful sequences (>= 2 attempts)
        valid_seqs = [s for s in seqs if len(s) >= 2]
        sid = meta["skill_id"]
        out_data["skills"][sid] = {
            "skill_name": meta["skill_name"],
            "assistments_skill_name": assist_name,
            "total_students": len(valid_seqs),
            "total_observations": sum(len(s) for s in valid_seqs),
            "sequences": valid_seqs
        }
        print(f"   • {sid} ({assist_name}): {len(valid_seqs)} students, {sum(len(s) for s in valid_seqs)} responses")

    out_path = Path(__file__).parent.parent / "data" / "assistments_sequences.json"
    out_path.parent.mkdir(exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out_data, f, indent=2)

    print(f"💾 Saved extracted real student sequences to:\n   {out_path} ({out_path.stat().st_size / 1024:.1f} KB)")

if __name__ == "__main__":
    main()
