export const DEFINITIONS = {
  version: {
    id: "/Version",
    type: "number"
  },
  umgebungen: {
    id: "/Umgebungen",
    type: "object",
    properties: {
      "EW": {type: "string", format: 'uri'},
    },
    patternProperties: {
      "^[-a-zA-Z0-9]{1,10}$": { anyOf: [
          { type: "uri" },
          { type: "null" },
        ]}
    },
    required: ["EW"],
    minProperties: 1,
    additionalProperties: false
  },
  duration: {
    id: "/Duration",
    type: "object",
    properties: {
      anzahl: {type: "string", pattern: "^\\d{1,3}$"},
      unit: {type: "string", enum: ['seconds', 'minutes', 'hours']}
    },
    required: ["anzahl", "unit"],
    additionalProperties: false
  },
  time: {
    id: "/Time",
    type: "object",
    properties: {
      duration: {"$ref": "/Duration"},
    },
    required: ["duration"],
    additionalProperties: false
  },
  widenFilter: {
    id: "/WidenFilter",
    type: "object",
    properties: {
      anzahlVor: {type: "string", pattern: "^\\d{1,2}$"},
      anzahlZurueck: {type: "string", pattern: "^\\d{1,2}$"},
      unit: {type: "string", enum: ['minutes']}
    },
    required: ["anzahlVor", "anzahlZurueck", "unit"],
    additionalProperties: false
  },
  filter: {
    id: "/Filter",
    type: "object",
    properties: {
      umgebung: {type: "string", pattern: "^(EW)|([A-Z]{2,3}-SV[S]?)$" },
      widenFilter: {"$ref": "/WidenFilter"}
    },
    required: ["umgebung", "widenFilter"],
    additionalProperties: false
  },
  logtable: {
    id: "/Logtable",
    type: "object",
    properties: {
      pageSizes: {type: "array", "items": { anyOf: [
            { type: "string", pattern: "^\\d{1,3}$" },
            { type: "null" },
          ]}
        ,
        uniqueItems: true,
        minItems: 1
      },
      defaultSize: {type: "string", pattern: "^\\d{1,3}$" }
    },
    required: ["pageSizes", "defaultSize"],
    additionalProperties: false
  },
  messagetable: {
    id: "/Messagetable",
    type: "object",
    properties: {
      pageSizes: {type: "array", "items": { anyOf: [
            { type: "string", pattern: "^\\d{1,3}$" },
            { type: "null" },
          ]}
        ,
        uniqueItems: true,
        minItems: 1
      },
      defaultSize: {type: "string", pattern: "^\\d{1,3}$" }
    },
    required: ["pageSizes", "defaultSize"],
    additionalProperties: false
  },
  queuetable: {
    id: "/Queuetable",
    type: "object",
    properties: {
      pageSizes: {type: "array", "items": { anyOf: [
            { type: "string", pattern: "^\\d{1,3}$" },
            { type: "null" },
          ]}
        ,
        uniqueItems: true,
        minItems: 1
      },
      defaultSize: {type: "string", pattern: "^\\d{1,3}$" }
    },
    required: ["pageSizes", "defaultSize"],
    additionalProperties: false
  },
  queuetabletable: {
    id: "/Queuetabletable",
    type: "object",
    properties: {
      pageSizes: {type: "array", "items": { anyOf: [
            { type: "string", pattern: "^\\d{1,3}$" },
            { type: "null" },
          ]}
        ,
        uniqueItems: true,
        minItems: 1
      },
      defaultSize: {type: "string", pattern: "^\\d{1,3}$" }
    },
    required: ["pageSizes", "defaultSize"],
    additionalProperties: false
  },
  checkalivetable: {
    id: "/Checkalivetable",
    type: "object",
    properties: {
      pageSizes: {type: "array", "items": { anyOf: [
            { type: "string", pattern: "^\\d{1,3}$" },
            { type: "null" },
          ]}
        ,
        uniqueItems: true,
        minItems: 1
      },
      defaultSize: {type: "string", pattern: "^\\d{1,3}$" }
    },
    required: ["pageSizes", "defaultSize"],
    additionalProperties: false
  },
  timeline: {
    id: "/Timeline",
    type: "object",
    properties: {
      alignFlag: {type: "string", enum: ["left", "center", "right"]}
    },
    required: ["alignFlag"],
    additionalProperties: false
  },
  logpoints: {
    id: "/Logpoints",
    type: "object",
    properties: {
      verticalSeparation: {type: "string", enum: ["true", "false"]}
    },
    required: ["verticalSeparation"],
    additionalProperties: false
  },
  distribution: {
    id: "/Distribution",
    type: "object",
    properties: {
      heightInPx: {type: "string", pattern: "^\\d{1,3}$"},
    },
    required: ["heightInPx"],
    additionalProperties: false
  },
  presentation: {
    id: "/Presentation",
    type: "object",
    properties: {
      timeline: {"$ref": "/Timeline"},
      logpoints: {"$ref": "/Logpoints"},
      distribution: {"$ref": "/Distribution"}
    },
    required: [],
    additionalProperties: false
  },
  mock: {
    id: "/Mock",
    type: "object",
    properties: {
      anzahl: {type: "string", pattern: "^\\d{2,5}$"},
      doMock: {type: "string", enum: ['true', 'false']}
    },
    required: ["anzahl", "doMock"],
    additionalProperties: false
  },
  advanced: {
    id: "/Advanced",
    type: "object",
    properties: {
      millisPreExecutionOnNotification: {type: "string", pattern: "^\\d{1,3}$"},
      millisAutoCloseNotification: {type: "string", pattern: "^\\d{4,5}$"},
      notificationPositionHorizontal: {type: "string", enum: ['left', 'center', 'right']},
      notificationPositionVertical: {type: "string", enum: ['top', 'bottom']},
      sliceFetchStatisticsHours: {type: "string", pattern: "^\\d{1,2}$"}
    },
    required: [
      "millisPreExecutionOnNotification",
      "millisAutoCloseNotification",
      "notificationPositionHorizontal",
      "notificationPositionVertical",
      "sliceFetchStatisticsHours"
    ],
    additionalProperties: false
  },
  debug: {
    id: "/Debug",
    type: "object",
    properties: {
      namespaces: {type: "string"},
      level: {type: "string", enum: ['0', '1', '2', '3', '4']},
    },
    required: [
      "namespaces",
      "level",
    ],
    additionalProperties: false
  },
  statistics: {
    id: "/Statistics",
    type: "object",
    properties: {
      colorSchemes: {type: "object"},
      uniqueItems: true,
    },
    required: ["colorSchemes"],
    additionalProperties: false
  },
}

export const CONFIGURATION_SCHEMA = {
  id: "/Configuration",
  type: "object",
  properties: {
    umgebungen: {"$ref": "/Umgebungen"},
    time: {"$ref": "/Time"},
    filter: {"$ref": "/Filter"},
    logtable: {"$ref": "/Logtable"},
    messagetable: {"$ref": "/Messagetable"},
    queuetable: {"$ref": "/Queuetable"},
    queuetabletable: {"$ref": "/Queuetabletable"},
    checkalivetable: {"$ref": "/Checkalivetable"},
    presentation: {"$ref": "/Presentation"},
    mock: {"$ref": "/Mock"},
    advanced: {"$ref": "/Advanced"},
    debug: {"$ref": "/Debug"},
    statistics: {"$ref": "/Statistics"}
  }
}
