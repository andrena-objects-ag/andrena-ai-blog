# Aufgabe 1: Claude Code autonom eine Migration durchführen lassen

## Gesamtziel

Das bestehende Projekt schrittweise migrieren: primär das Backend von Python/Django nach Java (Spring Boot). Optional kann zusätzlich das Frontend von Angular nach React migriert werden.

---

## Übung 1: Projekt initialisieren, verstehen und Baseline sichern

### Ziel

Claude Code im kleinen Full-Stack-Repo initialisieren, Architektur erfassen und eine stabile Ausgangsbasis festhalten.

### Schritte

1. **Claude initialisieren:**
   - Navigiere im Terminal in das Projektverzeichnis und starte Claude Code:
     ```bash
     claude
     ```
   - Führe im Chat `/init` aus. Claude analysiert die Codebasis und erstellt `CLAUDE.md`.
   - Tipp: Nutze `Ctrl + o`, um zwischen Default-Ansicht und Detailansicht zu wechseln.
   - Öffne die erzeugte `CLAUDE.md` und bereinige redundante Tooling-Infos (z. B. Build-/Formatierungsdetails, die bereits aus Konfigurationsdateien ableitbar sind).

2. **Architektur mit Claude klären:**
   - Frage nach Backend-Struktur (Django + DRF) und Frontend-Struktur (Angular).
   - Beispiel:
     > `Beschreibe mir die wichtigsten Backend-Module, API-Endpunkte und die Frontend-Routen für die Home-Seite.`

3. **App lokal starten lassen:**
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

4. **Baseline-Tests laufen lassen:**
   - Backend-Tests starten:
     ```bash
     uv run --directory backend python manage.py test
     ```
   - API-Contract-Tests starten:
     ```bash
     npm --prefix=frontend run test:api
     ```

5. **Kontext leeren:**
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

2. **Mindestens einen neuen Test erstellen:**
   - Lasse einen zusätzlichen Test erstellen, der späteren Umbau absichert (z. B. die Anzeige des Profilbilds mit einem Test absichern).
   - Test muss grün sein.



### Akzeptanzkriterien

- Bestehende Test-Infrastruktur ist verstanden.
- Mindestens ein neuer sinnvoller Test wurde ergänzt und läuft grün.


---

## Übung 3: Migrations-Plan erstellen (Planning Mode)

Für komplexe Aufgaben bietet Planning Mode eine strukturierte Zusammenarbeit: Claude erstellt einen detaillierten Plan, den du reviewen und anpassen kannst, bevor Code geschrieben wird.

### Ziel

Einen klaren, schrittweisen Migrationsplan für das Python/Django-Backend nach Java Spring Boot in `backend_java` erarbeiten.

### Schritte

1. **Kontext leeren:**
   - Starte mit einem frischen Kontext für die Planungsphase:
     ```
     /clear
     ```

2. **Planning Mode aktivieren:**
   - Drücke im Chat `Shift+Tab` zweimal, um den Planning Mode zu aktivieren.
   - Alternativ: `/plan`

3. **Migrationsziel formulieren:**
   - Beschreibe das Ziel klar und konkret:
     > `Ich möchte das bestehende Python-Backend nach Java Spring Boot in den Ordner backend_java migrieren. Bitte plane die Migration so, dass Port und Testdaten gleich bleiben, das README aktualisiert wird und die Verifikation über die Playwright-API-Tests aus dem README erfolgt. Erstelle einen Plan indem eine Schnittstelle nach der anderen umgezogen wird.`

4. **Plan gemeinsam besprechen:**
   - Claude wird einen Schritt-für-Schritt-Plan vorschlagen.
   - Prüfe: Sind die Schritte klein genug? Sind API-Kompatibilität, Datenübernahme und Teststrategie klar?
   - Stelle Rückfragen oder bitte um Anpassungen:
     > `Wie stellst du sicher, dass das Java-Backend API-seitig kompatibel bleibt und die Profilbilder korrekt angezeigt werden?`

5. **Plan stehen lassen – noch nicht genehmigen:**
   - Wenn der Plan inhaltlich steht, genehmige ihn noch nicht. Die Umsetzung folgt in Übung 4.
   - Lass den Plan als Ergebnis dieser Übung offen stehen.

### Akzeptanzkriterien

- Ein dokumentierter Plan liegt vor, es wurde noch kein Code geschrieben.

---

## Übung 4: Ersten Teil des Migrationsplans umsetzen und validieren

Jetzt wird ein begrenzter, gut reviewbarer Teil aus dem Plan aus Übung 3 umgesetzt.

### Ziel

Die ersten vier priorisierten Schnittstellen aus dem Migrationsplan nach `backend_java` umsetzen und das Ergebnis auf Funktionalität und Qualität prüfen.

### Schritte

1. **Plan bestätigen und Scope begrenzen:**
   - Bestätige den Plan aus Übung 3.
   - Setze einen klaren Fokus:
     > `Setze nur die ersten vier Schnittstellen aus dem Plan um.`

2. **Implementierung der ersten vier Schnittstellen:**
   - Claude soll nur die ersten vier geplanten API-Schnittstellen migrieren.
   - Achte darauf, dass Port, Testdaten und API-Verhalten kompatibel bleiben.
   - Falls sinnvoll, soll Claude nur die dafür nötigen README-Teile aktualisieren.

3. **Funktionale Verifikation:**
   - Starte das Java-Backend und prüfe die vier Schnittstellen.
   - Lasse die zugehörigen Playwright-API-Tests aus dem README laufen.
   

4. **Qualitätsprüfung:**
   - Führe vorhandene Backend-Tests aus.
   - Bewerte die Codequalität im Java Backend (Lesbarkeit, Struktur, offensichtliche Duplikation).
   - Bitte Claude um eine kurze Selbst-Review mit Fokus auf Risiken und offene Punkte.

### Akzeptanzkriterien

1. Die ersten vier geplanten Schnittstellen sind in `backend_java` implementiert.
2. Funktionale Verifikation (manuell + Playwright-API-Tests) ist durchgeführt.
3. Die Qualität wurde aktiv geprüft (Tests + Code-Review der Migrationsergebnisse).
4. Ergebnisse, offene Risiken und nächste Schritte sind dokumentiert.

---

## Übung 5: Lessons Learned (Compounding Engineering)

Noch bevor der Kontext geleert wird, lohnt es sich, das Wissen aus der aktuellen Session festzuhalten: Welche Probleme sind aufgetreten? Was wurde repariert? Welche Konventionen haben sich bewährt?

### Ziel

Erkenntnisse und Bug-Fixes aus der Java-Migration dokumentieren, bevor der Kontext geleert wird, in `CLAUDE.md` (allgemein) oder `docs/` (spezifisch).

### Schritte

1. **Claude befragen, was es repariert hat:**
   - Noch vor `/clear` fragen:
     > `Fasse hier im Chat zusammen, welche Probleme oder Bugs wir bei der Migration der ersten vier Schnittstellen hatten und wie du sie gelöst hast. Unterscheide zwischen allgemeinen Konventionen für CLAUDE.md und aufgabenspezifischen Fallstricken für docs/.`

2. **Feedback zur Qualität und zum Vorgehen geben:**
   - Wurden deine Qualitätsansprüche erfüllt? Wenn nein, gib gezieltes Feedback.
   - Wurde sinnvoll und nachvollziehbar gearbeitet?
   - Wurde sinnvoll committet?
   - Welche offenen Punkte müssen vor der nächsten Migrationswelle geklärt werden?

3. **Entscheidung: Wohin gehört welche Erkenntnis?**
   - Allgemein (für künftige Sessions relevant) in `CLAUDE.md`.
   - Spezifisch (für diese Migration relevant) in eine Datei unter `docs/`, z. B. `docs/java-migration-pitfalls.md`.

4. **Dokumentation anlegen lassen:**
   - `CLAUDE.md` ergänzen lassen:
     > `Ergänze CLAUDE.md um die Konventionen, die wir in dieser Teilmigration etabliert haben.`
   - Fallstrick-Datei anlegen lassen:
     > `Lege docs/java-migration-pitfalls.md an und dokumentiere darin konkrete Bugs, Fixes und Verifikationshinweise aus der Umsetzung der ersten vier Schnittstellen.`

5. **Kontext leeren:**
   - Erst jetzt `/clear`.

### Akzeptanzkriterien

- `CLAUDE.md` enthält mindestens eine neue oder geschärfte Konvention aus der Migration.
- Eine spezifische `docs/`-Datei mit konkreten Fallstricken und Fixes existiert.
- Der Kontext ist nach der Übung geleert.

---

## Übung 6: Skill erstellen

Wiederkehrende Aufgaben eignen sich hervorragend als Skills. Du musst dir dann nicht jedes Mal den Standard-Prompt überlegen – Claude folgt automatisch einem definierten Workflow. Normalerweise würden wir hier jetzt einen Skill erstellen, der den Workflow abbildet um einzelne Schnittstellen zu migrieren. Für alle weiteren Schnittstelle, die migriert werden, würde dieser Skill von Claude Code geladen und der dort beschriebenen Worklfow gefolt.
In unserem Beispielrepo (sehr klein) hätte der Schnittstellen-Migrations-Skill keinen Mehwert über den bereits angelegt Plan. Deshalb erstellen wir uns nun einen Meta-Skill, der das Feedback (Copounding Engineering) automatisiert.

###  `/learn`-Skill erstellen

#### Ziel

Lessons Learned aus einer Session systematisch im Repository sichern.

#### Schritte

1. **Skill-Verzeichnis anlegen:**
   ```bash
   mkdir -p .claude/skills/learn
   ```

2. **`SKILL.md` erstellen (Startpunkt):**

   ```markdown
   ---
   name: learn
   description: Sichert Lessons Learned aus der aktuellen Session in CLAUDE.md und docs/
   user-invocable: true
   allowed-tools:
     - Read
     - Edit
     - Write
     - Glob
     - Grep
   argument-hint: <topic>
   ---
   # Learn from Conversation

   Analyze the current conversation and extract key learnings, especially regarding:

   1. **Workflows**: How to accomplish tasks (e.g., creating PRs, getting ticket descriptions, running tests, deploying, debugging)
   2. **Patterns**: Code patterns, architectural decisions, or conventions discovered
   3. **Tools and Scripts**: Usage of helper scripts, pipeline tools, or development utilities
   4. **Common Pitfalls**: Issues encountered and how they were resolved
   5. **Best Practices**: Techniques that proved effective

   ## Your Task

   1. **Analyze project structure** first:
      - Check if CLAUDE.md exists (read it to understand current documentation)
      - Look for existing .llm/ directory and its contents
      - Identify project structure (monorepo, single project, subdirectories)
      - Find existing README files and documentation locations

   2. **Review the conversation** to identify actionable learnings and workflows

   3. **Determine documentation placement**:
      - **If documentation structure is clear** (CLAUDE.md references specific files, .llm/ directory exists with organized files):
      - Follow existing structure and naming conventions
      - **If structure is unclear or learnings don't fit existing categories**:
      - Use AskUserQuestion to ask the user where to document the learnings
      - Suggest options based on the learning type:
         - General workflows → CLAUDE.md (or create if doesn't exist)
         - Specialized topics → .llm/[topic].md (suggest creating .llm/ directory if needed)
         - Component-specific → Component's local README.md or CLAUDE.md
      - Provide clear descriptions of what would go in each option

   4. **Update documentation** by:
      - Adding new sections if the workflow is entirely new
      - Enhancing existing sections with additional details or examples
      - Creating new referenced markdown files in .llm/ for substantial new topics
      - Ensuring consistency with existing documentation style and structure

   5. **Present changes** to the user:
      - Summarize what learnings were captured
      - Show which files were updated
      - Explain the rationale for placement decisions

   ## Using AskUserQuestion for Unclear Categorization

   When the documentation structure is unclear or learnings don't fit existing categories, use AskUserQuestion:

   **Example for multiple learning types:**
   Question: "Where should I document these learnings?"
   Options:
   - "Update CLAUDE.md with general workflow" (Description: Add deployment workflow to main project documentation)
   - "Create .llm/deployment.md for specialized topic" (Description: Create new file in .llm/ directory specifically for deployment processes)
   - "Update backend/README.md for component-specific" (Description: Add to backend component documentation)

   **Example when suggesting new structure:**
   Question: "This project doesn't have a .llm/ directory yet. How should we organize documentation?"
   Options:
   - "Create .llm/ directory and organize by topic (Recommended)" (Description: Create .llm/deployment.md, .llm/testing.md, etc. Referenced from CLAUDE.md)
   - "Add everything to CLAUDE.md" (Description: Keep all documentation in single file with sections)
   - "Create topic-specific files in root" (Description: deployment.md, testing.md in project root)

   ## Important Guidelines

   - **Analyze before acting**: Always examine existing documentation structure before making changes
   - **Ask when unclear**: Use AskUserQuestion if documentation placement is ambiguous
   - **Suggest good structure**: Recommend creating .llm/ directory for organized, topic-based documentation
   - **Follow existing patterns**: Maintain consistency with the project's current documentation style
   - Focus on **reproducible workflows** and **actionable guidance**
   - Use **concrete examples** from the conversation (commands, code snippets, file paths)
   - Maintain the **progressive disclosure** principle (overview in CLAUDE.md, details in referenced files)
   - Don't duplicate information—**reference existing docs** when appropriate
   - Ensure documentation is **clear for future LLM consumption** and human developers

   ## Recommended Documentation Structure

   If the project lacks clear documentation organization, suggest this structure:


   project-root/
   ├── CLAUDE.md                    # Main documentation hub with overview and references
   ├── README.md                    # Project description and quick start
   └── .llm/                        # Detailed topic-specific documentation
      ├── workflows.md             # Common development workflows
      ├── deployment.md            # Deployment procedures
      ├── testing.md               # Testing strategies and patterns
      ├── troubleshooting.md       # Common issues and solutions
      └── [topic].md               # Other specialized topics


   **Benefits of .llm/ directory:**
   - Keeps detailed documentation organized and separate from code
   - Easy to reference from CLAUDE.md
   - Progressive disclosure (CLAUDE.md → .llm/topic.md)
   - Clear namespace for LLM-optimized documentation

   Begin by reading CLAUDE.md (if it exists) and exploring the project structure to understand current documentation organization, then analyze this conversation for learnings.
   
   ```

3. **Skill testen:**
   - Beispielaufruf:
     ```
     /learn 
     ```

#### Akzeptanzkriterien

- `.claude/skills/learn/SKILL.md` existiert.
- `/learn` ist im Chat aufrufbar.
- Der Skill aktualisiert `CLAUDE.md` und eine passende docs-Datei mit konkreten Lessons Learned.

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
