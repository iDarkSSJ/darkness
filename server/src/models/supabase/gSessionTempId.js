import { supabase } from './supabaseClient.js'

export class gSessionTempId {
  static async createId({ session_id }) {
    try {
      const { data, error } = await supabase
        .from('g_session_temp_id')
        .insert({ session_id })
        .select('id')
        .single()

      if (error) throw error

      return data
    } catch (err) {
      console.error('Error inserting into Supabase', err)
      return {
        error: true,
      }
    }
  }

  static async deleteId({ temp_id }) {
    try {
      const { status } = await supabase.from('g_session_temp_id').delete().eq('id', temp_id)

      if (status === 204) {
        return {
          success: true,
        }
      } else {
        return {
          error: true,
        }
      }
    } catch (err) {
      console.error('Error deleting from Supabase', err)
      return {
        error: true,
      }
    }
  }

  static async getTokenByTempId({ temp_id }) {
    try {
      const { data, error } = await supabase
        .from('g_session_temp_id')
        .select('sessions!inner(session_token)')
        .eq('id', temp_id)
        .single()

      if (error) throw error

      if (data) {
        return {
          token: data.sessions.session_token,
        }
      } else {
        return {
          error: true,
        }
      }
    } catch (err) {
      console.error('Error querying Supabase', err)
      return {
        error: true,
      }
    }
  }
}
