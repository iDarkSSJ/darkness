import { Router } from 'express'
import { StateController } from '../controllers/stateController.js'
import { multerStates } from '../config/multerConfig.js'

const stateRouter = Router()

stateRouter.get('/states/:shell_id', StateController.getStatesByShell)
stateRouter.get('/states/:shell_id/:slot_number', StateController.getStateBySlotNumber)
stateRouter.put('/states/:shell_id/:state_id', StateController.updateState)
stateRouter.post('/add-state/:shell_id', multerStates, StateController.createState)
stateRouter.delete('/states/:shell_id/:state_id', StateController.deleteState)

export default stateRouter
