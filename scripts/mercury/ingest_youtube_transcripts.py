from __future__ import annotations

import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
MERCURY_DIR = ROOT / "docs" / "mercury"
INDEX_PATH = MERCURY_DIR / "source-index.json"
TRANSCRIPTS_DIR = MERCURY_DIR / "transcripts"


def load_index() -> dict:
    if not INDEX_PATH.exists():
        raise FileNotFoundError(f"Missing source index: {INDEX_PATH}")
    return json.loads(INDEX_PATH.read_text())


def youtube_id_from_url(url: str) -> str | None:
    if "watch?v=" in url:
        return url.split("watch?v=", 1)[1].split("&", 1)[0]
    if "youtu.be/" in url:
        return url.split("youtu.be/", 1)[1].split("?", 1)[0]
    return None


def fetch_auto_caption(video_id: str, output_stub: Path) -> Path | None:
    cmd = [
        "yt-dlp",
        "--skip-download",
        "--write-auto-subs",
        "--sub-langs",
        "en.*",
        "--sub-format",
        "vtt",
        "-o",
        str(output_stub),
        f"https://www.youtube.com/watch?v={video_id}",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        return None

    candidates = sorted(output_stub.parent.glob(f"{output_stub.name}*.vtt"))
    return candidates[0] if candidates else None


def vtt_to_text(vtt_path: Path) -> str:
    lines: list[str] = []
    for raw in vtt_path.read_text(encoding="utf-8", errors="ignore").splitlines():
        line = raw.strip()
        if not line:
            continue
        if line.startswith("WEBVTT"):
            continue
        if "-->" in line:
            continue
        if line.isdigit():
            continue
        lines.append(line)
    return "\n".join(lines).strip()


def main() -> None:
    payload = load_index()
    entries = payload.get("entries", [])

    for entry in entries:
        source_id = str(entry.get("source_id", "")).strip()
        url = str(entry.get("url", "")).strip()
        if not source_id or not url:
            continue

        video_id = youtube_id_from_url(url)
        if not video_id:
            continue

        stub = TRANSCRIPTS_DIR / source_id
        vtt_path = fetch_auto_caption(video_id, stub)
        if not vtt_path:
            continue

        transcript = vtt_to_text(vtt_path)
        if not transcript:
            continue

        md_path = TRANSCRIPTS_DIR / f"{source_id}.md"
        md_path.write_text(
            "\n".join(
                [
                    f"# {source_id}",
                    "",
                    f"source_id: {source_id}",
                    f"video_id: {video_id}",
                    "status: ingested_auto_caption",
                    "",
                    "## Transcript",
                    transcript,
                    "",
                ]
            ),
            encoding="utf-8",
        )
        entry["coverage_status"] = "ingested_auto_caption"
        entry["transcript_quality_score"] = max(0.4, float(entry.get("transcript_quality_score", 0.4)))

        try:
            vtt_path.unlink()
        except OSError:
            pass

    INDEX_PATH.write_text(json.dumps(payload, indent=2) + "\n")


if __name__ == "__main__":
    main()
