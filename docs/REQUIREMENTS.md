# Studio Calculator

## Version

v0.4

## Ziel

Studio Calculator ist eine kleine Webanwendung zur schnellen, überschlägigen
Rentabilitäts- und Kapitalbedarfsberechnung von Fitnessstudio-Projekten.

Die Anwendung soll während Gesprächen und Projektbewertungen eine direkte
Einschätzung ermöglichen, ohne dafür eine umfangreiche Excel-Kalkulation öffnen
zu müssen.

## Ziel der aktuellen Version

Version 0.4 bleibt technisch bewusst einfach:

- keine Benutzerverwaltung
- kein Backend und keine Datenbank
- kein Framework und kein Build-Prozess
- keine dauerhafte Speicherung der eingegebenen Projektdaten
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
- kumulierter Cashflow über den gewählten Betrachtungszeitraum
- Liquiditätsbedarf im Hochlauf als höchster kumulierter negativer Cashflow
- erster Monat mit nicht negativem Cashflow nach Finanzierung

### PDF-Bericht

- Der Bericht wird aus den aktuell sichtbaren Eingaben und Ergebnissen erzeugt.
- Die Ausgabe nutzt den Druckdialog des Browsers und kann dort als PDF
  gespeichert werden.
- Der Bericht enthält Projekt- und Kostendaten, zentrale Ergebnisse,
  Investition und Finanzierung, den Szenariovergleich sowie die monatliche
  Hochlauf-Tabelle.
- Die Berichtserstellung überträgt keine Projektdaten an einen Server.

## Ergebnisdarstellung

Die Anwendung zeigt:

- eine klare Bewertung: „Tragfähig“, „Knapp kalkuliert“ oder „Nicht tragfähig“
- Monats- und Jahresergebnis
- Vergleich von Nettoumsatz und laufenden Kosten
- Break-even-Mitgliederzahl
- Ergebnismarge und Ergebnis je m²
- Kapitalbedarf inklusive Reserve
- rechnerische Amortisationsdauer
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

## Abgrenzung

Version 0.4 berücksichtigt insbesondere noch nicht:

- Zusatzumsätze, Rabatte, Ausfälle oder saisonale Schwankungen
- individuelle Tilgungspläne, Gebühren, variable Zinsen oder Sondertilgungen
- Abschreibungen oder Ertragsteuern
- getrennte fixe und variable Kosten
- gespeicherte Szenarioversionen oder Projektspeicherung
- Benutzerkonten und geräteübergreifend synchronisierte Eingaben

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
