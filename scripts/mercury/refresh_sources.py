from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
MERCURY_DIR = ROOT / "docs" / "mercury"
INDEX_PATH = MERCURY_DIR / "source-index.json"
REPORTS_DIR = MERCURY_DIR / "reports"
PLAYBOOK_DELTA_PATH = REPORTS_DIR / "playbook_changes.md"


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def load_index() -> dict:
    if not INDEX_PATH.exists():
        raise FileNotFoundError(f"Missing source index: {INDEX_PATH}")
    return json.loads(INDEX_PATH.read_text())


def write_index(payload: dict) -> None:
    INDEX_PATH.write_text(json.dumps(payload, indent=2) + "\n")


def refresh() -> None:
    payload = load_index()
    now = utc_now_iso()

    entries = payload.get("entries", [])
    superwall_count = 0
    julia_count = 0
    low_quality = 0

    for entry in entries:
        creator = str(entry.get("creator", "")).lower()
        if "superwall" in creator:
            superwall_count += 1
        if "julia" in creator:
            julia_count += 1

        quality = float(entry.get("transcript_quality_score", 0))
        if quality < 0.5:
            low_quality += 1
        entry["last_ingested_at"] = now

    payload["generated_at"] = now
    payload["superwall_ingested_count"] = superwall_count
    payload["julia_ingested_count"] = julia_count
    payload["quality_warnings"] = low_quality

    write_index(payload)

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    PLAYBOOK_DELTA_PATH.write_text(
        "\n".join(
            [
                f"# MERCURY Playbook Changes ({now})",
                "",
                f"- Sources checked: {len(entries)}",
                f"- Superwall indexed: {superwall_count}",
                f"- Julia indexed: {julia_count}",
                f"- Low-quality transcript warnings: {low_quality}",
                "",
                "No automatic strategy edits were applied in refresh-only mode.",
                "",
            ]
        )
    )


if __name__ == "__main__":
    refresh()
