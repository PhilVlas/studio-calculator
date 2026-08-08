# Studio Calculator

Studio Calculator v0.5 ist eine kleine, statische Web-App für die schnelle
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
im Browser genutzt werden. Der aktuelle Entwurf und benannte Projekte werden in
v0.5 lokal im jeweiligen Browser gespeichert. Eine Projektdatei ermöglicht den
Wechsel auf ein anderes Gerät oder die Weitergabe an Teammitglieder; eine
automatische Cloud-Synchronisierung findet weiterhin nicht statt.

## Projekte speichern und weitergeben

- Änderungen am aktuellen Entwurf werden automatisch auf dem Gerät gespeichert.
- **Projekt speichern** legt den aktuellen Stand unter seinem Projektnamen in
  der lokalen Projektliste ab oder aktualisiert ihn.
- Ein ausgewähltes lokales Projekt kann geladen oder vom Gerät gelöscht werden.
- **Projektdatei weitergeben** öffnet auf geeigneten Mobilgeräten das Teilen-Menü
  und lädt die Datei auf anderen Geräten herunter.
- **Projektdatei öffnen** übernimmt eine zuvor erzeugte
  `.studio-calculator.json`-Datei und speichert sie als aktuellen Entwurf.

Die Projektdatei enthält ausschließlich die eingegebenen Calculator-Werte und
technische Versionsangaben. Sie wird vollständig im Browser erzeugt und nur
dann weitergegeben, wenn die nutzende Person dies ausdrücklich auslöst.

## Enthaltene Berechnungen

- operative Rentabilität, Break-even, Marge und Kapitalbedarf
- wechselseitige Berechnung von Monatsmiete und Kaltmiete je m²
- Eigenkapital, Bankdarlehen, Fördermittel und leasingfinanzierter Anteil
- vereinfachte Annuitätenrechnung mit Zins, Laufzeit und tilgungsfreier Anlaufzeit
- Finanzierungssaldo, Eigenkapitalquote und monatlicher Schuldendienst
- Cashflow nach Finanzierung, DSCR und vereinfachte Eigenkapitalrendite
- Vergleich von vorsichtigem, Basis- und optimistischem Mitgliederszenario
- linearer Mitgliederhochlauf mit monatlichem und kumuliertem Cashflow
- druckoptimierter PDF-Bericht mit Annahmen, Kennzahlen, Szenarien und Hochlauf

Für einen PDF-Bericht in der App **PDF-Bericht erstellen** wählen und im
anschließenden Druckdialog **Als PDF speichern** auswählen. Alle Berichtsdaten
werden weiterhin ausschließlich im Browser verarbeitet.

## GitHub Pages

Der vorbereitete Workflow veröffentlicht den Inhalt des `main`-Branches als
statische Website. Im GitHub-Repository muss dazu einmal unter
**Settings → Pages → Build and deployment** die Quelle **GitHub Actions**
ausgewählt werden.

## Spezifikation

Die Anforderungen und Rechenregeln stehen in
[`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md).
