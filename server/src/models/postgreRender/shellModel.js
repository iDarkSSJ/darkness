import { pool } from './db.js'

export class ShellModel {
  static async getShellsByUserId({ user_id }) {
    const client = await pool.connect()
    try {
      const response = await client.query('SELECT * FROM shells WHERE user_id = $1;', [user_id])
      return {
        shells: response.rows,
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

  static async createShell({ user_id, shell }) {
    const {
      shell_name,
      shell_core,
      shell_rom_url,
      shell_rom_public_id,
      shell_cover_url,
      shell_cover_public_id,
    } = shell

    const client = await pool.connect()
    try {
      const response = await client.query(
        `INSERT INTO shells (user_id, shell_name, shell_rom_url, shell_rom_public_id, shell_cover_url, shell_cover_public_id, shell_core)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING shell_id;`,
        [
          user_id,
          shell_name,
          shell_rom_url,
          shell_rom_public_id,
          shell_cover_url,
          shell_cover_public_id,
          shell_core,
        ]
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

  static async deleteShellById({ shell_id, user_id }) {
    const client = await pool.connect()
    try {
      const response = await client.query(
        'DELETE FROM shells WHERE shell_id = $1 AND user_id = $2;',
        [shell_id, user_id]
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

  static async getShellById({ shell_id, user_id }) {
    const client = await pool.connect()
    try {
      const response = await client.query(
        'SELECT * FROM shells WHERE shell_id = $1 AND user_id = $2;',
        [shell_id, user_id]
      )
      return {
        shell: response.rows[0],
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

  static async updateShell({ user_id, shell }) {
    const { shell_id, shell_name, shell_cover_url, shell_cover_public_id } = shell

    const client = await pool.connect()
    try {
      const response = await client.query(
        'UPDATE shells SET shell_name = $1, shell_cover_url = $2, shell_cover_public_id = $3 WHERE shell_id = $4 AND user_id = $5 RETURNING shell_id;',
        [shell_name, shell_cover_url, shell_cover_public_id, shell_id, user_id]
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
}
