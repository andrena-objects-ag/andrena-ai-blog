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
