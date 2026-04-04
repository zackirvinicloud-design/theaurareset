from __future__ import annotations

from pathlib import Path

from playwright.sync_api import Page, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "public" / "demo-steps"
BASE_URL = "http://127.0.0.1:8080"
CHROMIUM = Path(
    "/Users/zackeryirvin/Library/Caches/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell"
)

PLACEHOLDER = "Ask about today's plan, food, symptoms, or what to do next..."

SHOTS = [
    {"slug": "tour-status-shell", "route": "today", "wait_ms": 2300},
    {"slug": "tour-plan-rail", "route": "journey", "wait_ms": 1900},
    {
        "slug": "tour-context-answer",
        "route": "today",
        "wait_ms": 2300,
        "actions": [
            ("click_checklist", "Tongue scrape (before anything else)"),
            ("wait", 250),
        ],
    },
    {
        "slug": "tour-composer",
        "route": "today",
        "wait_ms": 2300,
        "actions": [
            ("fill_composer", "What do I need to keep simple tonight?"),
            ("wait", 150),
        ],
    },
    {
        "slug": "tour-guide-tabs",
        "route": "today",
        "wait_ms": 2300,
        "actions": [
            ("click_guide_tab", "Plan"),
            ("wait", 250),
        ],
    },
    {
        "slug": "tour-shopping-view",
        "route": "today",
        "wait_ms": 2300,
        "actions": [
            ("click_button", "Open shopping list"),
            ("wait", 250),
        ],
    },
    {
        "slug": "tour-protocol-view",
        "route": "today",
        "wait_ms": 2300,
        "actions": [
            ("click_button", "Open full protocol"),
            ("wait", 700),
        ],
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

    if kind == "click_checklist":
        page.locator('button[title="Tap to learn more"]', has_text=str(value)).click()
        blur_active_element(page)
        return

    if kind == "fill_composer":
        composer = page.get_by_placeholder(PLACEHOLDER)
        composer.fill(str(value))
        blur_active_element(page)
        return

    if kind == "click_guide_tab":
        page.locator('[data-tour="guide-panel"] button', has_text=str(value)).click()
        blur_active_element(page)
        return

    if kind == "click_button":
        page.get_by_role("button", name=str(value)).click()
        blur_active_element(page)
        return

    raise ValueError(f"Unknown action: {kind}")


def capture_shot(page: Page, route: str, slug: str, wait_ms: int, actions: list[tuple[str, str | int]] | None = None) -> None:
    page.goto(f"{BASE_URL}/capture/{route}", wait_until="networkidle")
    page.wait_for_timeout(wait_ms)

    for action in actions or []:
        perform_action(page, action)

    page.locator("[data-capture-scene]").screenshot(
        path=str(OUTPUT_DIR / f"{slug}.png"),
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
            viewport={"width": 1600, "height": 1000},
            screen={"width": 1600, "height": 1000},
            device_scale_factor=2,
        )

        for shot in SHOTS:
            capture_shot(
                page,
                route=shot["route"],
                slug=shot["slug"],
                wait_ms=shot["wait_ms"],
                actions=shot.get("actions"),
            )
            print(f"captured {shot['slug']}")

        browser.close()


if __name__ == "__main__":
    main()
