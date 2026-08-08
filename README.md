# Studio Calculator

Studio Calculator v0.1 ist eine kleine, statische Web-App für die schnelle
Rentabilitäts- und Kapitalbedarfsrechnung von Fitnessstudio-Projekten.

## Direkt ausprobieren

`index.html` im Browser öffnen. Die Berechnung läuft vollständig auf dem Gerät;
es werden keine Projektdaten gespeichert oder übertragen.

Alternativ kann der Ordner über einen beliebigen statischen Webserver
bereitgestellt werden, zum Beispiel:

```powershell
python -m http.server 8080
```

Danach `http://localhost:8080` im Browser öffnen.

## Projektstruktur

```text
studio-calculator/
├── .github/workflows/pages.yml  # Veröffentlichung über GitHub Pages
├── docs/REQUIREMENTS.md         # Fachliche Spezifikation
├── app.js                       # Berechnungslogik
├── index.html                   # Oberfläche und Inhalte
├── styles.css                   # Gestaltung und responsive Ansicht
└── README.md
```

## Plattformübergreifend arbeiten

GitHub ist die zentrale Codebasis. Auf jedem Computer wird das Repository
geklont und vor der Arbeit aktualisiert. ChatGPT-Projekt/Work dient parallel als
Zentrale für Gespräche, Anforderungen und Entscheidungen.

Auf Smartphone und Tablet kann die über GitHub Pages veröffentlichte App direkt
im Browser genutzt werden. Die Eingaben werden in v0.1 nicht zwischen Geräten
synchronisiert.

## GitHub Pages

Der vorbereitete Workflow veröffentlicht den Inhalt des `main`-Branches als
statische Website. Im GitHub-Repository muss dazu einmal unter
**Settings → Pages → Build and deployment** die Quelle **GitHub Actions**
ausgewählt werden.

## Spezifikation

Die Anforderungen und Rechenregeln stehen in
[`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md).
