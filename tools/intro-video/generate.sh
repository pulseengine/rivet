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
# Authored storyboard by default; do_fit reassigns this to the fitted copy.
# Overridable so individual `capture`/`mux` runs can share a fitted timeline.
STORYBOARD="${STORYBOARD:-storyboard.json}"

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
  # Pass the (possibly timing-fitted) storyboard through to the spec so the
  # on-screen pacing matches the narration. STORYBOARD is reassigned to the
  # fitted file by do_fit when the full pipeline runs.
  STORYBOARD="$STORYBOARD" npx playwright test --config playwright.config.ts
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
    speaches)
      # Self-hosted OpenAI-compatible TTS (https://github.com/speaches-ai/speaches).
      # Local/LAN server, no API key, no committed voice model — and reachable
      # from self-hosted CI runners, so a narrated release video can run
      # unattended. Configure via env: SPEACHES_URL / SPEACHES_MODEL / SPEACHES_VOICE.
      need curl
      need node
      need ffprobe
      local url model voice body
      url="${SPEACHES_URL:-http://192.168.178.28:8000}"
      model="${SPEACHES_MODEL:-speaches-ai/Kokoro-82M-v1.0-ONNX}"
      voice="${SPEACHES_VOICE:-af_nicole}"
      # Build the JSON body with node so the narration text is safely escaped
      # (quotes, apostrophes, newlines) — never string-concatenate into JSON.
      body="$(SP_TEXT="$1" SP_MODEL="$model" SP_VOICE="$voice" node -e \
        'process.stdout.write(JSON.stringify({model:process.env.SP_MODEL,voice:process.env.SP_VOICE,input:process.env.SP_TEXT,response_format:"wav"}))')"
      curl -fsS -m 120 "$url/v1/audio/speech" \
        -H "Content-Type: application/json" -d "$body" -o "$2" \
        || { echo "ERROR: speaches TTS request to $url failed."; exit 1; }
      # Loud-fail if the server returned JSON/an error instead of audio.
      ffprobe -v error "$2" >/dev/null 2>&1 \
        || { echo "ERROR: speaches returned non-audio for: $1"; head -c 300 "$2"; echo; exit 1; }
      ;;
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
      echo "ERROR: unknown TTS_ENGINE='$TTS_ENGINE' (expected: speaches | piper | say)"; exit 1;;
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
# 2b. FIT — widen each scene's hold_ms to its actual narration duration so the
#           on-screen scene never cuts off mid-sentence and adjacent narration
#           clips (laid at cumulative offsets) never overlap. Writes a derived
#           storyboard; the authored storyboard.json (nominal timings) is left
#           untouched. After this, $STORYBOARD points at the fitted copy so both
#           capture and mux share one timeline. PAD_MS controls breathing room.
# ---------------------------------------------------------------------------
TIMED_STORYBOARD="$OUT/storyboard.timed.json"
do_fit() {
  need node; need ffprobe
  local n; n="$(scene_count)"
  local durs=() i wav
  for ((i=0; i<n; i++)); do
    wav="$(printf '%s/%02d.wav' "$NARR_DIR" "$i")"
    [ -f "$wav" ] || { echo "ERROR: missing narration clip $wav — run tts first."; exit 1; }
    durs+=("$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$wav")")
  done
  STORYBOARD_SRC="$STORYBOARD" PAD_MS="${PAD_MS:-700}" DURS="${durs[*]}" \
  TIMED_OUT="$TIMED_STORYBOARD" node -e '
    const fs=require("fs");
    const sb=JSON.parse(fs.readFileSync(process.env.STORYBOARD_SRC,"utf8"));
    const durs=process.env.DURS.trim().split(/\s+/).map(Number);
    const pad=Number(process.env.PAD_MS);
    sb.scenes.forEach((s,i)=>{ const need=Math.ceil(durs[i]*1000)+pad;
      s.hold_ms=Math.max(s.hold_ms||0, need); });
    fs.writeFileSync(process.env.TIMED_OUT, JSON.stringify(sb,null,2));
    const total=sb.scenes.reduce((a,s)=>a+s.hold_ms,0);
    console.error(">> fit: total "+(total/1000).toFixed(1)+"s -> "+process.env.TIMED_OUT);
  '
  # Subsequent capture + mux read the fitted timeline.
  STORYBOARD="$TIMED_STORYBOARD"
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
    # ffmpeg input 0 is screen.mp4 (video, no audio), so the narration wavs are
    # inputs 1..n — the filter input specifier is therefore idx+1, not idx.
    # (Output labels [a$idx] stay 0-based and feed amix below.)
    filters+=("[$((idx + 1)):a]adelay=${offset}|${offset}[a$idx];")
    offset=$((offset + hold))
    idx=$((idx + 1))
  done
  # amix all delayed clips into one track.
  local mixins="" j
  for ((j=0; j<n; j++)); do mixins+="[a$j]"; done
  # Freeze the last video frame for a few seconds (tpad clone) so the screen
  # never ends before the narration: Playwright's recorded length can come in a
  # second or two under the summed scene holds, and with -shortest that would
  # clip the tail of the outro narration. Padding the video longer than any
  # audio tail makes -shortest clip to the (full) AUDIO length instead.
  local filtergraph
  filtergraph="[0:v]tpad=stop_mode=clone:stop_duration=5[v];$(printf '%s' "${filters[@]}")${mixins}amix=inputs=${n}:normalize=0[narr]"

  echo ">> mux: building narration track ($n clips) and muxing with screen.mp4"
  ffmpeg -y -i "$OUT/screen.mp4" "${inputs[@]}" \
    -filter_complex "$filtergraph" \
    -map "[v]" -map "[narr]" \
    -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest \
    "$OUT/rivet-intro.mp4"
  echo ">> mux: done -> $OUT/rivet-intro.mp4"
  echo
  echo
  echo "NOTE: scene timings were auto-fitted to narration length (see 'fit')."
  echo "      A human review pass on the final cut is still recommended."
}

# Pipeline order: narration first, then fit timings to it, then capture the
# screen at those timings, then mux. (tts -> fit -> capture -> mux.)
case "${1:-all}" in
  capture) do_capture ;;
  tts)     do_tts ;;
  fit)     do_fit ;;
  mux)     do_mux ;;
  all)     do_tts; do_fit; do_capture; do_mux ;;
  *) echo "usage: $0 [all|tts|fit|capture|mux]"; exit 2 ;;
esac
