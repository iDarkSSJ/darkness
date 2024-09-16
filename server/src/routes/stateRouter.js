import { Router } from 'express'
import { StateController } from '../controllers/stateController.js'
import { multerStates } from '../config/multerConfig.js'

export const addStateRouter = ({ stateModel }) => {
  const stateRouter = Router()

  const stateCll = new StateController({ stateModel })

  stateRouter.get('/states/:shell_id', stateCll.getStatesByShell)
  stateRouter.get('/states/:shell_id/:slot_number', stateCll.getStateBySlotNumber)
  stateRouter.put('/states/:shell_id/:state_id', stateCll.updateState)
  stateRouter.post('/add-state/:shell_id', multerStates, stateCll.createState)
  stateRouter.delete('/states/:shell_id/:state_id', stateCll.deleteState)

  return stateRouter
}
