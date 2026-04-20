#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

python3 scripts/mercury/refresh_sources.py
python3 scripts/mercury/build_training_dataset.py
python3 scripts/mercury/build_eval_set.py
python3 scripts/mercury/backtest_calibration.py
python3 scripts/mercury/build_weekly_report.py

echo "MERCURY weekly cycle complete."
