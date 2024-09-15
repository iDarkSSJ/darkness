import { pool } from './db.js'

export class StateModel {
  static async getStatesById({ shell_id, user_id }) {
    const client = await pool.connect()
    try {
      const response = await client.query(
        `
        SELECT * FROM states
        INNER JOIN shells ON shells.shell_id = states.shell_id
        WHERE states.shell_id = $1 AND shells.user_id = $2 ORDER BY slot_number;
        `,
        [shell_id, user_id]
      )
      return {
        states: response.rows,
      }
    } catch (err) {
      console.error(err)
      return { error: true }
    } finally {
      if (client) client.release()
    }
  }

  static async getStateById({ shell_id, state_id, user_id }) {
    const client = await pool.connect()
    try {
      const response = await client.query(
        `
        SELECT * FROM states
        INNER JOIN shells ON shells.shell_id = states.shell_id
        WHERE states.shell_id = $1 AND states.state_id = $2 AND shells.user_id = $3 ORDER BY slot_number;
        `,
        [shell_id, state_id, user_id]
      )
      return { state: response.rows[0] }
    } catch (err) {
      console.error(err)
      return { error: true }
    } finally {
      if (client) client.release()
    }
  }

  static async getStateBySlot({ shell_id, slot_number, user_id }) {
    const client = await pool.connect()
    try {
      const response = await client.query(
        `
        SELECT * FROM states
        INNER JOIN shells ON shells.shell_id = states.shell_id
        WHERE states.shell_id = $1 AND states.slot_number = $2 AND shells.user_id = $3 ORDER BY slot_number;
        `,
        [shell_id, slot_number, user_id]
      )
      return { state: response.rows[0] }
    } catch (err) {
      console.error(err)
      return { error: true }
    } finally {
      if (client) client.release()
    }
  }

  static async createState({ shell_id, state }) {
    const { slot_number, state_public_id, state_url } = state
    const client = await pool.connect()
    try {
      const response = await client.query(
        'INSERT INTO states (shell_id, slot_number, state_public_id, state_url) VALUES ($1, $2, $3, $4) RETURNING *;',
        [shell_id, slot_number, state_public_id, state_url]
      )
      return {
        state: response.rows[0],
      }
    } catch (err) {
      console.error(err)
      return { error: true }
    } finally {
      if (client) client.release()
    }
  }

  static async updateState({ shell_id, state_id, state }) {
    const { slot_number, state_public_id, state_url } = state
    const client = await pool.connect()
    try {
      const response = await client.query(
        'UPDATE states SET slot_number = $1, state_public_id = $2, state_url = $3, saved_at = NOW() WHERE shell_id = $4 AND state_id = $5 RETURNING *;',
        [slot_number, state_public_id, state_url, shell_id, state_id]
      )
      return {
        state: response.rows[0],
      }
    } catch (err) {
      console.error(err)
      return { error: true }
    } finally {
      if (client) client.release()
    }
  }

  static async deleteState({ shell_id, state_id, user_id }) {
    const client = await pool.connect()
    try {
      const shellCheck = await client.query(
        'SELECT * FROM shells WHERE shell_id = $1 AND user_id = $2',
        [shell_id, user_id]
      )

      if (shellCheck.rows.length === 0) {
        return { error: true }
      }

      const response = await client.query(
        'DELETE FROM states WHERE shell_id = $1 AND state_id = $2',
        [shell_id, state_id]
      )

      if (response.rowCount > 0) {
        return { success: true }
      } else {
        return { error: true }
      }
    } catch (err) {
      console.error('Error connecting to PostgreSQL: ', err)
      return { error: true }
    } finally {
      if (client) client.release()
    }
  }
}
