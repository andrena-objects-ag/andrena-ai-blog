# Aufgabe 1: Claude autonom eine Migration mittlerer Komplexität im kleinen Full-Stack-Repo durchführen

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


---

# Aufgabe 2: Multi-Agent-Orchestrierung — Paralleles Arbeiten mit Worktrees

## Ziel

Git-Worktrees als Isolationsmechanismus für parallele Agent-Sessions verstehen und anwenden. Erst manuell die Grundlagen erleben, dann mit `claude --worktree` zwei unabhängige Aufgaben gleichzeitig bearbeiten lassen. Diese Übung bereitet auf die automatisierte Subagent-Orchestrierung vor.

**Hinweis:** Diese Aufgabe wird im selben Repository wie Aufgabe 1 durchgeführt: `https://code.andrena.de/ki-migrations-aufgaben/termini`

---

## Übung 1: Git-Worktrees manuell anlegen und verstehen (~5 Min.)

### Ziel

Verstehen, dass Worktrees kein Agent-Feature sind, sondern ein Git-Grundbaustein aus drei Befehlen: `add`, `list`, `remove`.

### Schritte

1. **Worktree anlegen:**

   - Navigiere im Terminal in das Termini-Verzeichnis und erstelle einen neuen Worktree:
     ```bash
     cd termini
     git worktree add ../termini-feature-a -b feature-a
     ```
   - Damit entsteht ein neues Verzeichnis `termini-feature-a` neben deinem Hauptverzeichnis, mit einem eigenen Branch `feature-a`.

2. **Worktrees auflisten:**

   ```bash
   git worktree list
   ```

   → Du siehst zwei Einträge: den Hauptworktree (`termini`) und den neuen (`termini-feature-a`) mit Branch `feature-a`.

3. **Worktree inspizieren:**

   ```bash
   ls ../termini-feature-a
   ```

   → Identischer Dateibaum wie im Hauptverzeichnis, aber eigener Branch. Änderungen hier berühren den Hauptworktree nicht.

4. **Worktree wieder entfernen:**

   ```bash
   git worktree remove ../termini-feature-a
   ```

5. **Ergebnis prüfen:**

   ```bash
   git worktree list
   ```

   → Nur noch ein Eintrag: der Hauptworktree.

### Kernbotschaft

> Git-Worktrees gibt es seit Git 2.5 (2015) und besteht im Wesentlichen aus drei Befehlen: `add`, `list`, `remove`. Das hat erstmal nichts mit KI-Agents zu tun.

### Acceptance Criteria

1. Ein Worktree wurde erfolgreich angelegt und wieder entfernt.
2. Du kannst erklären, was ein Git-Worktree ist und warum er für parallele Agent-Sessions nützlich ist.

---

## Übung 2: Parallele Claude-Sessions mit `--worktree` (~8 Min.)

### Ziel

Erleben, wie Claude Code den Worktree-Mechanismus nutzt, um zwei unabhängige Aufgaben gleichzeitig in isolierten Umgebungen zu bearbeiten.

### Schritte

1. **Erstes Terminal — Worktree-Session starten:**

   ```bash
   cd termini
   claude --worktree feature-api-docs
   ```

   Claude erstellt automatisch `.claude/worktrees/feature-api-docs/` mit einem eigenen Branch `worktree-feature-api-docs` und startet dort eine Session.

2. **Ersten Auftrag geben:**

   > `Erstelle eine Datei docs/api-overview.md, die alle bestehenden REST-Endpunkte unter /api/ dokumentiert. Nutze eine Markdown-Tabelle mit Spalten: HTTP-Methode, Pfad, Beschreibung.`

3. **Zweites Terminal öffnen (parallel!) — weitere Worktree-Session:**

   - Öffne ein **neues** Terminal-Fenster (das erste läuft weiter!) und starte eine zweite Session:
     ```bash
     cd termini
     claude --worktree feature-healthcheck
     ```

4. **Zweiten Auftrag geben:**

   > `Erstelle einen neuen Spring Boot Actuator Health-Endpunkt unter /api/health, der HTTP 200 mit {"status":"UP"} zurückgibt. Schreibe einen passenden Test.`

5. **Beobachten:**

   - Beide Sessions arbeiten gleichzeitig, ohne sich gegenseitig zu blockieren.
   - Jede Session hat ihren eigenen Branch (`worktree-feature-api-docs`, `worktree-feature-healthcheck`).
   - Dateien, die in einer Session erstellt werden, sind in der anderen nicht sichtbar.
   - Wie werden Worktrees in VSCode in Source Control angezeigt?

6. **Sessions beenden:**

   - Beende beide Sessions (Strg+C oder `/exit`).
   - Claude fragt beim Beenden, ob der Worktree behalten oder gelöscht werden soll.
   - Wähle **löschen** — die Branches und Worktrees werden aufgeräumt.

7. **Aufräumen prüfen:**

   ```bash
   git worktree list
   ```

   → Nur noch der Hauptworktree sollte übrig sein.

### Acceptance Criteria

1. Zwei parallele Claude-Sessions liefen gleichzeitig in getrennten Worktrees.
2. Beide Agents haben ihre Aufgabe unabhängig voneinander bearbeitet.
3. Nach dem Beenden sind die Worktrees aufgeräumt.

---

## Übung 3: Reflexion und Überleitung (~2 Min.)

### Diskussion im Plenum

- **Was habt ihr beobachtet?** Zwei Agents, zwei Branches, keine Konflikte.
- **Was fehlte?** Koordination! Niemand hat den Agents gesagt, wie die Ergebnisse zusammengeführt werden. Ihr musstet manuell zwei Terminals öffnen und zwei Prompts formulieren.
- **Überleitung:** Genau diese Koordination übernimmt in der nächsten Übung ein **Orchestrator-Agent**, der Subagents in Worktrees automatisch startet, ihre Ergebnisse einsammelt und zusammenführt — alles aus einem einzigen Prompt.


---

## Anhang: Nützliche Referenzen

- [Git Worktree Dokumentation](https://git-scm.com/docs/git-worktree) — Offizielle Git-Dokumentation zu Worktrees
- [Claude Code: Parallele Sessions mit Worktrees](https://code.claude.com/docs/en/common-workflows#run-parallel-claude-code-sessions-with-git-worktrees) — Offizielle Claude Code Dokumentation
- [Claude Code: Subagents](https://code.claude.com/docs/en/sub-agents) — Parallele Agenten und Multi-Agent-Workflows


---

# Aufgabe 3: Claude Code Usage analysieren

## Ziel

Die eigene Claude Code Nutzung reflektieren und analysieren. Dazu werden die eingebauten Analyse-Befehle `/stats` und `/insights` verwendet sowie externe Analyse-Dashboards von den Trainern vorgestellt. Ziel ist es, ein Gefühl für den eigenen Verbrauch, die häufigsten Workflows und Optimierungspotenziale zu entwickeln.

---

## Übung 1: Schnellübersicht mit `/stats`

### Ziel

Einen ersten Überblick über die eigene Claude Code Nutzung erhalten — Token-Verbrauch, Anzahl Sessions, häufig verwendete Tools.

### Schritte

1. **Claude Code starten:**

   - Öffne ein Terminal und starte Claude Code:
     ```bash
     claude
     ```

2. **`/stats` aufrufen:**

   - Gib im Chat den Befehl ein:
     ```
     /stats
     ```
   - Claude zeigt eine kompakte Zusammenfassung deiner bisherigen Nutzung an: Token-Verbrauch, Anzahl der Sessions, genutzte Tools und mehr.


---

## Übung 2: Detaillierte Analyse mit `/insights`

### Ziel

Eine tiefgehende Analyse der eigenen Claude Code Nutzung durchführen. `/insights` analysiert die lokale Session-History und erstellt einen ausführlichen Bericht über Nutzungsmuster, häufige Fehler und Optimierungspotenziale.

### Schritte

1. **`/insights` ausführen:**

   - Gib im Claude Code Chat den Befehl ein:
     ```
     /insights
     ```
   - **Hinweis:** Dieser Befehl dauert deutlich länger als `/stats`, da Claude die gesamte Session-History analysiert. Plane mehrere Minuten ein.

2. **Analyse lesen und reflektieren:**

   - Claude erstellt einen strukturierten Bericht, der typischerweise folgende Punkte umfasst:
     - **Nutzungsmuster**: Zu welchen Zeiten und wie intensiv wurde Claude genutzt?
     - **Häufige Workflows**: Welche Aufgabentypen wurden am meisten bearbeitet?
     - **Tool-Nutzung**: Welche Tools dominieren? Gibt es untergenutzte Tools?
     - **Fehler und Korrekturen**: Wo musste Claude häufig nachbessern?
     - **Empfehlungen**: Konkrete Vorschläge zur effektiveren Nutzung.


## Optional Übung 3: Externe Analyse-Dashboards erkunden

Falls genügend Zeit übrig ist, oder während `/insights` läuft, lohnt sich ein Blick auf externe Tools, die Claude Code Session-Daten visuell aufbereiten. Claude Code speichert alle Sessions lokal als JSONL-Dateien — diese können von externen Tools gelesen und analysiert werden.


### Claude Code History Viewer

Ein visuelles Dashboard zur Analyse der lokalen Claude Code Session-History.

- **Repository:** [claude-code-history-viewer](https://github.com/jhlee0409/claude-code-history-viewer)
- **Features:** Timeline-Ansicht, Token-Verbrauch pro Session, Tool-Nutzungsstatistiken, Session-Vergleiche


---

## Weiterführende Quellen

### Offizielle Dokumentation

- [Claude Code `/insights` Dokumentation](https://docs.anthropic.com/en/docs/claude-code/insights) — Offizielle Beschreibung des `/insights`-Befehls, seiner Funktionsweise und der analysierten Daten.

### Session-Logs verstehen

- [Simon Willison: Claude Code Logs](https://simonwillison.net/2025/Oct/22/claude-code-logs/)

### Externe Analyse-Tools

- [Claude Code History Viewer](https://github.com/jhlee0409/claude-code-history-viewer) — Visuelles Dashboard für Session-History
- [Claude Code Templates — Analytics](https://github.com/davila7/claude-code-templates?tab=readme-ov-file#-claude-code-analytics) — Analyse-Skripte und Templates

