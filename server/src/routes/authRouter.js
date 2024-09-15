import { Router } from 'express'
import { UserController } from '../controllers/userController.js'
import passport from 'passport'
import { authRequired } from '../middlewares/validateToken.js'
import { SessionController } from '../controllers/sessionController.js'

const authRouter = Router()

authRouter.post('/register', UserController.register)
authRouter.post('/login', UserController.login)
authRouter.post('/logout', UserController.logout)
authRouter.get('/verify', UserController.verify)
authRouter.get('/profile', authRequired, UserController.profile)

authRouter.get('/sessions', authRequired, SessionController.getAllSessions)
authRouter.delete('/sessions/:session_id', authRequired, SessionController.removeSession)
authRouter.delete('/sessions', authRequired, SessionController.clearSessions)

// -----------💎GOOGLE---------------

authRouter.get('/google/login', passport.authenticate('google-login', { session: false }))
authRouter.get(
  '/google/callback',
  passport.authenticate('google-login', { session: false }),
  UserController.googleLogin
)

authRouter.get('/google/register', passport.authenticate('google-register', { session: false }))
authRouter.get(
  '/google/register/callback',
  passport.authenticate('google-register', { session: false }),
  UserController.googleRegister
)

authRouter.post('/google/auth/:temp_id', UserController.googleVerify)

export default authRouter
