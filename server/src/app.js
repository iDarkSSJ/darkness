import cookieParser from 'cookie-parser'
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import passport from 'passport'
import { addShellRouter } from './routes/shellRouter.js'
import { multerErrors } from './config/multerConfig.js'
import { addAuthMiddleware } from './middlewares/validateToken.js'
import { addStateRouter } from './routes/stateRouter.js'
import { configDotenv } from 'dotenv'
import uploadRouter from './routes/uploadRouter.js'
import './config/passportConfig.js'
import { addAuthRouter } from './routes/authRouter.js'
import { PORT } from '../config.js'

configDotenv()

const app = express()

export const createApp = ({ userModel, sessionModel, googleIdModel, shellModel, stateModel }) => {
  const allowedOrigin = process.env.ORIGIN_URL
  // -----------MIDDLEWARES 🤓---------------
  app.use(passport.initialize())
  app.use(express.json())
  app.use(
    cors({
      origin: allowedOrigin,
      credentials: true,
    })
  )
  app.use(morgan('dev'))
  app.use(cookieParser())
  app.disable('x-powered-by')
  const authMiddleware = addAuthMiddleware({ sessionModel })

  // -----------ROUTES 👈--------------

  app.use('/api', addAuthRouter({ googleIdModel, sessionModel, userModel }))
  app.use('/api', authMiddleware, addShellRouter({ shellModel, userModel, stateModel }))
  app.use('/api', authMiddleware, addStateRouter({ stateModel }))
  app.use('/api', uploadRouter)

  // -----------ERROR HANDLING 🐛---------------
  app.use(multerErrors)

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}
