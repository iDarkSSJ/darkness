import { UAParser } from 'ua-parser-js'

export function createUser({
  user_name,
  user_email,
  user_password,
  password_pending = false,
  is_google_user = false,
}) {
  return {
    user_name,
    user_email,
    user_password,
    password_pending,
    is_google_user,
  }
}

export function createLoginUser({ user, user_password }) {
  return {
    user,
    user_password,
  }
}

export function createUserTokenSchema({ user }) {
  const { user_id, user_name, user_email } = user
  return {
    user_id,
    user_name,
    user_email,
  }
}

export function generateRandomPassword(length = 26) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@!%*?&#_-+='
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export const generateUsername = (displayName, userGoogleId) => {
  let baseUsername = displayName
    .replace(/[^A-Za-z0-9]/g, '')
    .toLowerCase()
    .slice(0, 12)

  if (baseUsername.length < 3) {
    baseUsername = `user${userGoogleId.slice(0, 6)}`
  }
  const uniqueSuffix = userGoogleId.slice(-3)
  const finalUsername = `${baseUsername}${uniqueSuffix}`

  return finalUsername.slice(0, 15)
}

export const registerUserSession = async ({ token, user, req, sessionModel }) => {
  try {
    const userAgent = req.headers['user-agent'] || 'Unknown User-Agent'
    const uaParser = new UAParser(userAgent)

    const device = uaParser.getOS().name

    const session = await sessionModel.registerSession({
      token,
      user,
      device,
    })

    if (session.error) {
      console.error('Error registering session:', session.error)
      return { error: 'Internal Server Error' }
    }

    return session
  } catch (error) {
    console.error('Error during session registration:', error)
    return { error: 'Internal Server Error' }
  }
}
