# Studiocalculator

Studiocalculator v0.10.0 ist eine kleine, installierbare Web-App für die schnelle
Rentabilitäts-, Kapitalbedarfs- und Finanzierungsrechnung von
Fitnessstudio-Projekten.

## Direkt ausprobieren

Die veröffentlichte Version läuft unter
[philvlas.github.io/studio-calculator](https://philvlas.github.io/studio-calculator/).

`index.html` im Browser öffnen. Die Berechnung und lokale Speicherung laufen
vollständig auf dem Gerät; es werden keine Projektdaten an einen Server
übertragen.

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
├── assets/                      # Originale Marken- und Bilddateien
├── icons/                       # App-Symbole für Installation und Home-Bildschirm
├── app.js                       # Berechnungslogik
├── index.html                   # Oberfläche und Inhalte
├── manifest.webmanifest         # Name und Installationsinformationen der App
├── service-worker.js            # Offline-Nutzung und Aktualisierungen
├── styles.css                   # Gestaltung und responsive Ansicht
└── README.md
```

## Plattformübergreifend arbeiten

GitHub ist die zentrale Codebasis. Auf jedem Computer wird das Repository
geklont und vor der Arbeit aktualisiert. ChatGPT-Projekt/Work dient parallel als
Zentrale für Gespräche, Anforderungen und Entscheidungen.

Auf Smartphone, Tablet und Computer kann die über GitHub Pages veröffentlichte
App direkt im Browser genutzt und auf geeigneten Geräten installiert werden.
Nach dem ersten erfolgreichen Aufruf steht die App auch ohne Internetverbindung
zur Verfügung. Der aktuelle Entwurf und benannte Projekte werden in v0.10.0 lokal
im jeweiligen Browser gespeichert. Ein Freigabelink ermöglicht den
direkten Wechsel auf ein anderes Gerät oder die Weitergabe an Teammitglieder;
eine automatische Cloud-Synchronisierung findet weiterhin nicht statt.

## App installieren

- In Chrome oder Edge erscheint in der App die Schaltfläche **App installieren**,
  sobald der Browser die Installation anbietet.
- Auf iPhone und iPad **Teilen → Zum Home-Bildschirm** wählen.
- Die installierte App öffnet sich in einem eigenen Fenster und kann nach dem
  ersten vollständigen Laden offline gestartet werden.
- Neue veröffentlichte Versionen werden im Hintergrund erkannt. Die App bietet
  dann **Jetzt aktualisieren** an.

## Projekte speichern und weitergeben

- Änderungen am aktuellen Entwurf werden automatisch auf dem Gerät gespeichert.
- **Projekt speichern** legt den aktuellen Stand unter seinem Projektnamen in
  der lokalen Projektliste ab oder aktualisiert ihn.
- Ein ausgewähltes lokales Projekt kann geladen oder vom Gerät gelöscht werden.
- **Freigabelink teilen** öffnet auf geeigneten Geräten das Teilen-Menü. Falls
  dieses nicht verfügbar ist, wird der Link kopiert.
- Der empfangene Freigabelink öffnet das Projekt direkt im Studiocalculator und
  speichert es auf dem Zielgerät zunächst als aktuellen Entwurf. Das funktioniert
  auch, wenn der Calculator im verwendeten Tab bereits geöffnet ist.
- **Projektdatei herunterladen** erzeugt eine zusätzliche lokale Sicherung.
- **Projektdatei öffnen** übernimmt eine zuvor erzeugte
  `.studiocalculator.json`-Datei und speichert sie als aktuellen Entwurf. Dateien
  aus älteren Versionen mit `.studio-calculator.json` bleiben kompatibel.

Freigabelink und Projektdatei enthalten ausschließlich die eingegebenen
Calculator-Werte und technische Versionsangaben. Beides wird vollständig im
Browser erzeugt und nur dann weitergegeben, wenn die nutzende Person dies
ausdrücklich auslöst. Der Datenabschnitt hinter `#` wird beim Öffnen eines Links
nicht an den Webserver übertragen.

## Enthaltene Berechnungen

- operative Rentabilität, Break-even, Marge und Kapitalbedarf
- mietfreie Anlaufzeit im monatlichen Cashflow-Hochlauf
- Projekt-ROI als Jahresbetriebsergebnis im Verhältnis zum Kapitalbedarf
- monatsgenaue Prüfung, wann der kumulierte Cashflow den Kapitalbedarf zurückverdient
- klare Trennung zwischen frei gewählter Liquiditätsreserve und prognostiziertem
  Liquiditätsbedarf im Hochlauf
- wechselseitige Berechnung von Monatsmiete und Kaltmiete je m²
- getrennte Finanzierungsblöcke für Bankdarlehen, Leasing und private Investoren
- Leasing mit Zins, Laufzeit, veränderbarer Monats- und Abschlussrate sowie
  wahlweise einer Belastung des Fälligkeits-Cashflows oder einer gleichmäßigen
  monatlichen Rücklage einschließlich sichtbarem Rücklagenaufbau
- private Investoren mit monatlicher Kapitalrückzahlung, Zins auf das offene
  Kapital und Restzahlung bei Fälligkeit
- vereinfachte Bank-Annuitätenrechnung mit Zins, Laufzeit und tilgungsfreier Anlaufzeit
- Finanzierungssaldo, Eigenkapitalquote und monatlicher Schuldendienst
- Cashflow nach Finanzierung, DSCR und vereinfachte Eigenkapitalrendite
- Vergleich von vorsichtigem, Basis- und optimistischem Mitgliederszenario
- linearer Mitgliederhochlauf mit monatlichem und kumuliertem Cashflow
- frei wählbare Cashflow-Betrachtung von bis zu 180 Monaten
- automatische Plausibilitätsprüfung für Finanzierungslücken, Überdeckungen,
  ungewöhnliche Schlussraten und Zahlungen außerhalb des Betrachtungszeitraums
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
