import { supabase } from './supabaseClient.js'

export class ShellModel {
  static async getShellsByUserId({ user_id }) {
    try {
      const { data, error } = await supabase.from('shells').select('*').eq('user_id', user_id)

      if (error) {
        console.error('Error fetching shells from Supabase', error)
        return { error: true }
      }

      return { shells: data }
    } catch (err) {
      console.error('Error interacting with Supabase', err)
      return { error: true }
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

    try {
      const { data, error } = await supabase
        .from('shells')
        .insert([
          {
            user_id,
            shell_name,
            shell_rom_url,
            shell_rom_public_id,
            shell_cover_url,
            shell_cover_public_id,
            shell_core,
          },
        ])
        .select('shell_id')

      if (error) {
        console.error('Error creating shell in Supabase', error)
        return { error: true }
      }

      return { shell_id: data[0].shell_id }
    } catch (err) {
      console.error('Error interacting with Supabase', err)
      return { error: true }
    }
  }

  static async deleteShellById({ shell_id, user_id }) {
    try {
      const { status } = await supabase
        .from('shells')
        .delete()
        .eq('shell_id', shell_id)
        .eq('user_id', user_id)

      if (status !== 204) {
        return { error: true }
      }

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

  static async getShellById({ shell_id, user_id }) {
    try {
      const { data, error } = await supabase
        .from('shells')
        .select('*')
        .eq('shell_id', shell_id)
        .eq('user_id', user_id)

      if (error) {
        console.error('Error fetching shell from Supabase', error)
        return { error: true }
      }

      return { shell: data[0] }
    } catch (err) {
      console.error('Error interacting with Supabase', err)
      return { error: true }
    }
  }

  static async updateShell({ user_id, shell }) {
    const { shell_id, shell_name, shell_cover_url, shell_cover_public_id } = shell

    try {
      const { data, error } = await supabase
        .from('shells')
        .update({
          shell_name,
          shell_cover_url,
          shell_cover_public_id,
        })
        .eq('shell_id', shell_id)
        .eq('user_id', user_id)
        .select('shell_id')

      if (error) {
        console.error('Error updating shell in Supabase', error)
        return { error: true }
      }

      return { shell_id: data[0].shell_id }
    } catch (err) {
      console.error('Error interacting with Supabase', err)
      return { error: true }
    }
  }
}
