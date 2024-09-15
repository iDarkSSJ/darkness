import { Router } from 'express'
import { ShellController } from '../controllers/shellController.js'
import { multerShells } from '../config/multerConfig.js'

const shellRouter = Router()

shellRouter.get('/shells', ShellController.getShellsByUser)
shellRouter.get('/shells/:shell_id', ShellController.getShellById)
shellRouter.post('/add-shell', multerShells, ShellController.createShell)
shellRouter.put('/edit-shell/:id', ShellController.updateShell)
shellRouter.delete('/rm-shell/:id', ShellController.deleteShell)

export default shellRouter
