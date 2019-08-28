import React from 'react'
import {
  FaBroadcastTower,
  FaChalkboardTeacher,
  FaChartLine,
  FaChartPie,
  FaCog,
  FaCoins,
  FaEnvelope,
  FaExclamationTriangle,
  FaFilter,
  FaGithub,
  FaList,
  FaMagic,
  FaPlay,
  FaQuestion,
  FaReact,
  FaRegSave,
  FaShare,
  FaSync,
} from 'react-icons/fa'
import { GoStop } from 'react-icons/go'
import {
  IoIosLogOut,
  IoIosLogIn,
  IoIosAddCircleOutline,
  IoIosRemoveCircleOutline,
  IoMdCheckmarkCircleOutline,
  IoMdCloseCircleOutline,
  IoMdWarning
} from 'react-icons/io'
import { MdHelp, MdTimeline, MdClearAll } from 'react-icons/md'
import { GoAlert } from 'react-icons/go'
import { TiCancel } from 'react-icons/ti'
import { Large, Larger } from './styles'

import Log from '../log'
const log = Log('icons')

export const Icon = ({ glyph, ...rest }) => {
  switch(glyph) {
    case 'checkalive':
      return <FaBroadcastTower/>
    case 'clearFilters':
      return <MdClearAll />
    case 'cancel':
      return <TiCancel />
    case 'danger':
      return <IoMdWarning />
    case 'success':
      return <IoMdCheckmarkCircleOutline style={{ color: 'green' }}/>
    case 'fail':
      return <IoMdCloseCircleOutline style={{ color: 'red' }}/>
    case 'stop':
      return <GoStop />
    case 'login':
      return <IoIosLogIn />
    case 'logout':
      return <IoIosLogOut />
    case 'actualise':
      return <FaSync />
    case 'execute':
      return <FaPlay {...rest}/>
    case 'error':
      return <FaExclamationTriangle />
    case 'filter':
      return <FaFilter />
    case 'list':
      return <FaList />
    case 'logpointAction':
      return <MdTimeline {...rest} />
    case 'logpointActionExtern':
      return <FaChartLine {...rest} />
    case 'dashboard':
      return <FaChalkboardTeacher />
    case 'queues':
      return <FaCoins />
    case 'message':
      return <FaEnvelope />
    case 'messages':
      return <FaEnvelope />
    case 'jobs':
      return <FaMagic />
    case 'save':
      return <FaRegSave />
    case 'statistics':
      return <FaChartPie />
    case 'configuration':
    case 'profile':
      return <FaCog />
    case 'help':
      return <MdHelp />
    case 'snapshot':
      return <FaShare />
    case 'resetConfiguration':
      return <GoAlert />
    case 'requestReply':
      return <Larger>⇌</Larger>
    case 'requestCallback':
      return <Larger>↹</Larger>
    case 'fireAndForget':
      return <Larger>⇸</Larger>
    case 'notification':
      return <Larger>⤞</Larger>
    case 'start':
      return <Large>&lt;</Large>
    case 'turnaround':
      return <Large>&#8631;</Large>
    case 'end':
      return <Large>&gt;</Large>
    case 'fault':
      return <Large>&otimes;</Large>
    case 'minus':
      return <IoIosRemoveCircleOutline />
    case 'plus':
      return <IoIosAddCircleOutline />
    case 'dev':
      return <FaReact />
    case 'github':
      return <FaGithub />
    default:
      log.warn('Fix glyph: ' + glyph)
      return <FaQuestion />
  }
}
