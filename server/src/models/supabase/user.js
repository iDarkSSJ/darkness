import { supabase } from './supabaseClient.js'

export class UserModel {
  static async registerUser({ user }) {
    const { user_name, user_email, user_password, password_pending, is_google_user } = user
    const lowercasedUsername = user_name.toLowerCase()

    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          user_name: lowercasedUsername,
          user_email,
          user_password,
          password_pending,
          is_google_user,
        })
        .select('*')

      if (error) {
        console.error('Error registering user in Supabase:', error)
        return { error: true }
      }

      return { user: data[0] }
    } catch (err) {
      console.error('Error interacting with Supabase:', err)
      return { error: true }
    }
  }

  static async checkUserExists({ user }) {
    const { user_name, user_email } = user
    const lowercasedUsername = user_name.toLowerCase()

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`user_name.eq.${lowercasedUsername},user_email.eq.${user_email}`)

      if (error) {
        console.error('Error checking user existence in Supabase:', error)
        return { error: true }
      }

      return data.length > 0
    } catch (err) {
      console.error('Error interacting with Supabase:', err)
      return { error: true }
    }
  }

  static async findUserByIdOrEmail({ user }) {
    const { user: userInput } = user
    const lowercasedUsername = userInput.toLowerCase()

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`user_name.eq.${lowercasedUsername},user_email.eq.${userInput}`)

      if (error) {
        console.error('Error fetching user by ID or email from Supabase:', error)
        return { error: true }
      }

      return { user: data.length > 0 ? data[0] : false }
    } catch (err) {
      console.error('Error interacting with Supabase:', err)
      return { error: true }
    }
  }

  static async findUserById({ user_id }) {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('user_id', user_id)

      if (error) {
        console.error('Error fetching user by ID from Supabase:', error)
        return { error: true }
      }

      return { user: data.length > 0 ? data[0] : false }
    } catch (err) {
      console.error('Error interacting with Supabase:', err)
      return { error: true }
    }
  }
}
