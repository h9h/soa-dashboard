export const QUEUETABLE = {
  'header': [
    {'Q_NAME': 'VARCHAR(30)'},
    {'MSGID': 'VARBINARY(0)'},
    {'ENQ_TIME': 'TIMESTAMP(0, 6'},
    {'MEP': 'VARCHAR(2000)'},
    {'OPERATION': 'VARCHAR(2000)'},
    {'USER_DATA.TEXT_LOB': 'CLOB(-1)'}],
  'rows': [
    [
      'AQ$_PARTNERANLAGET01_E',
      'ULz7siupAgrgUwp+GBNvag==',
      '2017-05-30T11:19:55.435+02:00',
      null,
      null,
      'Nachrichtneinhalt....'],
    [
      'AQ$_PARTNERANLAGET01_E',
      'ULuRff1sAibgUwp+GBOGjw==',
      '2017-05-30T09:38:38.724+02:00',
      null,
      null,
      'Nachrichtneinhalt....'],
  ]
}
