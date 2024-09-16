import { Router } from 'express'
import { ShellController } from '../controllers/shellController.js'

export const addShellRouter = ({ shellModel, userModel, stateModel }) => {
  const shellRouter = Router()

  const shellCll = new ShellController({ shellModel, userModel, stateModel })

  shellRouter.get('/shells', shellCll.getShellsByUser)
  shellRouter.get('/shells/:shell_id', shellCll.getShellById)
  shellRouter.post('/add-shell', shellCll.createShell)
  shellRouter.put('/edit-shell/:shell_id', shellCll.updateShell)
  shellRouter.delete('/rm-shell/:shell_id', shellCll.deleteShell)

  return shellRouter
}
