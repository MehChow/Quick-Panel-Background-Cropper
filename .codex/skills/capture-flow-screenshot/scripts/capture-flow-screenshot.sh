#!/usr/bin/env bash

set -euo pipefail

usage() {
  echo "Usage: $0 flow/path/image.webp [device-serial]"
}

fail() {
  echo "Error: $*" >&2
  exit 1
}

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

[[ $# -ge 1 && $# -le 2 ]] || {
  usage >&2
  exit 1
}

for command in adb cwebp webpinfo; do
  command -v "$command" >/dev/null 2>&1 || fail "Required command not found: $command"
done

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
repo_root="$(cd "$script_dir/../../../.." && pwd -P)"
flow_root="$(cd "$repo_root/flow" && pwd -P)"
target="${1#./}"

case "$target" in
  flow/*.webp) ;;
  *) fail "Target must be a .webp path under flow/: $target" ;;
esac

target_dir="$repo_root/$(dirname "$target")"
[[ -d "$target_dir" ]] || fail "Destination directory does not exist: $(dirname "$target")"
target_dir="$(cd "$target_dir" && pwd -P)"

case "$target_dir/" in
  "$flow_root/"*) ;;
  *) fail "Target resolves outside flow/: $target" ;;
esac

target_path="$target_dir/$(basename "$target")"
serial="${2:-}"

if [[ -n "$serial" ]]; then
  [[ "$(adb -s "$serial" get-state 2>/dev/null || true)" == "device" ]] ||
    fail "Device is not online or authorized: $serial"
else
  device_output="$(adb devices)"
  devices=()
  while read -r device state _; do
    [[ "$state" == "device" ]] && devices+=("$device")
  done <<<"$device_output"

  case "${#devices[@]}" in
    0) fail "No online Android device found" ;;
    1) serial="${devices[0]}" ;;
    *) fail "Multiple devices are online; pass a device serial" ;;
  esac
fi

temp_dir="$(mktemp -d "${TMPDIR:-/tmp}/qpbc-flow-screenshot.XXXXXX")"
trap 'rm -rf "$temp_dir"' EXIT
png_path="$temp_dir/screenshot.png"
webp_path="$temp_dir/screenshot.webp"

adb -s "$serial" exec-out screencap -p >"$png_path"
cwebp -quiet -q 80 "$png_path" -o "$webp_path"

new_width="$(webpinfo "$webp_path" 2>/dev/null | awk '/Width:/ {print $2; exit}')"
new_height="$(webpinfo "$webp_path" 2>/dev/null | awk '/Height:/ {print $2; exit}')"
[[ -n "$new_width" && -n "$new_height" ]] || fail "Could not verify converted WebP"

if [[ -f "$target_path" ]]; then
  old_width="$(webpinfo "$target_path" 2>/dev/null | awk '/Width:/ {print $2; exit}')"
  old_height="$(webpinfo "$target_path" 2>/dev/null | awk '/Height:/ {print $2; exit}')"

  [[ "$new_width" == "$old_width" && "$new_height" == "$old_height" ]] ||
    fail "Capture is ${new_width}x${new_height}; existing target is ${old_width}x${old_height}"
fi

mv "$webp_path" "$target_path"

echo "Saved $target (${new_width}x${new_height}) from device $serial"
