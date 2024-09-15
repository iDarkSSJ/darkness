import { pool } from './db.js'

export class gSessionTempId {
  static async createId({ session_id }) {
    const client = await pool.connect()

    try {
      const response = await client.query(
        'INSERT INTO g_session_temp_id (session_id) VALUES ($1) RETURNING id;',
        [session_id]
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

  static async deleteId({ temp_id }) {
    const client = await pool.connect()

    try {
      const response = await client.query('DELETE FROM g_session_temp_id WHERE id = $1;', [temp_id])

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

  static async getTokenByTempId({ temp_id }) {
    const client = await pool.connect()
    try {
      // JOIN
      const response = await client.query(
        `
        SELECT sessions.session_token
        FROM sessions 
        INNER JOIN g_session_temp_id ON sessions.session_id = g_session_temp_id.session_id
        WHERE g_session_temp_id.id = $1;
        `,
        [temp_id]
      )
      if (response.rowCount > 0) {
        return {
          token: response.rows[0].session_token,
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
}
