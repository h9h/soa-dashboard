import React, { useState, useEffect } from 'react'
import { getDatabases } from '../logic/api/api-dashboard'
import Form from 'react-bootstrap/Form'
import Spinner from 'react-bootstrap/Spinner'

const SelectDatabase = ({ umgebung, database: defaultDatabase, onSelect }) => {
  const [database, setDatabase] = useState(defaultDatabase)
  const [databases, setDatabases] = useState({status: 'loading'})

  useEffect(() => {
    getDatabases({ umgebung }, setDatabases)
  }, [umgebung])

  useEffect(() => {
    if (databases.status === 'ready' && databases.data && databases.data.length > 0) {
      if (database && databases.data.map(item => item.DATABASE).indexOf(database) > -1) {
        // nix - wir können die gesetzte Datenbank so lassen
      } else {
        // gesetzte Datenbank nicht in Liste: wir setzen auf erste
        setDatabase(databases.data[0].DATABASE)
        onSelect(databases.data[0].DATABASE)
      }
    }
  }, [database, databases, onSelect])

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
      setDatabase(value)
      onSelect(value)
    }

    return (
      <Form.Control as="select" value={database || ''} onChange={handleChange}>
        {databases.data
          .map(item => item.DATABASE)
          .sort()
          .map(item => <option key={item}>{item}</option>)
        }
      </Form.Control>
    )
  }

  return null
}

export default SelectDatabase
