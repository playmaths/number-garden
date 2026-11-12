#!/bin/sh
# Prints the anonymous daily usage counts of Number Garden (gardenUsage/{day}), newest first.
# Needs curl and jq. Uses the public web API key, so it works from any machine once the rule below is published.
#
# Firestore rule (inside match /databases/{database}/documents { ... }):
#   match /gardenUsage/{day} {
#     allow read: if true;
#     allow create, update: if day.matches('^20[0-9]{2}-[0-9]{2}-[0-9]{2}$')
#       && request.resource.data.keys().hasOnly(['day', 'devices', 'opens', 'starts', 'wins', 'startsByLevel', 'winsByLevel', 'families'])
#       && (!('families' in request.resource.data) || request.resource.data.families.size() <= 2000);
#     allow delete: if false;
#   }
# startsByLevel and winsByLevel are keyed by door (add, pat, puz, story, ...), the same shape as the sudoku app's usage collection.
KEY=AIzaSyCgG83-cqWqDuzOWrIQwqLBMF7sTwOkbWA
curl -s -X POST "https://firestore.googleapis.com/v1/projects/playmaths-6a181/databases/(default)/documents:runQuery?key=$KEY" \
  -H 'Content-Type: application/json' \
  -d '{"structuredQuery":{"from":[{"collectionId":"gardenUsage"}],"orderBy":[{"field":{"fieldPath":"__name__"},"direction":"DESCENDING"}],"limit":30}}' \
  | jq -r '.[] | select(.document) | .document.fields | "\(.day.stringValue)  devices=\(.devices.integerValue // 0)  opens=\(.opens.integerValue // 0)  trails=\(.starts.integerValue // 0)  flowers=\(.wins.integerValue // 0)"'
