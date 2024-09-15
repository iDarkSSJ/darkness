import { pool } from './db.js'

export class UserModel {
  static async registerUser({ user }) {
    const { user_name, user_email, user_password, password_pending, is_google_user } = user

    const lowercasedUsername = user_name.toLowerCase()

    const client = await pool.connect()
    try {
      const response = await client.query(
        `
          INSERT INTO users (user_name, user_email, user_password, password_pending, is_google_user) VALUES
          ($1, $2, $3, $4, $5) RETURNING *
        `,
        [lowercasedUsername, user_email, user_password, password_pending, is_google_user]
      )

      return {
        user: response.rows[0],
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

  static async checkUserExists({ user }) {
    const { user_name, user_email } = user
    const client = await pool.connect()

    const lowercasedUsername = user_name.toLowerCase()
    try {
      const response = await client.query(
        `
          SELECT * FROM users WHERE user_name = $1 OR user_email = $2
        `,
        [lowercasedUsername, user_email]
      )

      if (response.rows.length > 0) {
        return true
      } else return false
    } catch (err) {
      console.error('Error connecting to PostgreSQL', err)
      return {
        error: true,
      }
    } finally {
      if (client) client.release()
    }
  }

  static async findUserByIdOrEmail({ user }) {
    const { user: userInput } = user
    const client = await pool.connect()

    const lowercasedUsername = userInput.toLowerCase()
    try {
      const response = await client.query(
        `
          SELECT * FROM users WHERE user_name = $1 OR user_email = $2
        `,
        [lowercasedUsername, userInput]
      )

      if (response.rows.length > 0) {
        return {
          user: response.rows[0],
        }
      } else
        return {
          user: false,
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

  static async findUserById({ user_id }) {
    const client = await pool.connect()

    try {
      const response = await client.query(
        `
          SELECT * FROM users WHERE user_id = $1
        `,
        [user_id]
      )

      if (response.rows.length > 0) {
        return {
          user: response.rows[0],
        }
      } else
        return {
          user: false,
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
