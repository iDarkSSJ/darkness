import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { configDotenv } from 'dotenv'

configDotenv()

const handleGoogleAuth = async (req, accessToken, refreshToken, profile, done) => {
  try {
    const googleUser = {
      user_name: profile.displayName,
      user_email: profile.emails[0].value,
      user_google_id: profile.id,
    }
    done(null, googleUser)
  } catch (err) {
    done(err, false)
  }
}

const googleStrategyOptions = (callbackURL) => ({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL,
  passReqToCallback: true,
  scope: ['profile', 'email'],
})

passport.use(
  'google-login',
  new GoogleStrategy(
    googleStrategyOptions(process.env.GOOGLE_LOGIN_CALLBACK),
    handleGoogleAuth
  )
)

passport.use(
  'google-register',
  new GoogleStrategy(
    googleStrategyOptions(process.env.GOOGLE_REGISTER_CALLBACK),
    handleGoogleAuth
  )
)
