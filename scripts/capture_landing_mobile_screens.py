from __future__ import annotations

from pathlib import Path

from playwright.sync_api import Page, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "public" / "landing-media"
BASE_URL = "http://127.0.0.1:8080"
CHROMIUM = Path(
    "/Users/zackeryirvin/Library/Caches/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell"
)

SCREENS = [
    # Prep card frames
    {"slug": "mobile-current-prep-1", "route": "prep", "wait_ms": 1800},
    {"slug": "mobile-current-prep-2", "route": "guide", "wait_ms": 1600},
    {
        "slug": "mobile-current-prep-3",
        "route": "guide",
        "wait_ms": 1600,
        "actions": [("click_button", "Open shopping list"), ("wait", 700)],
    },
    {
        "slug": "mobile-current-prep-4",
        "route": "guide",
        "wait_ms": 1600,
        "actions": [("click_button", "Open roadmap"), ("wait", 700)],
    },
    # Today card frames
    {"slug": "mobile-current-today-1", "route": "today", "wait_ms": 2000},
    {"slug": "mobile-current-today-2", "route": "help", "wait_ms": 1800},
    {"slug": "mobile-current-today-3", "route": "help", "wait_ms": 1800},
    {"slug": "mobile-current-today-4", "route": "guide", "wait_ms": 1700},
    # Coach/guide card frames
    {"slug": "mobile-current-support-1", "route": "help", "wait_ms": 1800},
    {"slug": "mobile-current-support-2", "route": "guide", "wait_ms": 1700},
    {
        "slug": "mobile-current-support-3",
        "route": "guide",
        "wait_ms": 1700,
        "actions": [("click_button", "Open symptom tracker"), ("wait", 700)],
    },
    {
        "slug": "mobile-current-support-4",
        "route": "guide",
        "wait_ms": 1700,
        "actions": [("click_button", "Open shopping list"), ("wait", 700)],
    },
]


def ensure_environment() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    if not CHROMIUM.exists():
        raise FileNotFoundError(f"Chromium binary not found: {CHROMIUM}")


def blur_active_element(page: Page) -> None:
    page.evaluate(
        """
        () => {
          const active = document.activeElement;
          if (active instanceof HTMLElement) {
            active.blur();
          }
        }
        """
    )


def perform_action(page: Page, action: tuple[str, str | int]) -> None:
    kind, value = action

    if kind == "wait":
        page.wait_for_timeout(int(value))
        return

    if kind == "click_button":
        page.get_by_role("button", name=str(value)).first.click()
        blur_active_element(page)
        return

    if kind == "click_tab":
        page.get_by_role("button", name=str(value)).first.click()
        blur_active_element(page)
        return

    raise ValueError(f"Unknown action: {kind}")


def capture_screen(
    page: Page,
    route: str,
    slug: str,
    wait_ms: int,
    actions: list[tuple[str, str | int]] | None = None,
) -> None:
    page.goto(f"{BASE_URL}/capture-mobile/{route}", wait_until="networkidle")
    page.wait_for_timeout(wait_ms)

    for action in actions or []:
        perform_action(page, action)

    page.screenshot(
        path=str(OUTPUT_DIR / f"{slug}.png"),
        full_page=False,
        animations="disabled",
    )


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
            device_scale_factor=2,
        )

        for screen in SCREENS:
            capture_screen(
                page,
                route=screen["route"],
                slug=screen["slug"],
                wait_ms=screen["wait_ms"],
                actions=screen.get("actions"),
            )
            print(f"captured {screen['slug']}")

        browser.close()


if __name__ == "__main__":
    main()
