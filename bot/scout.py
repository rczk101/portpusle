import json, os, re, urllib.request, urllib.error, urllib.parse
from datetime import datetime, timedelta, timezone
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "public" / "data"
SITE_REPO = "rczk101/portpusle"
SITE_URL = "https://rczk101.github.io/portpusle/"
TOKEN = os.environ.get("GITHUB_TOKEN")
WEBHOOK = os.environ.get("DISCORD_WEBHOOK")
RISKY = ("download", "crack", "torrent", "free", "leak", "keygen", "repack")
QUERIES = ["GTA VI recompilation", "GTA 6 pc port", "gta6 recomp", "gta vi port"]

now = datetime.now(timezone.utc)
today = now.strftime("%Y-%m-%d")


def api(path):
    h = {"Accept": "application/vnd.github+json", "User-Agent": "portpulse-scout"}
    if TOKEN:
        h["Authorization"] = "Bearer " + TOKEN
    try:
        with urllib.request.urlopen(urllib.request.Request("https://api.github.com" + path, headers=h), timeout=25) as r:
            return r.status, json.load(r)
    except urllib.error.HTTPError as e:
        return e.code, None
    except Exception:
        return 0, None


def load(name, default):
    p = DATA / (name + ".json")
    return json.loads(p.read_text("utf-8")) if p.exists() else default


def save(name, obj):
    DATA.mkdir(parents=True, exist_ok=True)
    (DATA / (name + ".json")).write_text(json.dumps(obj, ensure_ascii=False, indent=1), "utf-8")


# 1. Projets depuis src/data.ts
projects = []
for line in (ROOT / "src" / "data.ts").read_text("utf-8").splitlines():
    m = re.search(r"id: '([^']+)'.*?score: ([\d.]+)", line)
    if m:
        r = re.search(r"repo: '([^']+)'", line)
        projects.append({"id": m.group(1), "score": float(m.group(2)), "repo": r.group(1) if r else None})

prev = load("repos", {"repos": {}, "candidates": []})
events = load("events", [])
new_events = []


def ev(title, project=""):
    new_events.append({"date": now.strftime("%Y-%m-%dT%H:%M"), "title": title, "project": project})


# 2. Santé des dépôts suivis
repos = {}
for p in projects:
    if not p["repo"]:
        continue
    code, j = api("/repos/" + p["repo"])
    old = prev["repos"].get(p["repo"], {})
    if code in (404, 451):
        info = {**old, "status": "removed"}
        if old.get("status") != "removed":
            ev(f"Dépôt retiré ou indisponible (HTTP {code}) : {p['repo']}", p["id"])
    elif code == 200 and j:
        pushed = j["pushed_at"]
        age = (now - datetime.fromisoformat(pushed.replace("Z", "+00:00"))).days
        info = {"status": "inactive" if age > 60 else "active", "stars": j["stargazers_count"], "pushed": pushed}
        c2, rel = api(f"/repos/{p['repo']}/releases/latest")
        if c2 == 200 and rel:
            info["tag"] = rel["tag_name"]
            if old.get("tag") and old["tag"] != rel["tag_name"]:
                ev(f"Nouvelle version {rel['tag_name']} : {p['repo']}", p["id"])
        elif old.get("tag"):
            info["tag"] = old["tag"]
        if old.get("status") == "removed":
            ev(f"Dépôt de nouveau disponible : {p['repo']}", p["id"])
    else:
        info = old or {"status": "active"}  # erreur réseau ou limite : on garde l'ancien état
    repos[p["repo"]] = info

# 3. Nouveaux candidats (non vérifiés)
known = {p["repo"].lower() for p in projects if p["repo"]}
since = (now - timedelta(days=90)).strftime("%Y-%m-%d")
cands = {}
for q in QUERIES:
    code, j = api("/search/repositories?" + urllib.parse.urlencode({"q": f"{q} pushed:>{since}", "sort": "updated", "per_page": 10}))
    for it in (j or {}).get("items", []):
        name = it["full_name"]
        text = (name + " " + (it.get("description") or "")).lower()
        if name.lower() in known or it["fork"] or it["stargazers_count"] < 2 or any(w in text for w in RISKY):
            continue
        cands[name] = {"repo": name, "stars": it["stargazers_count"], "pushed": it["pushed_at"], "desc": (it.get("description") or "")[:140]}
old_c = {c["repo"] for c in prev.get("candidates", [])}
candidates = sorted(cands.values(), key=lambda c: -c["stars"])[:20]
for c in candidates:
    if c["repo"] not in old_c and old_c:
        ev(f"Nouveau candidat détecté (non vérifié) : {c['repo']}")

save("repos", {"updated": now.strftime("%Y-%m-%dT%H:%M"), "repos": repos, "candidates": candidates})

# 4. Historique des scores
hist = load("history", [])
if not hist or hist[-1]["date"] != today:
    hist.append({"date": today, "scores": {p["id"]: p["score"] for p in projects}})
save("history", hist[-400:])

# 5. Tests validés (issues du site avec le label "valide")
code, issues = api(f"/repos/{SITE_REPO}/issues?labels=valide&state=all&per_page=100")
tests = []
for it in issues or []:
    f = {k.lower(): v.strip() for k, v in re.findall(r"^(\w+)\s*:\s*(.*)$", it.get("body") or "", re.M)}
    if not f.get("projet") or not f.get("gpu"):
        continue
    fps = re.sub(r"[^\d]", "", f.get("fps", ""))
    tests.append({
        "project": f["projet"], "gpu": f["gpu"], "cpu": f.get("cpu", ""), "os": f.get("os", ""),
        "version": f.get("version", ""), "fps": int(fps) if fps else None,
        "stage": f.get("jalon", ""), "crash": f.get("crash", "").lower().startswith("o"),
        "date": it["created_at"][:10], "by": it["user"]["login"], "url": it["html_url"],
    })
if code == 200:
    save("tests", tests)

# 6. Evènements, flux RSS, Discord
events = (new_events + events)[:300]
save("events", events)
items = "".join(
    f"<item><title>{escape(e['title'])}</title><link>{SITE_URL}</link><guid isPermaLink='false'>{escape(e['date'] + e['title'])}</guid></item>"
    for e in events[:50]
)
(ROOT / "public" / "feed.xml").write_text(
    f"<?xml version='1.0' encoding='UTF-8'?><rss version='2.0'><channel><title>PortPulse VI</title><link>{SITE_URL}</link>"
    f"<description>Changements des projets GTA VI</description>{items}</channel></rss>", "utf-8")

if WEBHOOK and new_events:
    msg = "\n".join("• " + e["title"] for e in new_events[:10])[:1900]
    try:
        req = urllib.request.Request(
            WEBHOOK, data=json.dumps({"content": "**PortPulse VI**\n" + msg}).encode(),
            headers={"Content-Type": "application/json", "User-Agent": "portpulse-scout"})
        urllib.request.urlopen(req, timeout=20)
    except Exception as e:
        print("Discord:", e)

print("OK", len(new_events), "nouveaux évènements")
