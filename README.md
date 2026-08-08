# Studio Calculator

Studio Calculator v0.2 ist eine kleine, statische Web-App für die schnelle
Rentabilitäts-, Kapitalbedarfs- und Finanzierungsrechnung von
Fitnessstudio-Projekten.

## Direkt ausprobieren

Die veröffentlichte Version läuft unter
[philvlas.github.io/studio-calculator](https://philvlas.github.io/studio-calculator/).

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
im Browser genutzt werden. Die Eingaben werden in v0.2 nicht zwischen Geräten
synchronisiert.

## Enthaltene Berechnungen

- operative Rentabilität, Break-even, Marge und Kapitalbedarf
- wechselseitige Berechnung von Monatsmiete und Kaltmiete je m²
- Eigenkapital, Bankdarlehen, Fördermittel und leasingfinanzierter Anteil
- vereinfachte Annuitätenrechnung mit Zins, Laufzeit und tilgungsfreier Anlaufzeit
- Finanzierungssaldo, Eigenkapitalquote und monatlicher Schuldendienst
- Cashflow nach Finanzierung, DSCR und vereinfachte Eigenkapitalrendite

Als nächste Ausbaustufen sind Szenarien und eine PDF-Ausgabe vorgesehen.

## GitHub Pages

Der vorbereitete Workflow veröffentlicht den Inhalt des `main`-Branches als
statische Website. Im GitHub-Repository muss dazu einmal unter
**Settings → Pages → Build and deployment** die Quelle **GitHub Actions**
ausgewählt werden.

## Spezifikation

Die Anforderungen und Rechenregeln stehen in
[`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md).
