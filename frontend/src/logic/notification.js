import { toast } from 'react-toastify'
import { getConfigurationValue } from './configuration'

import Log from '../log'
import { sendInfo } from '../App'
const log = Log('notification')

const getMillisNotificationAutoClose = () => {
  return parseInt(getConfigurationValue('advanced.millisAutoCloseNotification'), 10)
}

const getMillisPreExecutionOnNotification = () => {
  return parseInt(getConfigurationValue('advanced.millisPreExecutionOnNotification'), 10)
}

const getNotificationPosition = () => {
  const config = getConfigurationValue('advanced')
  const vert = config.notificationPositionVertical
  const horz = config.notificationPositionHorizontal

  if (vert === 'top') {
    if (horz === 'left') {
      return toast.POSITION.TOP_LEFT
    } else if(horz === 'center') {
      return toast.POSITION.TOP_CENTER
    } else {
      return toast.POSITION.TOP_RIGHT
    }
  } else {
    if (horz === 'left') {
      return toast.POSITION.BOTTOM_LEFT
    } else if(horz === 'center') {
      return toast.POSITION.BOTTOM_CENTER
    } else {
      return toast.POSITION.BOTTOM_RIGHT
    }
  }
}

const toastConfiguration = () => {
  return {
    position: getNotificationPosition(),
    autoClose: getMillisNotificationAutoClose(),
    pauseOnFocusLoss: true,
    style: { width: '600px' }
  }
}

toast.configure(toastConfiguration())

/* Prüfe, ob Notification tatsächlich gezeigt werden soll */
const shouldShowNotification = (props, nachricht, fn = () => {}) => {
  const timeClose = getMillisNotificationAutoClose()
  if (timeClose < 10 && !props.hasOwnProperty('autoClose')) {
    // falls Millis bis Toast geschlossen < 10 zeige keinen Toast
    sendInfo(nachricht)
    fn()
    return false
  }

  return true
}

/*
Zeige Notification solange Funktion ausgeführt wird
 */
export const withExplanation = ({ nachricht, fn, ...props }) => {
  if (shouldShowNotification(props, nachricht, fn)) {
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
}

/*
Zeige Notification bis autoClose abgelaufen
 */
export const withNotification = ({ nachricht, fn, ...props }) => {
  if (shouldShowNotification(props, nachricht, fn)) {
    log.trace('withNotification', nachricht)
    const toastId = toast(nachricht, {
      ...toastConfiguration(),
      ...props
    })
    setTimeout(fn, getMillisPreExecutionOnNotification())
    return toastId
  }

  return null
}

export const notification = ({ nachricht, ...props }) => {
  if (shouldShowNotification(props, nachricht)) {
    return toast(nachricht, {
      ...toastConfiguration(),
      ...props
    })
  }
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
