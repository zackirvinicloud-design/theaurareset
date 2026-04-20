# Native App Scaffold

This project now uses a thin Capacitor wrapper for the iOS app path.
The native iOS shell has already been generated in `ios/`.

## What stays editable

You still edit the product in the same web codebase:

- `src/` for GutBrain behavior, UI, and routing
- `public/` for static assets
- `supabase/` for backend functions and data behavior

The native layer is only a shell around the built web app.

## Core workflow

1. Edit the app as usual in the web codebase.
2. Run `npm run build:mobile`.
3. Run `npm run ios:sync` to copy the latest web build into the iOS shell.
4. Run `npm run cap:open:ios` to open the native project in Xcode.

## Commands

- `npm run build:mobile`
- `npm run cap:copy`
- `npm run cap:sync`
- `npm run ios:sync`
- `npm run cap:open:ios`

## Current blocker on this machine

The Capacitor packages are installed and the iOS shell is in place, but this Mac does not currently have full Xcode selected.

To open, build, run on device/simulator, or ship through App Store Connect, the machine needs:

- Full Xcode installed
- `xcode-select` pointed at Xcode

Once those are present, run:

```bash
npm run ios:sync
npm run cap:open:ios
```
