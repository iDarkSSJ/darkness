import { SessionModel } from '../models/postgreRender/sessions.js'

export class SessionController {
  static async getAllSessions(req, res) {
    const { user_id } = req.user
    if (!user_id) return res.status(400).send('User not found')

    try {
      const sessionsFound = await SessionModel.getSessionsByUser({ user_id })
      if (sessionsFound.error) return res.status(500).send('Internal Server Error')
      if (!sessionsFound.sessions) return res.status(404).send('No sessions found')
      return res.json(sessionsFound.sessions)
    } catch (err) {
      console.error('Error during session fetch:', err)
      return res.status(500).send('Internal Server Error, Please try again')
    }
  }

  static async removeSession(req, res) {
    const { session_id } = req.params
    const { user_id } = req.user

    if (!session_id || !user_id) return res.status(400).send('Missing session or user id')

    try {
      const result = await SessionModel.deleteSessionById({
        session_id,
        user_id,
      })
      if (result.error) {
        return res.status(500).send('Error deleting session')
      }

      return res.status(200).send('Session deleted successfully')
    } catch (err) {
      console.error('Error during session clear:', err)
      return res.status(500).send('Internal Server Error, Please try again')
    }
  }

  static async clearSessions(req, res) {
    const { user_id } = req.user
    if (!user_id) return res.status(400).send('User not found')

    try {
      const result = await SessionModel.deleteSessionsByUser({ user_id })
      if (result.error) {
        return res.status(500).send('Error deleting all sessions')
      }

      return res.clearCookie('auth').sendStatus(200)
    } catch (err) {
      console.error('Error during all sessions clear:', err)
      return res.status(500).send('Internal Server Error, Please try again')
    }
  }
}
