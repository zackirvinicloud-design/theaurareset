from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
MERCURY_DIR = ROOT / "docs" / "mercury"
OUTPUT_PATH = MERCURY_DIR / "reports" / "calibration-backtest.json"


SAMPLE_RESULTS = [
    {"expected_lift": 0.03, "observed_lift": 0.022, "confidence": 0.78},
    {"expected_lift": 0.018, "observed_lift": 0.020, "confidence": 0.71},
    {"expected_lift": 0.011, "observed_lift": 0.005, "confidence": 0.62},
]


def main() -> None:
    errors = [abs(item["expected_lift"] - item["observed_lift"]) for item in SAMPLE_RESULTS]
    mae = sum(errors) / len(errors)
    false_high_conf = sum(1 for item in SAMPLE_RESULTS if item["confidence"] >= 0.7 and item["observed_lift"] < 0.01)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(
        json.dumps(
            {
                "samples": len(SAMPLE_RESULTS),
                "mean_absolute_error": round(mae, 4),
                "false_high_confidence_count": false_high_conf,
                "status": "ok" if mae <= 0.02 else "needs_recalibration",
            },
            indent=2,
        )
        + "\n"
    )


if __name__ == "__main__":
    main()
