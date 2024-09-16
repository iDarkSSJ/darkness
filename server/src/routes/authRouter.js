import { Router } from 'express'
import passport from 'passport'
import { UserController } from '../controllers/userController.js'
import { SessionController } from '../controllers/sessionController.js'
import { addAuthMiddleware } from '../middlewares/validateToken.js'

export const addAuthRouter = ({ userModel, sessionModel, googleIdModel }) => {
  const authRouter = Router()

  const userCll = new UserController({ userModel, sessionModel, googleIdModel })
  const sessionCll = new SessionController({ sessionModel })
  const authMiddleware = addAuthMiddleware({ sessionModel })

  authRouter.post('/register', userCll.register)
  authRouter.post('/login', userCll.login)
  authRouter.post('/logout', userCll.logout)
  authRouter.get('/verify', userCll.verify)
  authRouter.get('/profile', authMiddleware, userCll.profile)

  authRouter.get('/sessions', authMiddleware, sessionCll.getAllSessions)
  authRouter.delete('/sessions/:session_id', authMiddleware, sessionCll.removeSession)
  authRouter.delete('/sessions', authMiddleware, sessionCll.clearSessions)

  // -----------💎GOOGLE---------------

  authRouter.get('/google/login', passport.authenticate('google-login', { session: false }))
  authRouter.get(
    '/google/callback',
    passport.authenticate('google-login', { session: false }),
    userCll.googleLogin
  )

  authRouter.get('/google/register', passport.authenticate('google-register', { session: false }))
  authRouter.get(
    '/google/register/callback',
    passport.authenticate('google-register', { session: false }),
    userCll.googleRegister
  )

  authRouter.post('/google/auth/:temp_id', userCll.googleVerify)

  return authRouter
}
