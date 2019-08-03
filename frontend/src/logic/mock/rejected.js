export const REJECTED = {
  'header': [
    {'ID': 'VARCHAR(36)'},
    {'LOGTIMESTAMP': 'TIMESTAMP(0, 6'},
    {'DESCRIPTION': 'VARCHAR(255)'},
    {'LOGPOINTNO': 'NUMERIC(22)'},
    {'ENVIRONMENT': 'VARCHAR(255)'},
    {'ORIGINATOR': 'VARCHAR(5)'},
    {'OPERATION': 'VARCHAR(255)'},
    {'SERVICE': 'VARCHAR(1024)'},
    {'MEP': 'VARCHAR(25)'},
    {'MESSAGETYPE': 'VARCHAR(255)'},
    {'ENCODING': 'VARCHAR(255)'},
    {'MESSAGE': 'CLOB(-1)'}],
  'rows': [
    [
      '1bfcdf5b-3492-4d0c-92f0-dd080e9a6fcf',
      '2019-04-29T09:54:21.287+02:00',
      'Request von extern empfangen',
      2,
      'EW',
      'ESB0',
      'eineOperation',
      'http://beispiel.de/service/domaene/Service1',
      '\'unbekannt\'',
      'Request',
      null,
      'Nachrichteninhalt....'],
    [
      'f349e961-e84e-4390-832b-6db00e19a4e2',
      '2019-04-29T08:54:50.558+02:00',
      'Request von extern empfangen',
      2,
      'EW',
      'ESB0',
      'eineOperation',
      'http://beispiel.de/service/domaene/Service1',
      '\'unbekannt\'',
      'Request',
      null,
      'Nachrichteninhalt....']
  ]
}
