from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
MERCURY_DIR = ROOT / "docs" / "mercury"
INDEX_PATH = MERCURY_DIR / "source-index.json"
TACTICS_PATH = MERCURY_DIR / "distilled" / "tactics.json"
OUTPUT_PATH = MERCURY_DIR / "training-candidates.jsonl"


def load_json(path: Path) -> dict:
    if not path.exists():
        raise FileNotFoundError(f"Missing file: {path}")
    return json.loads(path.read_text())


def build_examples(index_payload: dict, tactics_payload: dict) -> list[dict]:
    entries = index_payload.get("entries", [])
    tactics = tactics_payload.get("tactics", [])
    examples: list[dict] = []

    for idx, tactic in enumerate(tactics, start=1):
        source_ids = tactic.get("source_ids", [])
        source_subset = [entry for entry in entries if entry.get("source_id") in source_ids][:4]

        examples.append(
            {
                "input_context": {
                    "objective": "paid_conversions",
                    "kpis": {
                        "landingConversionRate": 0.025,
                        "checkoutConversionRate": 0.031,
                        "paidCount": 22,
                    },
                    "signals": [
                        {
                            "id": f"signal-{idx}",
                            "theme": tactic.get("category"),
                            "evidenceStrength": 0.72,
                        }
                    ],
                    "citations": [source.get("source_id") for source in source_subset],
                },
                "target_decision": {
                    "decision_id": f"train-decision-{idx}",
                    "objective": "paid_conversions",
                    "ranked_experiments": [
                        {
                            "title": tactic.get("summary"),
                            "expected_lift": 0.018,
                            "confidence": 0.74,
                            "effort": 0.4,
                            "risk": 0.3,
                            "time_to_signal": 7,
                        }
                    ],
                    "guardrail_status": "pass" if tactic.get("status") != "rejected" else "blocked",
                    "required_approval": True,
                    "source_citations": [source.get("source_id") for source in source_subset],
                },
                "rationale": tactic.get("gutbrain_adaptation", ""),
                "rejected_alternatives": ["high-risk tactic", "low-evidence tactic"],
                "policy_labels": [tactic.get("status", "adapted")],
                "outcome_labels": {
                    "result": "pending",
                    "confidence_calibration": 0.5,
                },
            }
        )

    return examples


def main() -> None:
    index_payload = load_json(INDEX_PATH)
    tactics_payload = load_json(TACTICS_PATH)
    examples = build_examples(index_payload, tactics_payload)

    with OUTPUT_PATH.open("w", encoding="utf-8") as handle:
        for example in examples:
            handle.write(json.dumps(example) + "\n")


if __name__ == "__main__":
    main()
