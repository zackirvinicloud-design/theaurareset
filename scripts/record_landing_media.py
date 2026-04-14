from __future__ import annotations

import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Callable, TypedDict

from playwright.sync_api import Page, sync_playwright


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


class Scene(TypedDict):
    slug: str
    route: str
    viewport_width: int
    viewport_height: int
    output_width: int
    output_height: int
    mobile: bool
    action: Callable[[Page], None]
    poster_seconds: float


def ensure_environment() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    VIDEO_TMP_DIR.mkdir(parents=True, exist_ok=True)

    if not CHROMIUM.exists():
        raise FileNotFoundError(f"Chromium binary not found: {CHROMIUM}")
    if not FFMPEG.exists():
        raise FileNotFoundError(f"ffmpeg binary not found: {FFMPEG}")


def transcode(webm_path: Path, slug: str, poster_seconds: float) -> None:
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
            f"{poster_seconds:.3f}",
            "-update",
            "1",
            "-frames:v",
            "1",
            str(png_path),
        ],
        check=True,
    )


def pause(page: Page, milliseconds: int) -> None:
    page.wait_for_timeout(milliseconds)


def click_selector(page: Page, selector: str, delay_ms: int = 350) -> None:
    locator = page.locator(selector).first
    locator.wait_for(state="visible", timeout=8000)
    locator.scroll_into_view_if_needed()
    locator.click()
    pause(page, delay_ms)


def click_button(page: Page, name: str, delay_ms: int = 350) -> None:
    locator = page.get_by_role("button", name=name).first
    locator.wait_for(state="visible", timeout=8000)
    locator.scroll_into_view_if_needed()
    locator.click()
    pause(page, delay_ms)


def click_option(page: Page, name_pattern: str, delay_ms: int = 350) -> None:
    locator = page.get_by_role("option", name=re.compile(name_pattern, re.I)).first
    locator.wait_for(state="visible", timeout=8000)
    locator.click()
    pause(page, delay_ms)


def open_quick_pick_reminder(page: Page, item_key: str, option_name: str) -> None:
    click_selector(page, f'[data-reminder-trigger="{item_key}"]', delay_ms=500)
    page.get_by_role("combobox").first.click()
    pause(page, 250)
    click_option(page, option_name, delay_ms=350)
    click_button(page, "Set reminder", delay_ms=700)


def record_desktop_shopping(page: Page) -> None:
    pause(page, 1750)
    click_selector(page, '[data-shopping-item="shop_Foundation_Morning Ritual Essentials_2"]')
    click_selector(page, '[data-shopping-item="shop_Foundation_Liver Support Supplements_1"]')
    click_selector(page, '[data-shopping-item="shop_Fungal Elimination_Fungal Support Supplements_1"]', delay_ms=650)


def record_desktop_today(page: Page) -> None:
    pause(page, 900)
    click_selector(page, '[data-checklist-mark="supplements_pm"]')
    click_selector(page, '[data-checklist-mark="binder_evening"]')
    click_selector(page, '[data-checklist-mark="herx_check"]', delay_ms=700)


def record_desktop_reminder(page: Page) -> None:
    pause(page, 900)
    open_quick_pick_reminder(page, "herx_check", r"2 hours")
    click_selector(page, '[data-reminder-trigger="herx_check"]', delay_ms=900)


def record_desktop_coach(page: Page) -> None:
    pause(page, 900)
    click_selector(page, '[data-checklist-ask="herx_check"]', delay_ms=1200)
    pause(page, 800)


def record_desktop_app_demo(page: Page) -> None:
    pause(page, 4800)
    click_selector(page, '[data-tour="guide-toggle"]', delay_ms=650)
    click_selector(page, '[data-guide-action="open-shopping"]', delay_ms=550)
    click_selector(page, '[data-guide-close="true"]', delay_ms=500)

    click_selector(page, '[data-shopping-item="shop_Foundation_Liver Support Supplements_1"]')
    click_selector(page, '[data-shopping-item="shop_Fungal Elimination_Fungal Support Supplements_1"]')
    click_selector(page, '[data-shopping-item="shop_Fungal Elimination_Fungal Support Supplements_2"]', delay_ms=700)
    click_selector(page, '[data-shopping-back="true"]', delay_ms=700)

    open_quick_pick_reminder(page, "binder_evening", r"2 hours")
    click_selector(page, '[data-checklist-mark="dinner_compliant"]')
    click_selector(page, '[data-checklist-mark="supplements_pm"]', delay_ms=850)


def record_mobile_shopping(page: Page) -> None:
    pause(page, 650)
    click_button(page, "Open shopping list", delay_ms=900)
    click_selector(page, '[data-shopping-item="shop_Foundation_Morning Ritual Essentials_2"]')
    click_selector(page, '[data-shopping-item="shop_Foundation_Liver Support Supplements_1"]')
    click_selector(page, '[data-shopping-item="shop_Fungal Elimination_Fungal Support Supplements_1"]', delay_ms=700)


def record_mobile_today(page: Page) -> None:
    pause(page, 600)
    open_quick_pick_reminder(page, "hydration_goal", r"2 hours")
    click_button(page, "Done", delay_ms=450)
    click_selector(page, '[data-checklist-mark="supplements_pm"]', delay_ms=700)


def record_mobile_coach(page: Page) -> None:
    pause(page, 600)
    click_button(page, "Ask Coach", delay_ms=450)
    pause(page, 3800)


SCENES: list[Scene] = [
    {
        "slug": "desktop-app-demo",
        "route": "/capture/tour",
        "viewport_width": 1600,
        "viewport_height": 1000,
        "output_width": 1600,
        "output_height": 1000,
        "mobile": False,
        "action": record_desktop_app_demo,
        "poster_seconds": 7.0,
    },
    {
        "slug": "desktop-shopping-demo",
        "route": "/capture/prep",
        "viewport_width": 1600,
        "viewport_height": 1000,
        "output_width": 1600,
        "output_height": 1000,
        "mobile": False,
        "action": record_desktop_shopping,
        "poster_seconds": 1.2,
    },
    {
        "slug": "desktop-today-demo",
        "route": "/capture/today",
        "viewport_width": 1600,
        "viewport_height": 1000,
        "output_width": 1600,
        "output_height": 1000,
        "mobile": False,
        "action": record_desktop_today,
        "poster_seconds": 1.3,
    },
    {
        "slug": "desktop-reminder-demo",
        "route": "/capture/today",
        "viewport_width": 1600,
        "viewport_height": 1000,
        "output_width": 1600,
        "output_height": 1000,
        "mobile": False,
        "action": record_desktop_reminder,
        "poster_seconds": 1.8,
    },
    {
        "slug": "desktop-coach-demo",
        "route": "/capture/today",
        "viewport_width": 1600,
        "viewport_height": 1000,
        "output_width": 1600,
        "output_height": 1000,
        "mobile": False,
        "action": record_desktop_coach,
        "poster_seconds": 1.8,
    },
    {
        "slug": "mobile-shopping-demo",
        "route": "/capture-mobile/prep",
        "viewport_width": 430,
        "viewport_height": 932,
        "output_width": 860,
        "output_height": 1864,
        "mobile": True,
        "action": record_mobile_shopping,
        "poster_seconds": 2.2,
    },
    {
        "slug": "mobile-today-demo",
        "route": "/capture-mobile/today",
        "viewport_width": 430,
        "viewport_height": 932,
        "output_width": 860,
        "output_height": 1864,
        "mobile": True,
        "action": record_mobile_today,
        "poster_seconds": 1.6,
    },
    {
        "slug": "mobile-coach-demo",
        "route": "/capture-mobile/today",
        "viewport_width": 430,
        "viewport_height": 932,
        "output_width": 860,
        "output_height": 1864,
        "mobile": True,
        "action": record_mobile_coach,
        "poster_seconds": 5.4,
    },
]


def record_scene(playwright, scene: Scene) -> None:
    recorded_path: Path | None = None
    browser = playwright.chromium.launch(
        headless=True,
        executable_path=str(CHROMIUM),
    )
    context = browser.new_context(
        viewport={"width": scene["viewport_width"], "height": scene["viewport_height"]},
        screen={"width": scene["viewport_width"], "height": scene["viewport_height"]},
        is_mobile=scene["mobile"],
        has_touch=scene["mobile"],
        device_scale_factor=2 if scene["mobile"] else 1,
        record_video_dir=str(VIDEO_TMP_DIR),
        record_video_size={"width": scene["output_width"], "height": scene["output_height"]},
    )
    page = context.new_page()

    try:
        page.goto(f"{BASE_URL}{scene['route']}", wait_until="networkidle")
        scene["action"](page)
        pause(page, 900)
        video = page.video
        context.close()
        if video is not None:
            recorded_path = Path(video.path())
    finally:
        browser.close()

    if recorded_path is None:
        raise RuntimeError(f"No video was recorded for {scene['slug']}")

    transcode(recorded_path, scene["slug"], scene["poster_seconds"])


def main() -> None:
    ensure_environment()
    requested_slugs = set(sys.argv[1:])
    scenes = SCENES
    if requested_slugs:
        scenes = [scene for scene in SCENES if scene["slug"] in requested_slugs]
        if not scenes:
            raise SystemExit(f"No matching scenes found for: {', '.join(sorted(requested_slugs))}")

    with sync_playwright() as playwright:
        for scene in scenes:
            record_scene(playwright, scene)
            print(f"recorded {scene['slug']}")


if __name__ == "__main__":
    main()
