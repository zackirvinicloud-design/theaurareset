from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
MERCURY_DIR = ROOT / "docs" / "mercury"
INDEX_PATH = MERCURY_DIR / "source-index.json"
TACTICS_PATH = MERCURY_DIR / "distilled" / "tactics.json"
REPORTS_DIR = MERCURY_DIR / "reports"


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def read_json(path: Path) -> dict:
    if not path.exists():
        raise FileNotFoundError(path)
    return json.loads(path.read_text())


def main() -> None:
    index_payload = read_json(INDEX_PATH)
    tactics_payload = read_json(TACTICS_PATH)
    entries = index_payload.get("entries", [])
    tactics = tactics_payload.get("tactics", [])
    now = utc_now_iso()

    low_quality = [item for item in entries if float(item.get("transcript_quality_score", 0)) < 0.5]
    approved = [item for item in tactics if item.get("status") == "approved"]
    adapted = [item for item in tactics if item.get("status") == "adapted"]
    rejected = [item for item in tactics if item.get("status") == "rejected"]

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    report_path = REPORTS_DIR / f"weekly-{now[:10]}.md"
    report_path.write_text(
        "\n".join(
            [
                f"# MERCURY Weekly Report ({now[:10]})",
                "",
                f"- Objective: paid_conversions",
                f"- Sources indexed: {len(entries)}",
                f"- Low-quality warnings: {len(low_quality)}",
                f"- Approved tactics: {len(approved)}",
                f"- Adapted tactics: {len(adapted)}",
                f"- Rejected tactics: {len(rejected)}",
                "",
                "## Suggested focus",
                "- Keep top 3 experiments tied to checkout and landing conversion gaps.",
                "- Route all launch decisions through BRAINIAC approval.",
                "- Add failed experiments to next training candidate batch.",
                "",
            ]
        )
    )


if __name__ == "__main__":
    main()
