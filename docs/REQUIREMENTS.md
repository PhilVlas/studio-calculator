# Studio Calculator

## Version

v0.1

## Ziel

Studio Calculator ist eine kleine Webanwendung zur schnellen, überschlägigen
Rentabilitäts- und Kapitalbedarfsberechnung von Fitnessstudio-Projekten.

Die Anwendung soll während Gesprächen und Projektbewertungen eine direkte
Einschätzung ermöglichen, ohne dafür eine umfangreiche Excel-Kalkulation öffnen
zu müssen.

## Ziel der ersten Version

Version 0.1 bleibt bewusst einfach:

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
- monatliche Kaltmiete
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

### Investition und Reserve

- Geräte und Ausstattung
- Umbau und Baukosten
- weitere Einmalkosten
- Anzahl Monate Liquiditätsreserve

## Berechnungen

### Monatsumsatz netto

`Mitglieder × Brutto-Monatsbeitrag ÷ (1 + Umsatzsteuersatz)`

### Monatliche Betriebskosten

Summe aus Kaltmiete, Nebenkosten, allen Personalkosten, Marketing und sonstigen
Betriebskosten.

### Monatliches Betriebsergebnis

`Monatsumsatz netto − monatliche Betriebskosten`

Das Ergebnis ist eine vereinfachte operative Kennzahl vor Finanzierung,
Abschreibungen, Ertragsteuern und Sondereffekten.

### Weitere Kennzahlen

- Jahresergebnis: monatliches Betriebsergebnis × 12
- Ergebnismarge: Betriebsergebnis ÷ Nettoumsatz
- Break-even-Mitglieder: Betriebskosten ÷ Netto-Beitrag je Mitglied, aufgerundet
- Ergebnis pro m²: Betriebsergebnis ÷ Fläche
- Liquiditätsreserve: monatliche Betriebskosten × Reservemonate
- Kapitalbedarf: Einmalinvestitionen + Liquiditätsreserve
- rechnerische Amortisation: Kapitalbedarf ÷ positives Monatsbetriebsergebnis

## Ergebnisdarstellung

Die Anwendung zeigt:

- eine klare Bewertung: „Tragfähig“, „Knapp kalkuliert“ oder „Nicht tragfähig“
- Monats- und Jahresergebnis
- Vergleich von Nettoumsatz und laufenden Kosten
- Break-even-Mitgliederzahl
- Ergebnismarge und Ergebnis je m²
- Kapitalbedarf inklusive Reserve
- rechnerische Amortisationsdauer
- kurze textliche Einordnung der wichtigsten Werte

## Plattform- und Repository-Konzept

- GitHub ist die zentrale Quelle für Quellcode, Spezifikation und Änderungen.
- Jede Arbeitsumgebung nutzt dasselbe Repository per Clone beziehungsweise Pull.
- ChatGPT-Projekt/Work hält Gespräche, Entscheidungen und Projektkontext zusammen.
- Die App selbst besteht nur aus statischen Dateien und kann deshalb ohne
  Serverlogik lokal geöffnet oder aus der Cloud bereitgestellt werden.
- Ein GitHub-Actions-Ablauf für GitHub Pages liegt im Repository bereit.

## Abgrenzung

Version 0.1 berücksichtigt insbesondere noch nicht:

- Zusatzumsätze, Rabatte, Ausfälle oder saisonale Schwankungen
- Finanzierungskosten, Leasing, Abschreibungen oder Ertragsteuern
- getrennte fixe und variable Kosten
- Szenarien, Versionen, Export oder Projektspeicherung
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
