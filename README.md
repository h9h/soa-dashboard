# SOA-Dashboard

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fh9h%2Fsoa-dashboard.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fh9h%2Fsoa-dashboard?ref=badge_large)

[FOSSA-Report](https://app.fossa.com/reports/676a814b-3ee3-45ac-9f49-b5f28b2f45ff)

## Überblick

Das Projekt besteht aus drei Teilen:

- einem React Frontend (`./frontend`)
- einem kleinen Server Backend für die Authentifizierung (`./backend-auth`)
- und optional einem kleinen Server Backend für Housekeeping-Jobs in der SOA (`./backend-jobs`)

Das Frontend liegt im Verzeichnis `./frontend`. Hierbei handelt es sich um ein
gewöhnliches [CRA-Projekt](https://github.com/facebook/create-react-app), welches eine Single Page App realisiert.

Die Backends sind [KOA-Server](https://koajs.com/):

- `./backend-auth/server.js` bietet eine REST-Schnittstelle zur LDAP-Authentifizierung
- `./backend-jobs/server.js` liefert eine API für's Housekeeping

Working Demo: [hier](https://h9h.github.io) User = Password = testuser

#### Warum überhaupt ein Backend?

Die Authentifizierung findet gegen ActiveDirectory/LDAP statt. Ich habe kein NPM-Modul gefunden, welches nicht
von dem [Net-Modul](https://nodejs.org/api/net.html) aus node abhängig wäre. Das steht offensichtlich im Browser
nicht zur Verfügung.

Eine Eigenimplementierung kam für mich nicht in Frage. Daher brauchte ich einen Node.js Prozess, der
die Authentifizierung abhandelt.

Die API für's Housekeeping bietet einen Zugriff auf lokale Verzeichnisse: zum einen für die Definition und Logs der
Housekeeping.Jobs, zum anderen um darüber für das Housekeeping benötigte Modell-Informationen bereit zu stellen.

### High-Level Architektur

Für das ESB-Dashboard spielen verschiedene Komponenten zusammen:

![Komponenten](./images/Komponentenskizze.png)

Basis für die Daten des Dashboards sind die Logpunkte aus der SOA, die für die verschiedenen Laufzeitumgebungen der
SOA über eine REST-Schnittstelle angebunden werden (siehe blauen Kasten). Die Authentifizierung des Nutzers erfolgt
über einen REST-Call gegen den roten Kasten, der selbst wiederum das LDAP/ActiveDirectory anspricht.

### Installation und Customising

#### 1. Repository klonen

```bash
git clone https://github.com/h9h/soa-dashboard.git
cd soa-dashboard
```

#### 2. Abhängigkeiten installieren

```bash
npm install
cd frontend && npm install && cd ..
```

#### 3. Konfiguration einrichten

Führe das Setup-Script aus, um Beispiel-Konfigurationsdateien zu kopieren:

```bash
npm run setup
```

Dies erstellt Konfigurationsdateien im Ordner `./customisation` basierend auf den Beispielen in `./config`.

Bearbeite die Dateien in `./customisation`:
- `authentication.config.js` - LDAP/AD-Einstellungen
- `jobs.config.js` - Job-Verzeichnisse und Port
- `authenticationImplementation.js` - Authentifizierungsstrategie
- `resend-users.config.js` - Benutzer mit Resend-Rechten (optional)

#### 4. Frontend-Konfiguration

Lege im Ordner `./frontend` eine `.env` gemäß dem Beispiel `.env.example` an.

```bash
cp frontend/.env.example frontend/.env
```

Bearbeite `frontend/.env` mit deinen Einstellungen.

#### 5. Entwicklungsserver starten

```bash
npm start
```

Dies startet:
- Frontend: http://localhost:3000
- Auth-Backend: http://localhost:4166
- Jobs-Backend: http://localhost:4000

### Skripte

In der `./package.json` sind verschiedene Skripte definiert:

#### Setup und Konfiguration

```bash
npm run setup           # Erstelle Beispiel-Konfigurationsdateien
npm run backup:config   # Sichere aktuelle Konfiguration
npm run lint            # Prüfe Code-Qualität (Backend)
npm run lint:fix        # Fixe Code-Qualität automatisch
```

#### Für die Entwicklung

```bash
npm start               # Starte alles (Frontend + beide Backends)
npm run start:frontend  # Nur Frontend
npm run start:auth      # Nur Auth-Backend
npm run start:file      # Nur Jobs-Backend
```

Startet sowohl einen Hot-Loading Server für das Frontend unter `http://localhost:3000`,
als auch die Backends für Authentication und Housekeeping (standardmäßig Ports 4166 bzw. 4000).

#### Für das Erzeugen der Artefakte mit Node-Backend

```bash
npm run build           # Baut nur das Frontend
npm run ncc:build       # Bundelt beide Backends als JS
npm run build-auth      # Bundelt nur Auth-Backend
```

`npm run build` baut die Frontend-SPA unter `./frontend/build`. Ein Aufruf der `index.html` aus dem
Build-Verzeichnis im Browser ergibt folgenden Zustand nach erfolgreichem Bau:

![Login ohne Authentifizierungsbackend](./images/Login-Screen.png)

Auf der linken Seite ist ein Stop-Symbol und individueller Text zu sehen. Dies zeigt an, dass das Authentifizierungs-
Backend nicht erreichbar ist.

`npm run ncc:build` erzeugt unter `./dist` zwei Verzeichnisse - "auth" und "jobs" - die jeweils eine `index.js`
enthalten. Dieses sind fertig gebundelte JavaScript-Sourcen für die Backends.

Das Authentifizierungsbackend kann dann mittels `node ./dist/auth` gestartet werden. Danach verschwindet das
Stop-Symbol:

![Login mit Authentifizierungsbackend](./images/Login-mit-Auth-Screen.png)
  
#### Für das Erzeugen der Artefakte mit Binary-Backend

```bash
npm run pkg:server:dashboard   # Erstellt esb-dashboard.exe
npm run pkg:server:file         # Erstellt esb-jobs.exe
npm run pkg:all                 # Erstellt beide EXEs
npm run build:all               # Kompletter Build (Frontend + Backends als JS und EXE)
```

Das Frontend wird mit `npm run build` gebaut. Die Backends werden mittels `npm run pkg:all`
als Windows-EXEs bereit gestellt.

Ein potentieller Betriebsmodus wäre dann, lokal `esb-dashboard.exe` zu starten, da diese sowohl das
Frontend, als auch das Authentifizierungs-Backend bereit stellt. Das Dashboard steht dann unter
`http://localhost:4166` zur Verfügung.

#### Alles zusammen

Mittels

```bash
npm run build:all
```

werden

1. das Frontend gebundelt
2. die esb-dashboard.exe und esb-jobs.exe erzeugt
3. die Javascripte für Auth- und Jobs-Backend gebundelt
4. und das gebundelte Auth-Javascript mit in das frontend/build-Verzeichnis kopiert.

Damit reicht es dann, das `frontend/build` Verzeichnis an den gewünschten Ort auf dem Server zu deployen und den Start
von `node ./auth.js` in den Start des Servers einzubinden.

Für den Stopp des Authentifizierungs-Backends reicht ein kill auf den Prozess. Es wird kein Zustand gehalten.

### Hinweise

##### zeit/pkg

Hinter einem Proxy funktioniert das Herunterladen der Binaries für die Packages nicht.
Dies äußert sich dadurch, dass der Bauschritt `pkg:server:dashboard` abbricht.
Die Fehlermeldung ist in der Log-Datei output-dashboard-win-pkg.log zu finden.
Dort ist auch der Name der Datei zu finden, die im folgenden Workaround dann manuell herunterzuladen ist.

Daher dieser Workaround:

(hier für v2.6, ansonsten entsprechende Version jeweils anpassen - siehe `tag` in der Logdatei)

1. gehe zu <https://github.com/vercel/pkg-fetch/releases/>
1. such die passende Version gemäß der Fehlermeldung in der Logdatei `output-...-pkg.log`
1. Download die gewünschte Version gemäß Log-Datei
1. Gehe zum ./pkg-cache Verzeichnis (bei mir: C:\Users\\{userid}\\.pkg-cache\v3.2)
1. Kopiere das heruntergeladene Bin
1. Benenne den Anfang der Datei um zu "fetched-..." (z.B. "fetched-v10.24.1-win-x64")
1. Versuche pkg Skript noch einmal, sollte dann funktionieren
