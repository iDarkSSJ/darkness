import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

export const pool = new pg.Pool({
  connectionString: process.env.POSTGRE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

// DEV FUNCTIONS ----------------------- 🎩
export const recreateTables = async () => {
  const client = await pool.connect()

  try {
    // Eliminar tablas en el orden de las dependencias
    // await client.query('DROP TABLE IF EXISTS g_session_temp_id;')
    // await client.query('DROP TABLE IF EXISTS states;')
    // await client.query('DROP TABLE IF EXISTS shells;')
    // await client.query('DROP TABLE IF EXISTS sessions;')
    // await client.query('DROP TABLE IF EXISTS users;')

    // Crear las tablas nuevamente
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id UUID NOT NULL DEFAULT uuid_generate_v4(),
        user_name VARCHAR(15) NOT NULL UNIQUE,
        user_email TEXT NOT NULL UNIQUE,
        user_password TEXT NOT NULL,
        password_pending BOOLEAN NOT NULL DEFAULT FALSE,
        is_google_user BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id)
      );
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        session_id UUID NOT NULL DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        session_token TEXT NOT NULL UNIQUE,
        device TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        last_updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        PRIMARY KEY (session_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      );
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS shells (
        shell_id UUID NOT NULL DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        shell_name TEXT NOT NULL,
        shell_core TEXT,
        shell_rom_public_id TEXT NOT NULL,
        shell_rom_url TEXT NOT NULL,
        shell_cover_public_id TEXT,
        shell_cover_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        PRIMARY KEY (shell_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      );
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS states (
        state_id UUID NOT NULL DEFAULT uuid_generate_v4(),
        shell_id UUID NOT NULL,
        slot_number INT NOT NULL,
        state_public_id TEXT NOT NULL,
        state_url TEXT NOT NULL,
        saved_at TIMESTAMP NOT NULL DEFAULT NOW(),
        PRIMARY KEY (state_id),
        FOREIGN KEY (shell_id) REFERENCES shells(shell_id) ON DELETE CASCADE,
        CONSTRAINT unique_slot_per_shell UNIQUE (shell_id, slot_number),
        CONSTRAINT check_slot_number CHECK (slot_number >= 0 AND slot_number <= 6)
      );
    `)

    await client.query(`
      CREATE TABlE IF NOT EXISTS g_session_temp_id (
        id UUID NOT NULL DEFAULT uuid_generate_v4(),
        session_id UUID,
        PRIMARY KEY (id),
        FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
      );
      `)

    console.log('Tables recreated successfully')
  } catch (err) {
    console.error('Error connecting to PostgreSQL', err.stack)
  } finally {
    if (client) client.release()
  }
}

export const getAllUsers = async () => {
  const client = await pool.connect()
  try {
    const response = await client.query('SELECT * FROM sessions;')

    if (response.rows.length > 0) {
      return console.log(response.rows)
    } else {
      return []
    }
  } catch (err) {
    console.error('Error connecting to PostgreSQL', err)
    return null
  } finally {
    if (client) client.release()
  }
}
