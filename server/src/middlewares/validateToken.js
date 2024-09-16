import jwt from 'jsonwebtoken'

export const addAuthMiddleware = ({ sessionModel }) => {
  const authRequired = async (req, res, next) => {
    const { auth } = req.cookies

    if (!auth) return res.status(401).send('Unauthorized')

    try {
      const decodedToken = jwt.verify(auth, process.env.JWT_SECRET_KEY)

      const sessionFound = await sessionModel.findSessionByToken({ token: auth })

      if (!sessionFound?.session) {
        return res.status(401).send('Unauthorized')
      }

      req.user = decodedToken
      next()
    } catch (err) {
      console.error('Error during auth verification:', err.message)
      return res.status(500).send('Internal Server Error')
    }
  }

  return authRequired
}
