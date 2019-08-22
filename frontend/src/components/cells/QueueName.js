import React from 'react'
import { Link } from 'react-router-dom'
import Button from 'react-bootstrap/Button'

const QueueName = ({row}) => {
  const {umgebung, database} = row.original.filter
  const url = `/queues/${umgebung}/${database}/${row.row.QUEUE_TABLE}?queue=${row.value}`

  return (
    <>
      <Link id={url} to={url}/>
      <Button
        onClick={() => {
          const linkToClick = document.getElementById(url)
          linkToClick.click()
        }}
        variant="link"
      >
        {row.value}
      </Button>
    </>
  )
}

export default QueueName
