# rivet intro video — reusable generator

A scaffold to **regenerate** a 30–60s intro/quickstart video of rivet:
a spoken intro, the CLI `--help`, and a browse through the `rivet serve`
dashboard, with automated narration synced to the on-screen action.

This is **infrastructure, not a one-off video.** Re-run it after the UI
changes. Nothing large is committed — only the scripts, the storyboard, and
this README. Generated media lands in `out/` (gitignored).

## Pipeline

```
storyboard.json ──► capture.spec.ts (Playwright recordVideo) ──► out/screen.mp4
        │                                                            │
        └──► generate.sh tts (piper) ──► out/narration/NN.wav        │
                                                │                    │
                                                └──► ffmpeg mux ──────┴──► out/rivet-intro.mp4
```

`storyboard.json` is the **single source of truth**: it drives both the
Playwright scene pacing (`hold_ms`, `action`) and the TTS narration
(`narration`). Edit narration there, never in a generated file.

## Why this stack

- **Screen capture: Playwright `recordVideo`.** Deterministic, headless,
  fixed 1280×720 framing, no extra binary beyond the browser Playwright
  already manages, and it reuses the exact `rivet serve` startup the existing
  test suite uses. Rejected: `ffmpeg x11grab`/screen recorders (host-display
  dependent, non-deterministic, won't run clean in CI).
- **CLI help: an in-browser HTML terminal panel** rendered inside the same
  Playwright video stream. One timeline, one mux. Rejected (for now):
  asciinema/vhs real-terminal recordings — they'd add a second capture tool
  and a second sync problem. The scene contract makes swapping one in later
  trivial (replace `show_cli_help`).
- **TTS: `speaches` (project default) or `piper`.** Both are local /
  self-hosted, no cloud API key, license-clean for a published artifact.
  - `TTS_ENGINE=speaches` (recommended) calls a self-hosted
    [Speaches](https://github.com/speaches-ai/speaches) server's
    OpenAI-compatible `/v1/audio/speech` endpoint (e.g. Kokoro-82M, voice
    `af_nicole`). Configure via `SPEACHES_URL` / `SPEACHES_MODEL` /
    `SPEACHES_VOICE`. Because it is just an HTTP call to a LAN/host service, a
    **self-hosted CI runner can reach it**, so a narrated release video can
    regenerate unattended — no voice model committed to the repo.
  - `TTS_ENGINE=piper` is the offline fallback (needs a downloaded `.onnx`
    voice; see "Install piper").
  - Rejected: cloud TTS (proprietary lock-in, per-render cost, a secret in CI).
    `TTS_ENGINE=say` (macOS) is a quick local preview only and must **not**
    ship the published video (Apple voice license).
- **Mux + timing: ffmpeg.** Narration is synthesized first; the `fit` step then
  widens each scene's `hold_ms` to its actual narration duration (so a scene
  never cuts off mid-sentence and adjacent clips never overlap), and capture
  runs at those fitted timings. Narration clips are delayed (`adelay`) to each
  scene's cumulative offset and mixed (`amix`) onto the silent screen capture;
  the final video frame is held (`tpad`) so the outro narration never clips.

## Prerequisites

| Tool | Why | Install | Bundled? |
|------|-----|---------|----------|
| node + npx | run Playwright | nvm / nodejs.org | no |
| Playwright + Chromium | screen capture | `npm install && npx playwright install chromium` | no |
| ffmpeg + ffprobe | normalize + mux | `brew install ffmpeg` / apt | no |
| piper | local TTS | see below | no |
| a piper voice model | the narration voice | see below | **no — you must download** |
| a built `rivet` | `rivet serve` backend | `cargo build --release` (capture starts it) | repo |

### Install piper + a voice

```sh
# piper: https://github.com/rhasspy/piper  (releases have prebuilt binaries)
#   macOS/Linux: download the release, put `piper` on PATH.
# voice models: https://huggingface.co/rhasspy/piper-voices
mkdir -p voices
# Example US-English medium voice (calm, technical — fits the PulseEngine voice):
#   download en_US-ryan-medium.onnx AND en_US-ryan-medium.onnx.json into voices/
export PIPER_VOICE=voices/en_US-ryan-medium.onnx
```

`voices/` is gitignored. Voice selection and final prosody are a human call —
audition a couple before settling.

## Regenerate

From this directory (`tools/intro-video/`):

```sh
npm install                      # once: Playwright
npx playwright install chromium  # once: browser
./generate.sh                    # capture -> tts -> mux  =>  out/rivet-intro.mp4
```

The full pipeline runs **tts → fit → capture → mux** (narration first, so scene
timings can be fitted to it). Sub-steps (when iterating):

```sh
TTS_ENGINE=speaches ./generate.sh tts   # synthesize narration (Speaches/Kokoro)
./generate.sh fit                        # widen scene hold_ms to narration length
STORYBOARD=out/storyboard.timed.json ./generate.sh capture   # record at fitted timings
STORYBOARD=out/storyboard.timed.json ./generate.sh mux       # combine capture + narration
```

When running sub-steps individually, point `capture`/`mux` at the fitted
`out/storyboard.timed.json` that `fit` writes (the full `./generate.sh` does this
automatically).

Quick local preview without piper (macOS, not for publishing):

```sh
TTS_ENGINE=say ./generate.sh
```

**Output:** `out/rivet-intro.mp4`. Intermediates: `out/screen.mp4`,
`out/narration/NN.wav`, raw Playwright `.webm` under `out/pw/`.

## Voice guide

Derived from the PulseEngine blog (pulseengine.eu/blog) — Ralf Anton Beier's
voice. The narration script MUST follow these:

- **Technical, no marketing fluff.** No "revolutionary", "seamless",
  "powerful". State what it does; let the mechanism impress.
- **Falsification-minded / evidence-driven.** Frame value as *proof* and
  *failing the build*, not features. e.g. "validation fails the build", "the
  chain is explicit, not reconstructed after the fact".
- **Lead with the problem.** Open on the gap ("AI writes the code in
  minutes… what it does not do is prove why"), echoing the rivet launch post.
- **Short, declarative sentences.** Authority through brevity. One idea per
  sentence. Plain words.
- **Concrete and specific.** Name real commands (`validate`, `coverage`,
  `serve`) and real artifacts (requirements, hazards, design decisions).
- **Honest about scope.** No overclaiming, no "solves everything". Say
  precisely what is demonstrated.
- **Signature close.** End on the project's own line: "because agents don't
  remember why" → "so the repository has to". Mention open-source + Rust.
- **Calm pace.** ~2.5 words/second. The voice is unhurried and assured, not
  hype-energetic.

## Storyboard

Authoritative copy lives in `storyboard.json`. Nominal timing (~52s):

| t (s) | Scene | On-screen action | Narration |
|-------|-------|------------------|-----------|
| 0–5 | intro | Branded title card "rivet" | "AI writes the code in minutes. What it does not do is prove why that code exists. rivet binds that proof to the repository." |
| 5–11 | cli-help | Terminal panel: `rivet --help` | "rivet is a command-line tool. One help screen lists every command — validate, coverage, link, audit. It runs in CI on every push." |
| 11–16 | dashboard | `rivet serve` dashboard home | "rivet serve opens a dashboard over the same artifacts — no separate database, no drift." |
| 16–22 | artifacts-list | `/artifacts` table, scroll | "Requirements, hazards, design decisions, and test specs all live as files in the repo, validated the same way the code is." |
| 22–28 | artifact-detail | `/artifacts/REQ-001` with links | "Open one requirement and you see its links — what it satisfies, what verifies it. The chain is explicit, not reconstructed after the fact." |
| 28–34 | coverage | `/coverage` report | "Coverage reports show every gap. If a link is missing, validation fails the build. The traceability model can not silently drift from the code." |
| 34–39 | outro | Branded outro card | "rivet. Open source, built in Rust. Because agents don't remember why — so the repository has to." |

## Accessibility

- **Captions.** Burn or sidecar captions from `storyboard.json` narration.
  A `.srt`/`.vtt` can be generated from the same scene offsets — TODO, see
  "Gaps" below. Captions are required, not optional.
- **Contrast.** Title/outro cards use `#e6edf3` on `#0d1117` (>12:1). The
  dashboard's own contrast is whatever `rivet serve` ships.
- **Audio clarity.** piper medium voice at a calm pace; no background music
  competing with speech.

## Gaps / what still needs a human

- **A TTS binary + voice model.** piper and a `.onnx` voice are not bundled
  (binary/license). Download per "Install piper". Without them, `capture`
  still works; `tts`/`mux`/`all` will stop with a clear error.
- **Voice selection & prosody.** Audition voices; piper has no per-line
  emphasis control, so awkward phrasing must be fixed in the script text.
- **Final timing fine-sync.** `hold_ms` is nominal. If a narration clip runs
  longer than its scene, bump that scene's `hold_ms` and re-run. A human
  review pass on the final cut is expected.
- **Caption file generation** (`.vtt`/`.srt`) is not yet wired — the data
  (text + offsets) is all in `storyboard.json`; add a small step to
  `generate.sh` when needed.
- **Publishing** (where the mp4 lands, hosting, the blog embed) is out of
  scope for this scaffold.
