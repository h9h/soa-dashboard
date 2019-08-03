export const QUEUES = {
  'header': [
    {'QUEUE_NAME': 'VARCHAR(128)'},
    {'QUEUE_TABLE': 'VARCHAR(128)'},
    {'QUEUE_TYPE': 'VARCHAR(20)'},
    {'EXPIRATION': 'NUMERIC(38)'},
    {'USER_COMMENT': 'VARCHAR(50)'},
    {'WAITING': 'NUMERIC(0)'},
    {'READY': 'NUMERIC(0)'},
    {'EXPIRED': 'NUMERIC(0)'}],
  'rows': [
    [
      'AQ$_INTERNALDASHBOARDT01_E',
      'INTERNALDASHBOARDT01',
      'EXCEPTION_QUEUE',
      0,
      'exception queue',
      1,
      5,
      10],
    [
      'INTERNALDASHBOARDR01',
      'INTERNALDASHBOARDT01',
      'NORMAL_QUEUE',
      0,
      null,
      0,
      0,
      0],
],
}
