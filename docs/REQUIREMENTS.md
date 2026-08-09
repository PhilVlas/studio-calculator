# Studiocalculator

## Version

v0.8.1

## Ziel

Studiocalculator ist eine kleine, installierbare Webanwendung zur schnellen,
überschlägigen Rentabilitäts- und Kapitalbedarfsberechnung von
Fitnessstudio-Projekten.

Die Anwendung soll während Gesprächen und Projektbewertungen eine direkte
Einschätzung ermöglichen, ohne dafür eine umfangreiche Excel-Kalkulation öffnen
zu müssen.

## Ziel der aktuellen Version

Version 0.8.1 bleibt technisch bewusst einfach:

- keine Benutzerverwaltung
- kein Backend und keine Datenbank
- kein Framework und kein Build-Prozess
- automatische lokale Speicherung des aktuellen Entwurfs
- lokale Liste benannter Projekte
- Export und Import einer übertragbaren Projektdatei
- direkter Projekttransfer über einen Freigabelink
- alle Berechnungen finden direkt im Browser statt
- lauffähig auf Desktop, Tablet und Smartphone
- statisch über GitHub Pages oder einen vergleichbaren Dienst veröffentlichbar

## Eingabedaten

### Standort

- Projektname
- Fläche in m²
- Kaltmiete je m²
- alternativ direkt eingebbare monatliche Kaltmiete
- monatliche Nebenkosten
- mietfreie Anlaufzeit in Monaten

### Mitglieder

- Anzahl Mitglieder
- durchschnittlicher Monatsbeitrag brutto
- Umsatzsteuersatz

### Personal

- Personalkosten Position 1
- Personalkosten Position 2
- weitere monatliche Personalkosten

### Weitere laufende Kosten

- Marketing und Vertrieb
- sonstige monatliche Betriebskosten
- Reinigungskosten

### Investition und Reserve

- Geräte und Ausstattung
- Umbau und Baukosten
- weitere Einmalkosten
- Gründungskosten
- Anzahl Monate Liquiditätsreserve

### Finanzierung

- Eigenkapital
- Bankdarlehen
- Fördermittel und Zuschüsse
- leasingfinanzierter Anteil
- jährlicher Sollzins
- Darlehenslaufzeit in Jahren
- tilgungsfreie Anlaufzeit in Monaten
- monatliche Leasingrate

### Szenarien und Hochlauf

- Mitgliederzahl zum Betriebsstart
- Dauer des linearen Hochlaufs bis zur Basis-Mitgliederzahl
- Betrachtungszeitraum in Monaten
- prozentuale Mitgliederabweichung für vorsichtiges und optimistisches Szenario

## Berechnungen

### Monatsumsatz netto

`Mitglieder × Brutto-Monatsbeitrag ÷ (1 + Umsatzsteuersatz)`

### Monatliche Betriebskosten

Die monatliche Kaltmiete ergibt sich aus Fläche × Kaltmiete je m². Die
Betriebskosten sind die Summe aus Kaltmiete, Nebenkosten, allen
Personalkosten, Marketing, sonstigen Betriebskosten und Reinigung.

Kaltmiete je m² und monatliche Kaltmiete aktualisieren sich wechselseitig. Bei
einer Änderung der Fläche bleibt die Kaltmiete je m² bestehen und die
Monatsmiete wird neu berechnet.

### Monatliches Betriebsergebnis

`Monatsumsatz netto − monatliche Betriebskosten`

Das Ergebnis ist eine vereinfachte operative Kennzahl vor Finanzierung,
Abschreibungen, Ertragsteuern und Sondereffekten.

### Weitere Kennzahlen

- Jahresergebnis: monatliches Betriebsergebnis × 12
- Ergebnismarge: Betriebsergebnis ÷ Nettoumsatz
- Break-even-Mitglieder: Betriebskosten ÷ Netto-Beitrag je Mitglied, aufgerundet
- operatives Ergebnis pro m² und Monat: Betriebsergebnis ÷ Fläche
- Liquiditätsreserve: monatliche Betriebskosten × Reservemonate
- Kapitalbedarf: Einmalinvestitionen + Liquiditätsreserve
- rechnerische Amortisation: Kapitalbedarf ÷ positives Monatsbetriebsergebnis
- Projekt-ROI: Jahresbetriebsergebnis ÷ Kapitalbedarf

Die mietfreie Anlaufzeit verändert das nachhaltige monatliche Betriebsergebnis
nicht. Im Cashflow-Hochlauf entfällt die Kaltmiete in den eingestellten ersten
Monaten; alle übrigen Betriebskosten bleiben bestehen.

Die frei gewählte Liquiditätsreserve wird aus den vollständigen laufenden
Monatskosten berechnet und durch mietfreie Monate nicht reduziert. Sie ist ein
Sicherheitspuffer und Bestandteil des Kapitalbedarfs. Der prognostizierte
Liquiditätsbedarf im Hochlauf ist dagegen das höchste kumulierte Cashflow-Defizit
und wird nicht zusätzlich zum Kapitalbedarf addiert. App und PDF weisen beide
Werte und die Reserveformel getrennt aus.

### Finanzierung

- Gesamtfinanzierung: Eigenkapital + Bankdarlehen + Fördermittel +
  leasingfinanzierter Anteil
- Finanzierungssaldo: Kapitalbedarf − Gesamtfinanzierung
- Eigenkapitalquote: Eigenkapital ÷ Kapitalbedarf
- monatliche Darlehensrate: vereinfachte Annuität aus Darlehen, Sollzins und
  verbleibender Tilgungsdauer
- während der tilgungsfreien Anlaufzeit werden nur die rechnerischen Zinsen
  ausgewiesen
- Schuldendienst: Darlehensrate + monatliche Leasingrate
- Cashflow nach Finanzierung: Betriebsergebnis − Schuldendienst
- DSCR: Betriebsergebnis ÷ Schuldendienst
- vereinfachte Eigenkapitalrendite: jährlicher Cashflow nach Finanzierung ÷
  Eigenkapital
- rechnerische Eigenkapital-Amortisation: Eigenkapital ÷ positiver monatlicher
  Cashflow nach Finanzierung

Die Darlehensrate und der Cashflow nach Finanzierung beziehen sich auf die
reguläre Tilgungsphase nach einer gegebenenfalls tilgungsfreien Anlaufzeit.

### Szenariovergleich

- vorsichtiges Szenario: Basis-Mitgliederzahl abzüglich der eingestellten
  prozentualen Abweichung
- Basis-Szenario: aktuell eingetragene Mitgliederzahl
- optimistisches Szenario: Basis-Mitgliederzahl zuzüglich der eingestellten
  prozentualen Abweichung
- Beiträge, laufende Kosten und Finanzierung bleiben in allen drei Szenarien
  unverändert, damit der Einfluss der Mitgliederzahl sichtbar bleibt

### Cashflow-Hochlauf

- linearer Mitgliederaufbau von der Start-Mitgliederzahl bis zum Basisziel
- monatliches Betriebsergebnis und Cashflow nach Finanzierung
- während einer tilgungsfreien Anlaufzeit wird der reduzierte Schuldendienst
  aus Zinsen und Leasingrate verwendet
- während der mietfreien Anlaufzeit wird keine Kaltmiete angesetzt
- kumulierter Cashflow über den gewählten Betrachtungszeitraum
- Liquiditätsbedarf im Hochlauf als höchster kumulierter negativer Cashflow
- erster Monat mit nicht negativem Cashflow nach Finanzierung
- erster Monat, in dem der kumulierte Cashflow nach Finanzierung innerhalb des
  Betrachtungszeitraums mindestens den gesamten Kapitalbedarf erreicht

Der erste positive Monats-Cashflow und die Rückzahlung des Gesamtkapitals sind
getrennte Zeitpunkte. Die monatsgenaue Kapitalrückzahlung berücksichtigt den
Mitgliederhochlauf, die mietfreie Anlaufzeit und den Schuldendienst. Sie wird in
den aufklappbaren weiteren Details erklärt. Die vereinfachte rechnerische
Amortisation verwendet dagegen das konstante Betriebsergebnis vor Finanzierung.

### PDF-Bericht

- Der Bericht wird aus den aktuell sichtbaren Eingaben und Ergebnissen erzeugt.
- Die Ausgabe nutzt den Druckdialog des Browsers und kann dort als PDF
  gespeichert werden.
- Der Bericht enthält Projekt- und Kostendaten, zentrale Ergebnisse,
  Investition und Finanzierung, den Szenariovergleich sowie die monatliche
  Hochlauf-Tabelle.
- Die Berichtserstellung überträgt keine Projektdaten an einen Server.

### Lokale Projekte und Projektdateien

- Der aktuelle Entwurf wird nach Änderungen automatisch im Browser des
  verwendeten Geräts gespeichert und beim nächsten Aufruf wiederhergestellt.
- Aktuelle Eingaben können unter ihrem Projektnamen zusätzlich als benanntes
  Projekt in einer lokalen Projektliste gespeichert und später geladen werden.
- Lokal gespeicherte Projekte können einzeln vom verwendeten Gerät gelöscht
  werden. Der aktuelle Entwurf bleibt davon unberührt.
- Eine Projektdatei enthält alle fachlichen Eingabefelder sowie Format-, Schema-
  und App-Version. Sie wird im Browser als JSON-Datei erzeugt.
- Auf Geräten mit unterstützter Dateifreigabe öffnet die App das systemeigene
  Teilen-Menü. Andernfalls wird die Projektdatei heruntergeladen und kann danach
  manuell versendet werden.
- Beim Import werden ausschließlich bekannte Eingabefelder übernommen,
  Zahlenwerte auf die zulässigen Feldgrenzen beschränkt und unbekannte oder
  nicht passende Dateiformate abgewiesen.
- Lokale Speicherung und Dateierzeugung übertragen keine Projektdaten an einen
  Server. Eine Übertragung erfolgt nur durch die ausdrückliche Weitergabe der
  erzeugten Projektdatei.

### Freigabelink

- Der Link enthält das aktuelle Projekt in einem kompakten, kodierten
  URL-Fragment hinter `#` und kann über das systemeigene Teilen-Menü versendet
  oder in die Zwischenablage kopiert werden.
- URL-Fragmente werden beim Aufruf nicht an den Webserver übertragen. Der
  Browser liest und verarbeitet die enthaltenen Projektdaten lokal.
- Beim Öffnen wird das Projektformat geprüft und es werden ausschließlich die
  bekannten Calculator-Eingabefelder übernommen.
- Ein neuer Freigabelink wird auch dann sofort verarbeitet, wenn der Calculator
  im betreffenden Browser-Tab bereits geöffnet ist.
- Das empfangene Projekt ersetzt den aktuellen lokalen Entwurf, wird aber nicht
  automatisch in die benannte Projektliste aufgenommen.
- Nach erfolgreichem oder fehlgeschlagenem Einlesen entfernt die App den
  Datenabschnitt aus der sichtbaren Adresszeile.
- Wer den vollständigen Link erhält, kann die darin enthaltenen Projektwerte
  lesen und öffnen. Der Link darf deshalb nur bewusst an vorgesehene Personen
  weitergegeben werden.

## Ergebnisdarstellung

Die Anwendung zeigt:

- eine klare Bewertung: „Tragfähig“, „Knapp kalkuliert“ oder „Nicht tragfähig“
- Monats- und Jahresergebnis
- Vergleich von Nettoumsatz und laufenden Kosten
- Break-even-Mitgliederzahl
- Ergebnismarge und Ergebnis je m²
- Kapitalbedarf inklusive Reserve
- rechnerische Amortisationsdauer
- monatsgenauer Kapitalrückfluss im Cashflow-Hochlauf
- Finanzierungssaldo und Eigenkapitalquote
- monatliche Darlehensrate und gesamter Schuldendienst
- Cashflow nach Finanzierung, DSCR und vereinfachte Eigenkapitalrendite
- geschätzte Gesamtzinsen und rechnerische Eigenkapital-Amortisation
- drei vergleichbare Mitgliederszenarien mit Betriebsergebnis und Cashflow
- Hochlauf-Zusammenfassung und monatsgenaue Cashflow-Tabelle
- druckoptimierter PDF-Bericht mit Erstellungsdatum und fachlichem Hinweis
- kurze textliche Einordnung der wichtigsten Werte

## Plattform- und Repository-Konzept

- GitHub ist die zentrale Quelle für Quellcode, Spezifikation und Änderungen.
- Jede Arbeitsumgebung nutzt dasselbe Repository per Clone beziehungsweise Pull.
- ChatGPT-Projekt/Work hält Gespräche, Entscheidungen und Projektkontext zusammen.
- Die App selbst besteht nur aus statischen Dateien und kann deshalb ohne
  Serverlogik lokal geöffnet oder aus der Cloud bereitgestellt werden.
- Ein GitHub-Actions-Ablauf für GitHub Pages liegt im Repository bereit.

## Installation und Offline-Nutzung

- Die veröffentlichte Anwendung erfüllt die technischen Grundlagen einer
  installierbaren Progressive Web App.
- Das Web-App-Manifest enthält Name, Kurzname, Farben und App-Symbole in den
  erforderlichen Größen einschließlich eines maskierbaren Symbols.
- Geeignete Browser bieten die Installation über die Anwendung oder ihr eigenes
  Browsermenü an. Auf iPhone und iPad weist die Anwendung auf die Funktion
  „Zum Home-Bildschirm“ hin.
- Nach einem ersten vollständigen Online-Aufruf kann die Anwendungsoberfläche
  ohne Internetverbindung gestartet werden.
- Eine neue veröffentlichte Version ersetzt nicht ungefragt die aktuell
  geöffnete Oberfläche. Die Anwendung weist auf das Update hin und aktualisiert
  nach Bestätigung.
- Offline-Speicherung und Installation ändern nichts am lokalen Datenmodell:
  Projekte verbleiben weiterhin ausschließlich auf dem jeweiligen Gerät.

## Abgrenzung

Version 0.8.1 berücksichtigt insbesondere noch nicht:

- Zusatzumsätze, Rabatte, Ausfälle oder saisonale Schwankungen
- individuelle Tilgungspläne, Gebühren, variable Zinsen oder Sondertilgungen
- Abschreibungen oder Ertragsteuern
- getrennte fixe und variable Kosten
- Benutzerkonten und geräteübergreifend synchronisierte Eingaben
- zentrale Team-Projektablage, Berechtigungen oder Bearbeitungshistorie

Die Ergebnisse sind eine überschlägige Entscheidungshilfe und keine Finanz-,
Steuer- oder Rechtsberatung.

## Akzeptanzkriterien

1. Die App lässt sich direkt über `index.html` oder einen einfachen statischen
   Webserver öffnen.
2. Änderungen an Eingaben aktualisieren alle Ergebnisse sofort.
3. Leere oder ungültige Zahlenfelder führen nicht zu sichtbaren Rechenfehlern.
4. Die Bedienung funktioniert ohne horizontales Scrollen ab 320 px Breite.
5. Die App sendet keine eingegebenen Daten an einen Server.
6. Das Repository enthält eine nachvollziehbare Anleitung und eine vorbereitete
   GitHub-Pages-Veröffentlichung.
7. Der PDF-Bericht lässt sich über den Browser-Druckdialog speichern und enthält
   die zum Erstellungszeitpunkt aktuellen Projektwerte.
8. Der letzte Entwurf wird nach einem erneuten Seitenaufruf aus dem lokalen
   Browserspeicher wiederhergestellt.
9. Benannte Projekte können lokal gespeichert, geladen und gelöscht werden.
10. Eine erzeugte Projektdatei kann auf einem anderen Gerät wieder geöffnet
    werden, ohne dass die App unbekannte Dateiinhalte ausführt.
11. Ein gültiger Freigabelink öffnet das enthaltene Projekt direkt, ein
    ungültiger Link wird zurückgewiesen und anschließend aus der Adresszeile
    entfernt.
12. Die Bedienung verursacht auch bei exakt 320 px Viewportbreite keinen
    horizontalen Seitenlauf.
13. Die veröffentlichte Anwendung kann in unterstützten Browsern installiert
    und anschließend in einem eigenen App-Fenster gestartet werden.
14. Nach einem ersten vollständigen Online-Aufruf lässt sich die Oberfläche bei
    unterbrochener Internetverbindung erneut öffnen.
15. Bei einer neuen Version erscheint ein Aktualisierungshinweis, ohne den
    aktuellen Arbeitsstand ungefragt zu unterbrechen.
