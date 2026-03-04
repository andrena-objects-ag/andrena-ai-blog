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
