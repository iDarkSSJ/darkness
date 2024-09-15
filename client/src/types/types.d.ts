
export const ACCEPTED_ROM_EXTENSIONS = ["nes", "snes", "gb", "gba", "gbc", "sfc", "smc", "bin", "smd", "md", "gen"] as const

export const ACCEPTED_COVER_EXTENSIONS = ["jpg", "png", "jpeg"] as const

export enum GoogleAction {
  LOGIN = "LOGIN",
  REGISTER = "REGISTER",
}

export const EXTENSION_TO_CORE = {
  nes: "fceumm",
  snes: "snes9x",
  gb: "mgba",
  gba: "mgba",
  gbc: "mgba",
  sfc: "snes9x",
  smc: "snes9x",
  bin: "genesis_plus_gx",
  smd: "genesis_plus_gx",
  md: "genesis_plus_gx",
  gen: "genesis_plus_gx",
} as const

export type RomExtension = typeof ACCEPTED_ROM_EXTENSIONS[number]
export type CoverExtension = typeof ACCEPTED_COVER_EXTENSIONS[number]

export interface LoginUserType {
  user: string,
  user_password: string,
}

export interface RegisterUserType {
  user_name: string,
  user_email: string,
  user_password: string,
}

export interface ProfileType {
  user_name: string,
  user_email: string,
  password_pending: boolean,
  is_google_user: boolean,
  created_at: number
}

export interface SessionType {
  session_id: string,
  device: string,
  created_at: number,
  last_updated_at: number
}

export interface APIError extends Error {
  response?: {
    data?: {
      error: string,
    }
  }
}

export interface ShellType {
  shell_id: string,
  shell_name: string,
  shell_core: string,
  shell_rom_url: string,
  shell_cover_url?: string,
  created_at: number,
}

export interface StateType {
  state_id: string,
  shell_id: string,
  slot_number: number,
  state_url: string,
  saved_at: number,
}

export enum StateFunctionType {
  LOAD = "LOAD",
  SAVE = "SAVE",
}


