import { supabase } from './supabaseClient.js'

export class StateModel {
  static async getStatesById({ shell_id, user_id }) {
    try {
      const { data, error } = await supabase
        .from('states')
        .select('*, shells(user_id)')
        .eq('shell_id', shell_id)
        .eq('shells.user_id', user_id)
        .order('slot_number', { ascending: true })

      if (error) {
        console.error('Error fetching states from Supabase', error)
        return { error: true }
      }

      return { states: data }
    } catch (err) {
      console.error('Error interacting with Supabase', err)
      return { error: true }
    }
  }

  static async getStateById({ shell_id, state_id, user_id }) {
    try {
      const { data, error } = await supabase
        .from('states')
        .select('*, shells(user_id)')
        .eq('shell_id', shell_id)
        .eq('state_id', state_id)
        .eq('shells.user_id', user_id)
        .order('slot_number', { ascending: true })

      if (error) {
        console.error('Error fetching state from Supabase', error)
        return { error: true }
      }

      return { state: data[0] }
    } catch (err) {
      console.error('Error interacting with Supabase', err)
      return { error: true }
    }
  }

  static async getStateBySlot({ shell_id, slot_number, user_id }) {
    try {
      const { data, error } = await supabase
        .from('states')
        .select('*, shells(user_id)')
        .eq('shell_id', shell_id)
        .eq('slot_number', slot_number)
        .eq('shells.user_id', user_id)
        .order('slot_number', { ascending: true })

      if (error) {
        console.error('Error fetching state from Supabase', error)
        return { error: true }
      }

      return { state: data[0] }
    } catch (err) {
      console.error('Error interacting with Supabase', err)
      return { error: true }
    }
  }

  static async createState({ shell_id, state }) {
    const { slot_number, state_public_id, state_url } = state

    try {
      const { data, error } = await supabase
        .from('states')
        .insert({
          shell_id,
          slot_number,
          state_public_id,
          state_url,
        })
        .select('*')

      if (error) {
        console.error('Error creating state in Supabase', error)
        return { error: true }
      }

      return { state: data[0] }
    } catch (err) {
      console.error('Error interacting with Supabase', err)
      return { error: true }
    }
  }

  static async updateState({ shell_id, state_id, state }) {
    const { slot_number, state_public_id, state_url } = state

    try {
      const { data, error } = await supabase
        .from('states')
        .update({
          slot_number,
          state_public_id,
          state_url,
          saved_at: new Date().toISOString(),
        })
        .eq('shell_id', shell_id)
        .eq('state_id', state_id)
        .select('*')

      if (error) {
        console.error('Error updating state in Supabase', error)
        return { error: true }
      }

      return { state: data[0] }
    } catch (err) {
      console.error('Error interacting with Supabase', err)
      return { error: true }
    }
  }

  static async deleteState({ shell_id, state_id, user_id }) {
    try {
      const { data: shellCheck, error: shellError } = await supabase
        .from('shells')
        .select('shell_id')
        .eq('shell_id', shell_id)
        .eq('user_id', user_id)

      if (shellError || shellCheck.length === 0) {
        console.error('Error checking shell ownership', shellError)
        return { error: true }
      }

      const { status } = await supabase
        .from('states')
        .delete()
        .eq('shell_id', shell_id)
        .eq('state_id', state_id)

      if (status !== 204) {
        return { error: true }
      }

      return { success: status === 204 }
    } catch (err) {
      console.error('Error interacting with Supabase', err)
      return { error: true }
    }
  }
}
