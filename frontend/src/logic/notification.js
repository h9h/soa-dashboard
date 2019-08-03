import { toast } from 'react-toastify'
import { toastConfiguration, getMillisPreExecutionOnNotification } from '../configuration/useConfiguration'
import Log from '../log'
const log = Log('notification')

/*
Zeige Notification solange Funktion ausgeführt wird
 */
export const withExplanation = ({ nachricht, fn, ...props }) => {
  log.trace('withExplanation', nachricht)
  const toastId = toast(nachricht, {
    ...toastConfiguration(),
    autoClose: false,
    ...props
  })
  setTimeout(() => {
    fn()
    toast.dismiss(toastId)
  }, getMillisPreExecutionOnNotification())
}

/*
Zeige Notification bis autoClose abgelaufen
 */
export const withNotification = ({ nachricht, fn, ...props }) => {
  log.trace('withNotification', nachricht)
  const toastId = toast(nachricht, {
    ...toastConfiguration(),
    ...props
  })
  setTimeout(fn, getMillisPreExecutionOnNotification())
  return toastId
}

export const notification = ({ nachricht, ...props }) => {
  return toast(nachricht, {
    ...toastConfiguration(),
    ...props
  })
}

export const withProgressNotification = ({ nachricht, ...props }) => {
  log.trace('withProgressNotification', nachricht)
  const toastId = toast(nachricht, {
    ...toastConfiguration(),
    autoClose: false,
    closeButton: false,
    draggable: false,
    ...props
  })

  return (newContent) => {
    if (!newContent) {
      toast.dismiss(toastId)
    } else {
      toast.update(toastId, {
        render: newContent,
        className: 'rotateY animated'
      })
    }
  }
}
