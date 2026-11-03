#!/bin/sh
# lists the Tell Pip reports, newest first, and saves each report's screenshot (JPEG) and page snapshot (HTML) under tools/reports/. Needs curl and python3; no secrets involved (the web key is public, the rules allow reading reports)
cd "$(dirname "$0")" && mkdir -p reports
curl -s "https://firestore.googleapis.com/v1/projects/playmaths-6a181/databases/(default)/documents/reports?key=AIzaSyCgG83-cqWqDuzOWrIQwqLBMF7sTwOkbWA&pageSize=100" | python3 -c '
import sys,json,base64,re
d=json.load(sys.stdin);docs=d.get("documents",[])
rows=[]
for doc in docs:
    f=doc["fields"];g=lambda k:f.get(k,{}).get("stringValue",f.get(k,{}).get("integerValue",""))
    when=g("when");name=re.sub(r"[^0-9T]","",when)[:15]
    shot=g("shot");html=g("html");files=[]
    if shot.startswith("data:image/jpeg;base64,"):
        open("reports/%s.jpg"%name,"wb").write(base64.b64decode(shot.split(",",1)[1]));files.append("reports/%s.jpg"%name)
    if html:
        open("reports/%s.html"%name,"w").write("<!doctype html><meta charset=utf-8><title>%s</title><p>%s · %s level %s · %s</p><hr>%s"%(name,g("label"),g("game"),g("level"),g("device"),html));files.append("reports/%s.html"%name)
    rows.append((when,g("label"),g("game"),g("level"),g("prompt"),g("stage")[:80],g("ver"),g("family"),g("device")," ".join(files)))
rows.sort(reverse=True)
print(len(rows),"reports")
for r in rows: print(" | ".join(str(x) for x in r))
'
