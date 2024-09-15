import { configDotenv } from 'dotenv'

configDotenv()

export const PORT = process.env.PORT || 3000
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 1000 * 60 * 60 * 24 * 30,
  sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
}
