# OpenAI Fine-Tuning Runbook (MERCURY)

This runbook keeps MERCURY on a hybrid stack:

- GutBrain chat remains on Gemini path.
- MERCURY decision workflows use OpenAI models.

## Phase A: SFT

1. Generate candidate dataset:
   - `python3 scripts/mercury/ingest_youtube_transcripts.py`
   - `python3 scripts/mercury/build_training_dataset.py`
2. Validate sample quality manually.
3. Upload JSONL to OpenAI Files API.
4. Start SFT job on `gpt-4.1-mini-2025-04-14`.
5. Save fine-tuned model ID as `MERCURY_MODEL`.

## Phase B: RFT

1. Generate eval dataset:
   - `python3 scripts/mercury/build_eval_set.py`
2. Configure grader set:
   - `conversion_proxy_score`
   - `compliance_score`
   - `actionability_score`
   - `calibration_score`
3. Run RFT job against SFT checkpoint.
4. Compare baseline vs tuned performance on eval suite.
5. Promote only if compliance stays >= 0.95 and calibration improves.

## Budget controls

- Initial cap: `$2,000` monthly.
- Stop new jobs when projected month spend exceeds cap.
- Keep RFT sampling conservative until confidence calibration stabilizes.

## Runtime routing

- `protocol-chat`: stays on Gemini (`resolveChatProvider`).
- `mercury-cmo`: uses OpenAI (`resolveMercuryProvider`).
