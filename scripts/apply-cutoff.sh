#!/usr/bin/env bash
# Apply the 2015-01-01 era-archive cutoff to all JSON data files.
# - groups: keep formed < cutoff (or formed == "unknown" for OG units)
# - memberships: drop joinDate >= cutoff; clear leaveDate/leaveReason if >= cutoff
# - members: keep only those still referenced
# - songs: keep releaseDate < cutoff AND group surviving
# - distributions: keep only those whose song survived
#
# Run after re-scraping. Idempotent.

set -euo pipefail
cd "$(dirname "$0")/.."

CUTOFF="2015-01-01"
DATA=src/data
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

echo "== applying cutoff: $CUTOFF =="

# 1. groups
jq --arg c "$CUTOFF" '[.[] | select((.formed == "unknown") or (.formed < $c))]' \
  "$DATA/groups.json" > "$TMP/groups.json"
mv "$TMP/groups.json" "$DATA/groups.json"

# kept group ids
jq '[.[].id]' "$DATA/groups.json" > "$TMP/kg.json"

# 2. memberships
#    - drop if group was removed
#    - drop if joinDate is a concrete date >= cutoff (note: "unknown" passes — short-lived units
#      like ZYX / Petitmoni have null begin in MB; we trust the group filter to gate them)
#    - clear leaveDate/leaveReason if leave is >= cutoff (treat as active at cutoff)
jq --arg c "$CUTOFF" --slurpfile kg "$TMP/kg.json" '
  [.[]
    | select(.groupId as $g | $kg[0] | index($g))
    | select((.joinDate == "unknown") or (.joinDate < $c))
    | if ((.leaveDate // "") >= $c) then del(.leaveDate, .leaveReason) else . end
  ]' "$DATA/memberships.json" > "$TMP/m.json"
mv "$TMP/m.json" "$DATA/memberships.json"

# 3. members
jq '[.[].memberId] | unique' "$DATA/memberships.json" > "$TMP/km.json"
jq --slurpfile km "$TMP/km.json" \
  '[.[] | select(.id as $i | $km[0] | index($i))]' \
  "$DATA/members.json" > "$TMP/m.json"
mv "$TMP/m.json" "$DATA/members.json"

# 4. songs
jq --arg c "$CUTOFF" --slurpfile kg "$TMP/kg.json" '
  [.[] | select(.releaseDate < $c) | select(.groupId as $g | $kg[0] | index($g))]
' "$DATA/songs.json" > "$TMP/s.json"
mv "$TMP/s.json" "$DATA/songs.json"

# 5. distributions
jq '[.[].id]' "$DATA/songs.json" > "$TMP/ks.json"
jq --slurpfile ks "$TMP/ks.json" \
  '[.[] | select(.songId as $s | $ks[0] | index($s))]' \
  "$DATA/distributions.json" > "$TMP/d.json"
mv "$TMP/d.json" "$DATA/distributions.json"

echo "== post-cutoff counts =="
for f in members groups memberships songs distributions; do
  printf "%-15s %s items\n" "$f" "$(jq 'length' "$DATA/$f.json")"
done
