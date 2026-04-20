# MERCURY Proprietary Intelligence System

This folder is the durable knowledge and training layer for MERCURY.

## Core objective

- `paid_conversions` is the v1 north star for the first 60 days.
- `day1_activation_rate` is tracked as a secondary quality signal.

## Structure

- `source-index.json`: canonical source registry (all 37 Superwall sources + Julia viral-app sources).
- `transcripts/`: raw transcript files with quality scores.
- `distilled/`: tactic-level synthesis and classification.
- `playbook.md`: operating rules for strategy and execution.
- `guardrails.md`: trust, compliance, and platform constraints.
- `reports/`: generated weekly reports and deltas.

## Source policy

- SuperwallHQ: include all 37 videos in index.
- Julia Pintar: include only viral-app / UGC / creator-growth / conversion-loop content.
- Noisy transcripts are retained and down-weighted by confidence.

## Weekly cadence

1. Run source refresh.
2. Re-score transcript quality.
3. Rebuild distilled tactics.
4. Rebuild training and eval JSONL candidates.
5. Publish weekly report to `docs/mercury/reports/`.
