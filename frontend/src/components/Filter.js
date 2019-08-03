import React from 'react'

const Filter = ({ text = null, filter }) => (
  <>
    {text && <h3>{text}</h3>}
    <div>
      Umgebung: {filter.umgebung}
    </div>
    <div>
      Zeitspanne: von {filter.von} bis {filter.bis}
    </div>
  </>
)

export default Filter
