#!/usr/bin/env bash
#
# Regenerate the rivet intro/quickstart video end-to-end.
#
#   capture (Playwright) -> narration (TTS) -> mux (ffmpeg)
#
# All output lands in ./out/ which is gitignored. Re-run after a UI change and
# commit nothing but the scaffold (storyboard.json / specs / this script).
#
# Usage:
#   ./generate.sh              # full pipeline (capture + tts + mux)
#   ./generate.sh capture      # just the screen capture
#   ./generate.sh tts          # just synthesize narration clips
#   ./generate.sh mux          # just mux existing capture + narration
#
# Requirements (see README.md for install notes):
#   - node + npx (Playwright is installed via `npm install` in this dir)
#   - ffmpeg + ffprobe on PATH
#   - A TTS engine. Default is piper (local, MIT, no API key, CI-friendly).
#     Set TTS_ENGINE=say to use macOS `say` for a quick local preview.
#
set -euo pipefail
cd "$(dirname "$0")"

OUT="out"
NARR_DIR="$OUT/narration"
PW_VIDEO_DIR="$OUT/pw"
STORYBOARD="storyboard.json"

TTS_ENGINE="${TTS_ENGINE:-piper}"
# Piper voice model (.onnx) + config (.onnx.json). Download once; see README.
# A US English medium voice is a reasonable default for the PulseEngine voice
# (calm, technical, unhurried). Point PIPER_VOICE at your downloaded model.
PIPER_VOICE="${PIPER_VOICE:-voices/en_US-ryan-medium.onnx}"

mkdir -p "$NARR_DIR"

need() { command -v "$1" >/dev/null 2>&1 || { echo "ERROR: '$1' not found on PATH. See README.md."; exit 1; }; }

scene_count() { node -e 'const s=require("./'"$STORYBOARD"'");console.log(s.scenes.length)'; }
scene_field() { # $1=index $2=field
  node -e 'const s=require("./'"$STORYBOARD"'");process.stdout.write(String(s.scenes['"$1"'].'"$2"'))'
}

# ---------------------------------------------------------------------------
# 1. CAPTURE — Playwright records one .webm of all scenes.
# ---------------------------------------------------------------------------
do_capture() {
  need npx
  echo ">> capture: running Playwright (this starts/reuses 'rivet serve' on :3003)"
  npx playwright test --config playwright.config.ts
  # Playwright writes a .webm under out/pw/<test-dir>/video.webm
  local webm
  webm="$(find "$PW_VIDEO_DIR" -name '*.webm' -print -quit || true)"
  if [ -z "${webm:-}" ]; then
    echo "ERROR: no .webm produced by Playwright under $PW_VIDEO_DIR"; exit 1
  fi
  need ffmpeg
  echo ">> capture: normalizing $webm -> $OUT/screen.mp4"
  ffmpeg -y -i "$webm" -r 30 -pix_fmt yuv420p -an "$OUT/screen.mp4"
  echo ">> capture: done -> $OUT/screen.mp4"
}

# ---------------------------------------------------------------------------
# 2. TTS — one narration clip per scene, named narration/NN.wav.
# ---------------------------------------------------------------------------
synth_one() { # $1=text $2=outfile.wav
  case "$TTS_ENGINE" in
    piper)
      need piper
      if [ ! -f "$PIPER_VOICE" ]; then
        echo "ERROR: piper voice model not found at '$PIPER_VOICE'."
        echo "       Download a voice (e.g. en_US-ryan-medium) per README.md,"
        echo "       or set PIPER_VOICE / TTS_ENGINE=say."
        exit 1
      fi
      printf '%s' "$1" | piper --model "$PIPER_VOICE" --output_file "$2"
      ;;
    say) # macOS preview voice — NOT for the published artifact (Apple license).
      need say
      need ffmpeg
      say -v Daniel -o "$2.aiff" "$1"
      ffmpeg -y -i "$2.aiff" "$2" && rm -f "$2.aiff"
      ;;
    *)
      echo "ERROR: unknown TTS_ENGINE='$TTS_ENGINE' (expected: piper | say)"; exit 1;;
  esac
}

do_tts() {
  need node
  local n; n="$(scene_count)"
  echo ">> tts: synthesizing $n narration clips with engine '$TTS_ENGINE'"
  for ((i=0; i<n; i++)); do
    local text out
    text="$(scene_field "$i" narration)"
    out="$(printf '%s/%02d.wav' "$NARR_DIR" "$i")"
    echo "   [$i] $text"
    synth_one "$text" "$out"
  done
  echo ">> tts: done -> $NARR_DIR/*.wav"
}

# ---------------------------------------------------------------------------
# 3. MUX — lay each narration clip at its scene's cumulative offset, then
#          combine with the screen capture. Each scene's hold_ms defines the
#          window; narration starts at the scene boundary so speech tracks the
#          on-screen action.
# ---------------------------------------------------------------------------
do_mux() {
  need ffmpeg; need ffprobe; need node
  [ -f "$OUT/screen.mp4" ] || { echo "ERROR: $OUT/screen.mp4 missing — run capture first."; exit 1; }

  local n; n="$(scene_count)"
  # Build a delayed+concatenated narration track aligned to scene offsets.
  local inputs=() filters=() offset=0 idx=0
  for ((i=0; i<n; i++)); do
    local wav hold
    wav="$(printf '%s/%02d.wav' "$NARR_DIR" "$i")"
    hold="$(scene_field "$i" hold_ms)"
    [ -f "$wav" ] || { echo "ERROR: missing narration clip $wav — run tts first."; exit 1; }
    inputs+=(-i "$wav")
    # adelay in ms (per channel); pad each clip to start at the scene boundary.
    filters+=("[$idx:a]adelay=${offset}|${offset}[a$idx];")
    offset=$((offset + hold))
    idx=$((idx + 1))
  done
  # amix all delayed clips into one track.
  local mixins="" j
  for ((j=0; j<n; j++)); do mixins+="[a$j]"; done
  local filtergraph
  filtergraph="$(printf '%s' "${filters[@]}")${mixins}amix=inputs=${n}:normalize=0[narr]"

  echo ">> mux: building narration track ($n clips) and muxing with screen.mp4"
  ffmpeg -y -i "$OUT/screen.mp4" "${inputs[@]}" \
    -filter_complex "$filtergraph" \
    -map 0:v -map "[narr]" \
    -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest \
    "$OUT/rivet-intro.mp4"
  echo ">> mux: done -> $OUT/rivet-intro.mp4"
  echo
  echo "NOTE: timing is nominal (narration laid at scene boundaries). If a clip"
  echo "      runs long, bump that scene's hold_ms in $STORYBOARD and re-run"
  echo "      'capture' + 'mux'. Final fine-sync still benefits from a human pass."
}

case "${1:-all}" in
  capture) do_capture ;;
  tts)     do_tts ;;
  mux)     do_mux ;;
  all)     do_capture; do_tts; do_mux ;;
  *) echo "usage: $0 [all|capture|tts|mux]"; exit 2 ;;
esac
