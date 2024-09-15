import { LoginUserType, RegisterUserType } from '../types/types'
import axios from './axios'

export const loginRequest = async (user: LoginUserType) => axios.post('/login', user)

export const registerRequest = async (user: RegisterUserType) => axios.post('/register', user)

export const verifyRequest = async () => axios.get('/verify')

export const logoutRequest = async () => axios.post('/logout')

export const profileRequest = async () => axios.get('/profile')

export const sessionsRequest = async () => axios.get('/sessions')

export const googleVerifyReq = async (tempId: string) => {
  return axios.post(`/google/auth/${tempId}`)
}

export const deleteSessionRequest = async (session_id: string) => {
  return axios.delete(`/sessions/${session_id}`)
}

export const clearAllSessionsRequest = async () => axios.delete('/sessions')