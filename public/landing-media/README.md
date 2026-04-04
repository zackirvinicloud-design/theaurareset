# Landing Media Files

The landing page uses **video files only** for product walkthrough panels.

Required files:

- `prep-day-flow.webm`
- `prep-day-flow.png` (poster image)
- `today-flow.webm`
- `today-flow.png` (poster image)
- `journey-flow.webm`
- `journey-flow.png` (poster image)

Optional cross-browser additions:

- `prep-day-flow.mp4`
- `today-flow.mp4`
- `journey-flow.mp4`

Recommended export settings:

- Resolution: `1600x1000` or `1440x900`
- Duration: `8-14s` loop
- Audio: none
- Framerate: `24-30fps`
- Compression: web-optimized

These files are loaded by:

- `src/pages/Landing.tsx`
- `src/components/landing/LandingMediaPanel.tsx`
