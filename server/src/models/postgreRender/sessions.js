import { pool } from './db.js'

export class SessionModel {
  static async registerSession({ token, user, device }) {
    const { user_id } = user
    const client = await pool.connect()
    try {
      const response = await client.query(
        `
          INSERT INTO sessions (user_id, session_token, device) VALUES
          ($1, $2, $3) RETURNING session_id;
        `,
        [user_id, token, device]
      )

      return response.rows[0]
    } catch (err) {
      console.error('Error connecting to PostgreSQL', err)
      return {
        error: true,
      }
    } finally {
      if (client) client.release()
    }
  }

  static async findSessionByToken({ token }) {
    const client = await pool.connect()
    try {
      const response = await client.query(
        `
          SELECT * FROM sessions WHERE session_token = $1;
        `,
        [token]
      )

      if (response.rows.length > 0) {
        return {
          session: response.rows[0],
        }
      } else
        return {
          session: false,
        }
    } catch (err) {
      console.error('Error connecting to PostgreSQL', err)
      return {
        error: true,
      }
    } finally {
      if (client) client.release()
    }
  }

  static async deleteSessionByToken({ token }) {
    const client = await pool.connect()

    try {
      const response = await client.query(
        'DELETE FROM sessions WHERE session_token = $1;',
        [token]
      )

      if (response.rowCount > 0) {
        return {
          success: true,
        }
      } else
        return {
          error: true,
        }
    } catch (err) {
      console.error('Error connecting to PostgreSQL', err)
      return {
        error: true,
      }
    } finally {
      if (client) client.release()
    }
  }

  static async deleteSessionById({ session_id, user_id }) {
    const client = await pool.connect()
    try {
      const response = await client.query(
        'DELETE FROM sessions WHERE session_id = $1 AND user_id = $2;',
        [session_id, user_id]
      )
      if (response.rowCount > 0) {
        return {
          success: true,
        }
      } else {
        return {
          error: true,
        }
      }
    } catch (err) {
      console.error('Error connecting to PostgreSQL', err)
      return {
        error: true,
      }
    } finally {
      if (client) client.release()
    }
  }

  static async deleteSessionsByUser({ user_id }) {
    const client = await pool.connect()
    try {
      const response = await client.query(
        'DELETE FROM sessions WHERE user_id = $1;',
        [user_id]
      )

      if (response.rowCount > 0) {
        return {
          success: true,
        }
      } else
        return {
          error: true,
        }
    } catch (err) {
      console.error('Error connecting to PostgreSQL', err)
      return {
        error: true,
      }
    } finally {
      if (client) client.release()
    }
  }

  static async getSessionsByUser({ user_id }) {
    const client = await pool.connect()
    try {
      const response = await client.query(
        'SELECT session_id,device, created_at, last_updated_at FROM sessions WHERE user_id = $1',
        [user_id]
      )
      return {
        sessions: response.rows,
      }
    } catch (err) {
      console.error('Error connecting to PostgreSQL', err)
      return {
        error: true,
      }
    } finally {
      if (client) client.release()
    }
  }
}
