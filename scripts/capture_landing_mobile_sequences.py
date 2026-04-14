from __future__ import annotations

from pathlib import Path

from playwright.sync_api import Page, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "public" / "landing-media"
BASE_URL = "http://127.0.0.1:8080"
CHROMIUM = Path(
    "/Users/zackeryirvin/Library/Caches/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell"
)


def ensure_environment() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    if not CHROMIUM.exists():
        raise FileNotFoundError(f"Chromium binary not found: {CHROMIUM}")


def pause(page: Page, milliseconds: int) -> None:
    page.wait_for_timeout(milliseconds)


def capture(page: Page, slug: str) -> None:
    page.locator("[data-capture-scene]").screenshot(
        path=str(OUTPUT_DIR / f"{slug}.png"),
        animations="disabled",
    )


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
    locator = page.get_by_role("option", name=name_pattern).first
    locator.wait_for(state="visible", timeout=8000)
    locator.click()
    pause(page, delay_ms)


def capture_shopping_sequence(page: Page) -> None:
    page.goto(f"{BASE_URL}/capture-mobile/prep", wait_until="networkidle")
    pause(page, 650)
    capture(page, "mobile-shopping-seq-1")

    click_button(page, "Open shopping list", delay_ms=900)
    capture(page, "mobile-shopping-seq-2")

    click_selector(page, '[data-shopping-item="shop_Foundation_Morning Ritual Essentials_2"]')
    capture(page, "mobile-shopping-seq-3")

    click_selector(page, '[data-shopping-item="shop_Foundation_Liver Support Supplements_1"]')
    capture(page, "mobile-shopping-seq-4")

    click_selector(page, '[data-shopping-item="shop_Fungal Elimination_Fungal Support Supplements_1"]', delay_ms=700)
    capture(page, "mobile-shopping-seq-5")


def capture_today_sequence(page: Page) -> None:
    page.goto(f"{BASE_URL}/capture-mobile/today", wait_until="networkidle")
    pause(page, 600)
    capture(page, "mobile-today-seq-1")

    click_selector(page, '[data-reminder-trigger="hydration_goal"]', delay_ms=450)
    capture(page, "mobile-today-seq-2")

    page.get_by_role("combobox").first.click()
    pause(page, 250)
    click_option(page, "2 hours", delay_ms=350)
    click_button(page, "Set reminder", delay_ms=700)
    capture(page, "mobile-today-seq-3")

    click_button(page, "Done", delay_ms=450)
    click_selector(page, '[data-checklist-mark="supplements_pm"]', delay_ms=700)
    capture(page, "mobile-today-seq-4")


def capture_coach_sequence(page: Page) -> None:
    page.goto(f"{BASE_URL}/capture-mobile/today", wait_until="networkidle")
    pause(page, 600)
    capture(page, "mobile-coach-seq-1")

    click_button(page, "Ask Coach", delay_ms=450)
    pause(page, 700)
    capture(page, "mobile-coach-seq-2")

    pause(page, 1300)
    capture(page, "mobile-coach-seq-3")

    pause(page, 1300)
    capture(page, "mobile-coach-seq-4")


def main() -> None:
    ensure_environment()

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=True,
            executable_path=str(CHROMIUM),
        )
        page = browser.new_page(
            viewport={"width": 430, "height": 932},
            screen={"width": 430, "height": 932},
            is_mobile=True,
            has_touch=True,
            device_scale_factor=2,
        )

        capture_shopping_sequence(page)
        capture_today_sequence(page)
        capture_coach_sequence(page)

        browser.close()


if __name__ == "__main__":
    main()
