# Aufgabe 1 (kompakt): Claude autonom eine Migration mittlerer Komplexität im kleinen Full-Stack-Repo durchführen

## Ziel

Du führst eine inkrementelle Migration im Repository `andrena-ai-blog-github` durch. Statt eines großen Strangler-Fig-Umbaus im `termini`-Projekt setzt du denselben Lernpfad in kleinerem Scope um:

- Bestehendes Verhalten bleibt stabil.
- Ein neuer API-Slice wird parallel eingeführt.
- Das Frontend konsumiert den neuen Slice über eine neue Route.
- Tests, Planung, Dokumentation und Wiederverwendbarkeit (Skill/Hooks) bleiben Teil der Übung.

**Hinweis:** Diese Aufgabe wird komplett mit diesem Repository durchgeführt: `https://code.andrena.de/ki-migrations-aufgaben/andrena-ai-blog`

## Lernziele

1. Neue Codebasis mit `/init` schnell strukturieren und produktiv mit `CLAUDE.md` arbeiten.
2. Test-Infrastruktur als Sicherheitsnetz vor einer Migration nutzen.
3. Planning Mode für mittelkomplexe Änderungen verwenden.
4. Inkrementell migrieren: Altpfad bleibt, neuer Pfad kommt parallel dazu.
5. Backend- und Frontend-Änderungen gemeinsam validieren (manuell + automatisiert).
6. Erkenntnisse im Repo dokumentieren statt nur im Chat-Kontext zu behalten.
7. Wiederkehrende Arbeit als Skill standardisieren.
8. Optional: Guardrails über Hooks und Parallelisierung über Subagents/Worktrees anwenden.

---

## Übung 1: Projekt initialisieren, verstehen und Baseline sichern

### Ziel

Claude Code im kleinen Full-Stack-Repo initialisieren, Architektur erfassen und eine stabile Ausgangsbasis festhalten.

### Schritte

1. **Repository vorbereiten:**
   - Wechsle in das Projektverzeichnis `andrena-ai-blog-github`.
   - Lege einen neuen Branch für die Übung an.

2. **Claude initialisieren:**
   - Starte Claude Code und führe `/init` aus.
   - Prüfe die erzeugte `CLAUDE.md` und bereinige redundante Tooling-Infos.

3. **Architektur mit Claude klären:**
   - Frage nach Backend-Struktur (Django + DRF) und Frontend-Struktur (Angular).
   - Beispiel:
     > `Beschreibe mir die wichtigsten Backend-Module, API-Endpunkte und die Frontend-Routen für die Home-Seite.`

4. **App lokal starten lassen:**
   - Backend starten (`uv` + Django), z. B.:
     ```bash
     uv sync --directory backend
     uv run --directory backend python manage.py migrate
     uv run --directory backend python manage.py runserver
     ```
   - Frontend starten (`npm --prefix=frontend start`).
   - Prüfen:
     - `http://localhost:8000/api/tags`
     - `http://localhost:4200/#/`

5. **Baseline-Tests laufen lassen:**
   - Backend-Tests starten:
     ```bash
     uv run --directory backend python manage.py test
     ```
   - API-Contract-Tests starten:
     ```bash
     npm --prefix=frontend run test:api
     ```

6. **Kontext leeren:**
   - `/context` prüfen, danach `/clear`.

### Akzeptanzkriterien

- `CLAUDE.md` ist vorhanden und sinnvoll bereinigt.
- Backend und Frontend laufen lokal.
- Mindestens ein automatisierter Baseline-Testlauf ist dokumentiert.

---

## Übung 2: Test-Infrastruktur gezielt erweitern

### Ziel

Vor der Migration eine minimale zusätzliche Absicherung schaffen.

### Schritte

1. **Test-Landschaft erfassen:**
   - Claude fragen:
     > `Welche Testarten existieren hier (Backend-Tests, Angular-Tests, API-Contract-Tests)? Welche Lücken siehst du für eine Home-Page-Migration?`

2. **Mindestens einen neuen Test vorziehen:**
   - Lasse einen zusätzlichen Test erstellen, der späteren Umbau absichert (z. B. Response-Shape eines Home-Feeds oder Tag-Reihenfolge).
   - Test muss grün sein.

3. **Kurz reviewen:**
   - Ist der Test stabil (keine fragilen Zufallsannahmen, keine Sleep-Abhängigkeiten)?

### Akzeptanzkriterien

- Mindestens ein neuer sinnvoller Test wurde ergänzt und läuft grün.
- Testzweck ist klar dokumentiert.

---

## Übung 3: Migrations-Plan im Planning Mode erstellen

### Ziel

Eine konkrete, reviewbare Planung erstellen, bevor Code geschrieben wird.

### Migrationsziel für diese Aufgabe

Die bestehende Home-Implementierung bleibt unverändert unter `/#/`.
Zusätzlich wird ein neuer vertikaler Slice eingeführt:

- Neuer Backend-Endpunkt: `GET /api/home`
- Neue Frontend-Route: `/#/home-v2`
- `home-v2` soll Artikel + Tags in **einem** API-Call laden
- Bestehende Endpunkte (`/api/articles`, `/api/articles/feed`, `/api/tags`) bleiben kompatibel

### Schritte

1. **Kontext leeren:**
   - `/clear`

2. **Planning Mode aktivieren:**
   - `Shift+Tab` zweimal oder `/plan`

3. **Plan-Prompt geben:**
   - Beispiel:
     > `Plane die Migration für einen neuen Home-Slice. Bestehende Route / bleibt wie sie ist. Implementiere zusätzlich GET /api/home (liefert articles, articlesCount, tags) und die Angular-Route /home-v2, die diese Daten in einem Request lädt. Nenne konkrete Dateien, Tests und Reihenfolge.`

4. **Plan reviewen:**
   - Prüfen, ob enthalten sind:
     1. Dateiänderungen in Django und Angular
     2. Teststrategie (Backend + Frontend/API)
     3. Rückfallstrategie bei Fehlern

5. **Plan noch nicht ausführen:**
   - Plan stehen lassen, noch nicht bestätigen.

### Akzeptanzkriterien

- Ein konkreter Plan mit Dateien, Schritten und Tests liegt vor.
- Es wurde noch kein Implementierungscode geschrieben.

---

## Übung 4: Migration umsetzen und End-to-End validieren

### Ziel

Neuen `home-v2`-Slice implementieren, Altverhalten intakt lassen, Tests grün halten.

### Schritte

1. **Plan bestätigen und umsetzen lassen:**
   - Plan freigeben.
   - Falls nötig: `Setze den Plan jetzt um.`

2. **Auf folgende Punkte achten:**
   - Neuer Endpunkt `GET /api/home` existiert.
   - Route `/#/home-v2` existiert.
   - Bestehende Home-Route `/#/` funktioniert unverändert.
   - Datenmodell für `home-v2` ist klar typisiert.

3. **Manuelle API-Prüfung:**
   ```bash
   curl -s "http://localhost:8000/api/home?limit=10&offset=0" | jq .
   ```

4. **Manuelle UI-Prüfung:**
   - `http://localhost:4200/#/` (Altpfad)
   - `http://localhost:4200/#/home-v2` (Neupfad)
   - Artikelliste und Tags fachlich vergleichen.

5. **Regressionstests ausführen:**
   - Backend-Tests
   - Frontend-Tests (falls im Scope)
   - API-Contract-Tests:
     ```bash
     npm --prefix=frontend run test:api
     ```

### Akzeptanzkriterien

1. `GET /api/home` antwortet mit HTTP 200 und den erwarteten Feldern.
2. `/#/home-v2` funktioniert und nutzt den neuen Endpunkt.
3. `/#/` bleibt funktional unverändert.
4. Relevante Tests sind grün.

---

## Übung 5: Lessons Learned im Repo sichern

### Ziel

Session-Wissen dauerhaft dokumentieren (statt im Chat-Kontext zu verlieren).

### Schritte

1. **Claude vor `/clear` zusammenfassen lassen:**
   > `Fasse Bugs, Fixes und Entscheidungen aus der Home-v2-Migration zusammen. Trenne in allgemeine Konventionen (CLAUDE.md) und aufgabenspezifische Fallstricke (docs-Datei).`

2. **Dokumente erzeugen lassen:**
   - `CLAUDE.md` ergänzen (z. B. API-Design- und Testkonventionen)
   - `docs/home-v2-migration-pitfalls.md` anlegen

3. **Kontext leeren:**
   - `/clear`

### Akzeptanzkriterien

- `CLAUDE.md` wurde sinnvoll erweitert.
- Eine spezifische Pitfall-Doku unter `docs/` existiert.
- Kontext ist geleert.

---

## Übung 6: Migrations-Skill erstellen

### Ziel

Den Workflow als wiederverwendbaren Skill kapseln.

### Schritte

1. **Skill-Verzeichnis anlegen:**
   ```bash
   mkdir -p .claude/skills/migrate-home-slice
   ```

2. **`SKILL.md` erstellen (Startpunkt):**

   ```markdown
   ---
   name: migrate-home-slice
   description: Führt eine inkrementelle Home-Slice-Migration (Django + Angular) durch
   user-invocable: true
   allowed-tools:
     - Bash
     - Read
     - Edit
     - Write
     - Glob
     - Grep
   argument-hint: <new-endpoint> <new-route>
   ---

   Du hilfst mir bei einer inkrementellen Migration im andrena-ai-blog Projekt.

   Workflow:

   1. Analysiere bestehende Backend- und Frontend-Flows.
   2. Erstelle zuerst einen Plan (ohne Code).
   3. Warte auf Bestätigung.
   4. Implementiere neuen API-Slice + neue Route, ohne Altpfad zu brechen.
   5. Ergänze/aktualisiere Tests.
   6. Führe Regressionstests aus und fasse Änderungen zusammen.
   ```

3. **Skill testen:**
   - Beispielaufruf:
     ```
     /migrate-home-slice /api/home /home-v2
     ```

### Akzeptanzkriterien

- `.claude/skills/migrate-home-slice/SKILL.md` existiert.
- Skill ist aufrufbar und hält den Ablauf `Plan -> Bestätigung -> Umsetzung -> Validierung` ein.

---

## Optional Übung 7: Guardrails mit Hooks

### Ziel

Wichtige Regeln technisch absichern (nicht nur als Prompt).

### Vorschlag

1. **PreToolUse-Hook:** blockiert Änderungen am Legacy-Home-Pfad (`frontend/src/app/pages/home/`), solange die Migration läuft.
2. **Stop-Hook:** führt einmal pro Turn Tests aus, wenn `.py` oder `.ts` geändert wurden.

### Akzeptanzkriterien

- Legacy-Home-Dateien sind durch Hook geschützt.
- Test-Gate läuft deterministisch und verhindert stilles Brechen.

---

## Optional Übung 8: Parallele Folge-Migration mit Subagents/Worktrees

### Ziel

Paralleles Arbeiten in isolierten Worktrees praktisch anwenden.

### Vorschlag

- Starte zwei Subagents parallel:
  1. Agent A: zusätzliche Tests für `/api/home`
  2. Agent B: UI-Polish für `home-v2`
- Führe Ergebnisse anschließend kontrolliert zusammen.

### Akzeptanzkriterien

- Zwei parallele Streams liefen in getrennten Worktrees.
- Ergebnisse wurden ohne Konfliktverlust integriert.
