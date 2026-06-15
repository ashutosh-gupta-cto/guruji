#!/usr/bin/env bash
# Clone all repos from manifest.json into category subfolders
set -uo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
MANIFEST="$ROOT/manifest.json"
LOG="$ROOT/clone-log.txt"
PARALLEL="${PARALLEL:-6}"

: > "$LOG"

clone_repo() {
  local category="$1" owner="$2" repo="$3"
  local dest="$ROOT/repos/$category/${owner}__${repo}"
  if [[ -d "$dest/.git" ]]; then
    echo "SKIP  $owner/$repo (exists)" | tee -a "$LOG"
    return 0
  fi
  mkdir -p "$ROOT/repos/$category"
  if git clone --depth 1 "https://github.com/${owner}/${repo}.git" "$dest" >>"$LOG" 2>&1; then
    echo "OK    $owner/$repo" | tee -a "$LOG"
  else
    echo "FAIL  $owner/$repo" | tee -a "$LOG"
  fi
}

export -f clone_repo
export ROOT LOG

cd "$ROOT"
python3 - <<'PY' | xargs -P "$PARALLEL" -I {} bash -c '{}'
import json, shlex
with open("manifest.json") as f:
    data = json.load(f)
for cat, repos in data["categories"].items():
    for r in repos:
        cmd = f"clone_repo {shlex.quote(cat)} {shlex.quote(r['owner'])} {shlex.quote(r['repo'])}"
        print(cmd)
PY

echo "--- Done. See $LOG for details."
