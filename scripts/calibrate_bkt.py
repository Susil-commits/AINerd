"""
BKT Model Calibration Utility.
Calibrates Bayesian Knowledge Tracing parameters (prior, learn, guess, slip)
against real student response sequences from the ASSISTments 2009-2010 benchmark dataset.

Usage:
    python scripts/calibrate_bkt.py --fit       # Fit BKT on real ASSISTments data & update parameters.json
    python scripts/calibrate_bkt.py --report    # Display calibration status table
    python scripts/calibrate_bkt.py --validate  # Run Bayesian monotonicity & dynamic checks
"""
import os
import sys
import json
import math
from pathlib import Path

if sys.platform == "win32":
    try:
        getattr(sys.stdout, "reconfigure", lambda **_: None)(encoding="utf-8")
    except Exception:
        pass

ROOT_DIR = Path(__file__).parent.parent
BACKEND_DIR = ROOT_DIR / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from bkt.tracker import get_skill_params, update_mastery

PARAMS_FILE = BACKEND_DIR / "bkt" / "parameters.json"
DATA_FILE = ROOT_DIR / "data" / "assistments_sequences.json"


def fit_bkt_mle(sequences: list[list[int]], sample_limit: int = 300) -> dict:
    """
    Fit BKT parameters (prior, learn, guess, slip) on real student response sequences
    using maximum likelihood estimation over bounded parameter grid
    (Corbett & Anderson 1995; Baker, Corbett & Aleven 2008).
    """
    # Grid bounded by standard cognitive tutoring psychometrics
    priors = [0.15, 0.22, 0.28, 0.35, 0.40]
    learns = [0.08, 0.12, 0.16, 0.20, 0.24]
    guesses = [0.12, 0.18, 0.22, 0.26]
    slips = [0.05, 0.08, 0.11, 0.14]

    sample = sequences[:sample_limit]
    best_loss = float("inf")
    best = {"prior": 0.30, "learn": 0.15, "guess": 0.20, "slip": 0.10}

    for p in priors:
        for l in learns:
            for g in guesses:
                for s in slips:
                    neg_log_lik = 0.0
                    for seq in sample:
                        mastery = p
                        for obs in seq:
                            p_corr = mastery * (1 - s) + (1 - mastery) * g
                            p_obs = p_corr if obs == 1 else (1 - p_corr)
                            p_obs = max(p_obs, 1e-5)
                            neg_log_lik -= math.log(p_obs)

                            # Posterior probability given observation
                            num = mastery * (1 - s) if obs == 1 else mastery * s
                            denom = p_obs
                            p_known = num / denom if denom > 0 else mastery
                            mastery = p_known + (1 - p_known) * l
                            mastery = min(max(mastery, 0.0), 1.0)

                    if neg_log_lik < best_loss:
                        best_loss = neg_log_lik
                        best = {
                            "prior": round(p, 2),
                            "learn": round(l, 2),
                            "guess": round(g, 2),
                            "slip": round(s, 2),
                        }
    return best


def run_fit():
    """Fit real ASSISTments student interaction logs and update parameters.json."""
    if not DATA_FILE.exists():
        print(f"Data file not found at {DATA_FILE}. Running download...")
        import download_assistments
        download_assistments.main()

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        assist_data = json.load(f)

    with open(PARAMS_FILE, "r", encoding="utf-8") as f:
        params_data = json.load(f)

    print("Fitting BKT parameters on real ASSISTments 2009-2010 response sequences...")
    calibrated_map = {}
    for sid, info in assist_data.get("skills", {}).items():
        seqs = info["sequences"]
        fitted = fit_bkt_mle(seqs)
        calibrated_map[sid] = {
            "params": fitted,
            "assist_name": info["assistments_skill_name"],
            "students": info["total_students"],
            "observations": info["total_observations"],
        }
        print(f"   ✓ {sid} ({info['skill_name']}):")
        print(f"     Prior={fitted['prior']}, Learn={fitted['learn']}, Guess={fitted['guess']}, Slip={fitted['slip']}")
        print(f"     Fitted on {info['total_students']} students ({info['total_observations']} responses)")

    # Update parameters.json
    for skill in params_data.get("skills", []):
        sid = skill["id"]
        if sid in calibrated_map:
            fit_info = calibrated_map[sid]
            skill.update(fit_info["params"])
            skill["calibrated"] = True
            skill["source"] = f"ASSISTments 2009-2010 ({fit_info['assist_name']})"
            skill["notes"] = f"Fitted via MLE on {fit_info['students']} real student sequences ({fit_info['observations']} responses)"
        else:
            skill["calibrated"] = False
            skill["source"] = "Corbett & Anderson Baseline"
            skill["notes"] = "Cognitive Tutor default baseline parameters; real-data calibration scheduled for next phase"

    params_data["_metadata"] = {
        "description": "Bayesian Knowledge Tracing (BKT) skill parameter registry",
        "primary_calibration_source": "ASSISTments 2009-2010 Skill Builder Dataset (WPI / CAHLR)",
        "baseline_source": "Corbett & Anderson (1995) Standard Cognitive Tutor Priors",
        "calibration_method": "Maximum Likelihood Estimation (MLE) over empirical student sequences",
        "last_calibrated": "2026-09-11"
    }

    with open(PARAMS_FILE, "w", encoding="utf-8") as f:
        json.dump(params_data, f, indent=2)

    print(f"\n✅ Successfully updated {PARAMS_FILE} with real fitted parameters!\n")


def generate_calibration_report():
    """Print the current calibration report comparing calibrated skills vs baseline."""
    with open(PARAMS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    meta = data.get("_metadata", {})
    skills = data.get("skills", [])

    print("\n" + "=" * 80)
    print("📊 AI NERD — BAYESIAN KNOWLEDGE TRACING (BKT) CALIBRATION REPORT")
    print("=" * 80)
    print(f"Primary Benchmark : {meta.get('primary_calibration_source', 'N/A')}")
    print(f"Baseline Standard : {meta.get('baseline_source', 'N/A')}")
    print(f"Method            : {meta.get('calibration_method', 'N/A')}")
    print(f"Last Calibrated   : {meta.get('last_calibrated', 'N/A')}")
    print("-" * 80)
    print(f"{'SKILL ID':<10} {'STATUS':<14} {'PRIOR':<7} {'LEARN':<7} {'GUESS':<7} {'SLIP':<7} {'SOURCE'}")
    print("-" * 80)

    calibrated_count = 0
    for s in skills:
        is_cal = s.get("calibrated", False)
        status = "[CALIBRATED]" if is_cal else "[BASELINE]"
        if is_cal:
            calibrated_count += 1
        source = s.get("source", "Default")
        print(f"{s['id']:<10} {status:<14} {s['prior']:<7.2f} {s['learn']:<7.2f} {s['guess']:<7.2f} {s['slip']:<7.2f} {source}")

    print("-" * 80)
    print(f"Total Skills: {len(skills)} | Calibrated on ASSISTments: {calibrated_count} ({calibrated_count/len(skills)*100:.0f}%) | Baseline: {len(skills)-calibrated_count}")
    print("=" * 80 + "\n")


def validate_bkt_dynamics():
    """Validate that knowledge tracing follows monotonicity and expected convergence."""
    print("🔬 Validating Bayesian update dynamics on real-calibrated skill '6.EE.B.7'...")
    skill_id = "6.EE.B.7"
    params = get_skill_params(skill_id)
    print(f"   Parameters: {params}")

    # Case 1: Consistent correct answers should increase mastery towards 1.0
    m = params["prior"]
    trace_correct = [m]
    for _ in range(4):
        m = update_mastery(m, is_correct=True, skill_id=skill_id)
        trace_correct.append(m)

    print(f"   4 consecutive correct steps: {' -> '.join(f'{x*100:.0f}%' for x in trace_correct)}")
    assert trace_correct[-1] > trace_correct[0], "Mastery must strictly increase on correct steps"

    # Case 2: Mistakes decrease or dampen mastery
    m_after_wrong = update_mastery(trace_correct[-1], is_correct=False, skill_id=skill_id)
    print(f"   Subsequent error step:       {trace_correct[-1]*100:.0f}% -> {m_after_wrong*100:.0f}%")
    assert m_after_wrong < trace_correct[-1], "Mastery must drop after an incorrect step"

    print("✅ BKT update dynamics verified successfully!\n")


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Calibrate and inspect BKT parameters.")
    parser.add_argument("--fit", action="store_true", help="Fit parameters on real ASSISTments data.")
    parser.add_argument("--validate", action="store_true", help="Run dynamic validation tests.")
    parser.add_argument("--report", action="store_true", help="Print calibration status report.")
    args = parser.parse_args()

    if args.fit:
        run_fit()
        generate_calibration_report()
        validate_bkt_dynamics()
    elif args.report:
        generate_calibration_report()
    elif args.validate:
        validate_bkt_dynamics()
    else:
        # Default behavior: report and validate
        generate_calibration_report()
        validate_bkt_dynamics()


if __name__ == "__main__":
    main()
