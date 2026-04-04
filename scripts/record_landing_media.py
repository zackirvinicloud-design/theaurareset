from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

from patchright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "public" / "landing-media"
VIDEO_TMP_DIR = Path("/tmp/gut-brain-landing-media")
BASE_URL = "http://127.0.0.1:8080"
CHROMIUM = Path(
    "/Users/zackeryirvin/Library/Caches/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell"
)
PLAYWRIGHT_FFMPEG = Path("/Users/zackeryirvin/Library/Caches/ms-playwright/ffmpeg-1011/ffmpeg-mac")
FULL_FFMPEG = Path("/private/tmp/landing-ffmpeg/node_modules/ffmpeg-static/ffmpeg")
FFMPEG = FULL_FFMPEG if FULL_FFMPEG.exists() else PLAYWRIGHT_FFMPEG

SCENES = [
    {"route": "prep", "slug": "prep-day-flow", "duration_ms": 7600},
    {"route": "today", "slug": "today-flow", "duration_ms": 7600},
    {"route": "journey", "slug": "journey-flow", "duration_ms": 7800},
]


def ensure_environment() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    VIDEO_TMP_DIR.mkdir(parents=True, exist_ok=True)

    if not CHROMIUM.exists():
        raise FileNotFoundError(f"Chromium binary not found: {CHROMIUM}")
    if not FFMPEG.exists():
        raise FileNotFoundError(f"ffmpeg binary not found: {FFMPEG}")


def transcode(webm_path: Path, slug: str) -> None:
    webm_output = OUTPUT_DIR / f"{slug}.webm"
    png_path = OUTPUT_DIR / f"{slug}.png"
    mp4_path = OUTPUT_DIR / f"{slug}.mp4"

    shutil.copy2(webm_path, webm_output)

    if FFMPEG == FULL_FFMPEG:
        subprocess.run(
            [
                str(FFMPEG),
                "-y",
                "-i",
                str(webm_output),
                "-c:v",
                "libx264",
                "-pix_fmt",
                "yuv420p",
                "-movflags",
                "+faststart",
                str(mp4_path),
            ],
            check=True,
        )

    subprocess.run(
        [
            str(FFMPEG),
            "-y",
            "-i",
            str(webm_output),
            "-ss",
            "00:00:01.000",
            "-update",
            "1",
            "-frames:v",
            "1",
            str(png_path),
        ],
        check=True,
    )


def record_scene(route: str, slug: str, duration_ms: int) -> None:
    recorded_path: Path | None = None

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=True,
            executable_path=str(CHROMIUM),
        )
        context = browser.new_context(
            viewport={"width": 1600, "height": 1000},
            screen={"width": 1600, "height": 1000},
            record_video_dir=str(VIDEO_TMP_DIR),
            record_video_size={"width": 1600, "height": 1000},
        )
        page = context.new_page()
        page.goto(f"{BASE_URL}/capture/{route}", wait_until="networkidle")
        page.wait_for_timeout(duration_ms)
        video = page.video
        context.close()
        if video is not None:
            recorded_path = Path(video.path())
        browser.close()

    if recorded_path is None:
        raise RuntimeError(f"No video was recorded for {route}")

    transcode(recorded_path, slug)


def main() -> None:
    ensure_environment()
    for scene in SCENES:
        record_scene(scene["route"], scene["slug"], scene["duration_ms"])
        print(f"recorded {scene['slug']}")


if __name__ == "__main__":
    main()
