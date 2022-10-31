import React, { useState, useEffect } from 'react'
import { uniq } from 'ramda'
import { getDatabases } from '../logic/api/api-dashboard'
import Form from 'react-bootstrap/Form'
import Spinner from 'react-bootstrap/Spinner'

const SelectDatabase = ({ umgebung, database: defaultDatabase, onSelect }) => {
  const [selectedDatabase, setSelectedDatabase] = useState(defaultDatabase)
  const [databases, setDatabases] = useState({status: 'loading'})

  useEffect(() => {
    getDatabases({ umgebung }, setDatabases)
  }, [umgebung])

  useEffect(() => {
    if (databases.status === 'ready' && databases.data && databases.data.length > 0) {
      if (selectedDatabase && databases.data.map(item => item.DATABASE).indexOf(selectedDatabase) > -1) {
        // nix - wir können die gesetzte Datenbank so lassen
      } else {
        // gesetzte Datenbank nicht in Liste: wir setzen auf erste
        setSelectedDatabase(databases.data[0].DATABASE)
        onSelect(databases.data[0].DATABASE)
      }
    }
  }, [selectedDatabase, databases, onSelect])

  if (databases.status === 'loading') return (
    <Form.Label>
      <Spinner animation="border" role="status">
        <span className="sr-only">Bitte warten...</span>
      </Spinner>
    </Form.Label>
  )

  if (databases.status === 'ready') {
    const handleChange = event => {
      const value = event.target.value
      setSelectedDatabase(value)
      onSelect(value)
    }

    return (
      <Form.Select value={selectedDatabase || ''} onChange={handleChange}>
        {uniq(databases.data
          .map(item => item.DATABASE))
          .sort()
          .map(item => <option key={item}>{item}</option>)
        }
      </Form.Select>
    )
  }

  return null
}

export default SelectDatabase
