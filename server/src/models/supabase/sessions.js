import { supabase } from './supabaseClient.js'

export class SessionModel {
  static async registerSession({ token, user, device }) {
    const { user_id } = user
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert([{ user_id, session_token: token, device }])
        .select('session_id')

      if (error) {
        console.error('Error registering session in Supabase', error)
        return { error: true }
      }

      return { session_id: data[0].session_id }
    } catch (err) {
      console.error('Error interacting with Supabase', err)
      return { error: true }
    }
  }

  static async findSessionByToken({ token }) {
    try {
      const { data, error } = await supabase.from('sessions').select('*').eq('session_token', token)

      if (error) {
        console.error('Error fetching session from Supabase', error)
        return { error: true }
      }

      if (data.length > 0) {
        return { session: data[0] }
      } else {
        return { session: false }
      }
    } catch (err) {
      console.error('Error interacting with Supabase', err)
      return { error: true }
    }
  }

  static async deleteSessionByToken({ token }) {
    try {
      const { status } = await supabase.from('sessions').delete().eq('session_token', token)

      if (status === 204) {
        return { success: true }
      } else {
        return { error: true }
      }
    } catch (err) {
      console.error('Error interacting with Supabase', err)
      return { error: true }
    }
  }

  static async deleteSessionById({ session_id, user_id }) {
    try {
      const { status } = await supabase
        .from('sessions')
        .delete()
        .eq('session_id', session_id)
        .eq('user_id', user_id)

      if (status === 204) {
        return { success: true }
      } else {
        return { error: true }
      }
    } catch (err) {
      console.error('Error interacting with Supabase', err)
      return { error: true }
    }
  }

  static async deleteSessionsByUser({ user_id }) {
    try {
      const { status } = await supabase.from('sessions').delete().eq('user_id', user_id)

      if (status === 204) {
        return { success: true }
      } else {
        return { error: true }
      }
    } catch (err) {
      console.error('Error interacting with Supabase', err)
      return { error: true }
    }
  }

  static async getSessionsByUser({ user_id }) {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('session_id, device, created_at, last_updated_at')
        .eq('user_id', user_id)

      if (error) {
        console.error('Error fetching sessions from Supabase', error)
        return { error: true }
      }

      return { sessions: data }
    } catch (err) {
      console.error('Error interacting with Supabase', err)
      return { error: true }
    }
  }
}
