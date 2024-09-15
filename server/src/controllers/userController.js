import { configDotenv } from 'dotenv'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { UserModel } from '../models/postgreRender/user.js'
import { validateUser } from '../schemas/userSchema.js'
import {
  createLoginUser,
  createUser,
  createUserTokenSchema,
  generateRandomPassword,
  generateUsername,
  registerUserSession,
} from '../utils/userUtil.js'
import { cookieOptions } from '../../config.js'
import { SessionModel } from '../models/postgreRender/sessions.js'
import { gSessionTempId } from '../models/postgreRender/gSessionTempId.js'

configDotenv()

export class UserController {
  static async register(req, res) {
    const input = createUser(req.body)

    try {
      const response = validateUser(input)

      if (!response.success)
        return res.status(400).send({ error: response.error.issues[0].message })

      const userExists = await UserModel.checkUserExists({ user: input })

      if (userExists.error)
        return res.status(500).send({ error: 'Internal Server Error, Please try again' })

      if (userExists) return res.status(400).send({ error: 'User already exists' })

      const passwordHash = await bcrypt.hash(input.user_password, 10)
      const user = createUser({ ...input, user_password: passwordHash })
      const newUser = await UserModel.registerUser({ user }) // WITH PASSWORD ❗❗ NO RETURN VALUE TO THE CLIENT

      if (newUser.error)
        return res.status(500).send({ error: 'Internal Server Error, Please try again' })

      const userTokenSchema = createUserTokenSchema({ user: newUser.user }) // WITHOUT PASSWORD, SECURE TO THE CLIENT ✅✅
      const newUserToken = jwt.sign(userTokenSchema, process.env.JWT_SECRET_KEY)

      const session = await registerUserSession({
        token: newUserToken,
        user: userTokenSchema,
        req,
      })

      if (session.error)
        return res.status(500).send({ error: 'Internal Server Error, Please try again' })

      return res.cookie('auth', newUserToken, cookieOptions).send({
        message: 'User successfully registered',
        user: userTokenSchema,
      })
    } catch (err) {
      console.error('Error during user registration:', err)
      return res.status(500).send({ error: 'Internal Server Error, Please try again' })
    }
  }

  static async login(req, res) {
    const input = createLoginUser(req.body)

    if (!input.user || !input.user_password)
      return res.status(400).send({ error: 'Missing user or password' })

    try {
      const userFound = await UserModel.findUserByIdOrEmail({ user: input })

      if (userFound.error)
        return res.status(500).send({ error: 'Internal Server Error, Please try again' })

      if (!userFound.user) return res.status(404).send({ error: 'User not found' })

      const password = await bcrypt.compare(input.user_password, userFound.user.user_password)

      if (!password) return res.status(401).send({ error: 'Invalid password' })

      const userTokenSchema = createUserTokenSchema({ user: userFound.user })
      const newUserToken = jwt.sign(userTokenSchema, process.env.JWT_SECRET_KEY)

      const session = await registerUserSession({
        token: newUserToken,
        user: userTokenSchema,
        req,
      })

      if (session.error)
        return res.status(500).send({ error: 'Internal Server Error, Please try again' })

      return res.cookie('auth', newUserToken, cookieOptions).send('User successfully logged in')
    } catch (err) {
      console.error('Error during user login:', err)
      return res.status(500).send({ error: 'Internal Server Error, Please try again' })
    }
  }

  static async googleLogin(req, res) {
    const googleUser = req.user

    try {
      const userFound = await UserModel.findUserByIdOrEmail({
        user: { user: googleUser.user_email },
      })

      if (userFound.error)
        return res.redirect(
          `${process.env.ORIGIN_URL}/login?error=Internal Server Error, Please try again.`
        )

      if (!userFound.user)
        return res.redirect(
          `${process.env.ORIGIN_URL}/login?error=User not found, Please sign up first.`
        )

      if (!userFound.user.is_google_user)
        return res.redirect(
          `${process.env.ORIGIN_URL}/login?error=User has a regular account. Please log in with email and password.`
        )

      const userTokenSchema = createUserTokenSchema({ user: userFound.user })
      const newUserToken = jwt.sign(userTokenSchema, process.env.JWT_SECRET_KEY)

      const session = await registerUserSession({
        token: newUserToken,
        user: userTokenSchema,
        req,
      })

      if (session.error)
        return res.redirect(
          `${process.env.ORIGIN_URL}/login?error=Internal Server Error, Please try again`
        )

      const tempId = await gSessionTempId.createId({ session_id: session.session_id })
      if (tempId.error) {
        return res.redirect(
          `${process.env.ORIGIN_URL}/register?error=Internal Server Error, Please try again`
        )
      }

      return res.redirect(`${process.env.ORIGIN_URL}/google/auth/${tempId.id}`)
    } catch (err) {
      console.error('Error during Google login:', err)
      return res.redirect(
        `${process.env.ORIGIN_URL}/login?error=Internal Server Error, Please try again`
      )
    }
  }

  static async googleRegister(req, res) {
    const googleUser = req.user

    try {
      const userExists = await UserModel.findUserByIdOrEmail({
        user: { user: googleUser.user_email },
      })
      if (userExists.error)
        return res.redirect(
          `${process.env.ORIGIN_URL}/register?error=Internal Server Error, Please try again`
        )
      if (userExists.user && !userExists.user.is_google_user) {
        return res.redirect(
          `${process.env.ORIGIN_URL}/register?error=User already exists with email. Please log in using email and password.`
        )
      }
      if (userExists.user)
        return res.redirect(`${process.env.ORIGIN_URL}/register?error=User already Exists`)

      const newUsername = generateUsername(googleUser.user_name, googleUser.user_google_id)
      const newPassword = generateRandomPassword()

      const user = {
        user_name: newUsername,
        user_email: googleUser.user_email,
        user_password: newPassword,
        password_pending: true,
        is_google_user: true,
      }

      const newUser = await UserModel.registerUser({ user })

      if (newUser.error)
        return res.redirect(
          `${process.env.ORIGIN_URL}/register?error=Internal server error, please try again`
        )

      const userTokenSchema = createUserTokenSchema({ user: newUser.user })
      const newUserToken = jwt.sign(userTokenSchema, process.env.JWT_SECRET_KEY)

      const session = await registerUserSession({
        token: newUserToken,
        user: newUser.user,
        req,
      })
      if (session.error)
        return res.redirect(
          `${process.env.ORIGIN_URL}/register?error=Internal server error, please try again`
        )

      const tempId = await gSessionTempId.createId({ session_id: session.session_id })
      if (tempId.error) {
        return res.redirect(
          `${process.env.ORIGIN_URL}/register?error=Internal Server Error, Please try again`
        )
      }

      return res.redirect(`${process.env.ORIGIN_URL}/google/auth/${tempId.id}`)
    } catch (err) {
      console.error('Error during Google registration:', err)
      return res.redirect(
        `${process.env.ORIGIN_URL}/register?error=Internal server error, please try again`
      )
    }
  }

  static async googleVerify(req, res) {
    const { temp_id } = req.params
    const token = await gSessionTempId.getTokenByTempId({ temp_id })
    if (token.error) return res.redirect(`${process.env.ORIGIN_URL}`)
    await gSessionTempId.deleteId({ temp_id })
    res.cookie('auth', token.token, cookieOptions).sendStatus(200)
  }

  static async logout(req, res) {
    const { auth } = req.cookies

    if (!auth) return res.status(200).send('User is not logging in.')

    try {
      const sessionFound = await SessionModel.findSessionByToken({
        token: auth,
      })
      if (!sessionFound.session) return res.status(200).send('User is not logged in.')

      await SessionModel.deleteSessionByToken({ token: auth })

      return res.cookie('auth', '', cookieOptions).send('User successfully logged out')
    } catch (err) {
      console.error('Error during logout:', err)
      return res.status(500).send('Internal Server Error, Please try again')
    }
  }

  static async verify(req, res) {
    const { auth } = req.cookies

    if (!auth) return res.status(401).send('Unauthorized')

    try {
      const decodedToken = jwt.verify(auth, process.env.JWT_SECRET_KEY)
      const { user_id } = decodedToken

      const sessionFound = await SessionModel.findSessionByToken({ token: auth })
      if (!sessionFound?.session) return res.status(403).send('Unauthorized')

      const userFound = await UserModel.findUserById({ user_id })
      if (!userFound?.user) return res.status(403).send('User not found')

      const user = {
        user_id: userFound.user.user_id,
        user_name: userFound.user.user_name,
        user_email: userFound.user.user_email,
      }

      return res.json(user)
    } catch (err) {
      console.error('Error verifying: ', err.message)
      return res.status(500).send('Internal Server Error')
    }
  }

  static async profile(req, res) {
    const { user_id } = req.user

    if (!user_id) return res.status(400).send('User not found')

    try {
      const userFound = await UserModel.findUserById({ user_id })
      if (!userFound?.user) {
        return res.status(404).send('User not found')
      }

      const secureUser = {
        user_name: userFound.user.user_name,
        user_email: userFound.user.user_email,
        password_pending: userFound.user.password_pending,
        is_google_user: userFound.user.is_google_user,
        created_at: userFound.user.created_at,
      }

      return res.json(secureUser)
    } catch (err) {
      console.error('Error fetching user: ', err.message)
      return res.status(500).send('Internal Server Error, Please try again')
    }
  }
}
