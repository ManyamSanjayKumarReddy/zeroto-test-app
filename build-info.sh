#!/bin/sh
# Writes JSON saying, for each build-secret id given, whether it reached this build and how long
# it is. Never the value: the result is baked into the image, and the image holds no secret.
# Usage: sh build-info.sh BUILD_TOKEN NPM_TOKEN ... > build-info.json
printf '{'
first=1
for id in "$@"; do
  file="/run/secrets/$id"
  if [ -f "$file" ]; then present=true; length=$(wc -c < "$file" | tr -d ' '); else present=false; length=0; fi
  [ "$first" -eq 1 ] || printf ','
  first=0
  printf '"%s":{"present":%s,"length":%s}' "$id" "$present" "$length"
done
printf '}\n'
