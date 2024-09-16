import cookieParser from 'cookie-parser'
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import passport from 'passport'
import authRouter from './routes/authRouter.js'
import shellRouter from './routes/shellRouter.js'
import { recreateTables } from './models/postgreRender/db.js'
import './config/passportConfig.js'
import { multerErrors } from './config/multerConfig.js'
import { authRequired } from './middlewares/validateToken.js'
import stateRouter from './routes/stateRouter.js'
import { configDotenv } from 'dotenv'
import uploadRouter from './routes/uploadRouter.js'

configDotenv()

const app = express()

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

// -----------ROUTES 👈--------------

app.use('/api', authRouter)
app.use('/api', authRequired, shellRouter)
app.use('/api', authRequired, stateRouter)
app.use('/api', uploadRouter)

// -----------ERROR HANDLING 🐛---------------
app.use(multerErrors)

// -----------DATABASE CONNECTION AND TABLES ✅---------------
recreateTables()
// getAllUsers()

export default app
