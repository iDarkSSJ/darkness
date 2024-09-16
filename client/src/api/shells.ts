import { ShellData } from '../types/types.d';
import axios from './axios'

export const getShellsRequest = async () => axios.get('/shells')

export const getSingleShellRequest = async (shell_id: string | undefined) => {
  return axios.get(`/shells/${shell_id}`)
}

export const addShellRequest = async (data: ShellData) => axios.post('/add-shell', data)

interface UpdateShellData {
  shell_id: string
  shell_name: string
  shell_cover_url: string
  shell_cover_public_id: string
}

export const updateShellRequest = async ({
  shell_id,
  shell_name,
  shell_cover_url,
  shell_cover_public_id,
}: UpdateShellData) => {
  const data = {
    shell_name,
    shell_cover_url,
    shell_cover_public_id,
  }

  return axios.put(`/edit-shell/${shell_id}`, data)
}

export const deleteShellRequest = async ({
  shell_id,
  confirm_password,
}: {
  shell_id: string
  confirm_password: string
}) => {
  return axios.delete(`/rm-shell/${shell_id}`, {
    params: { confirm_password },
  })
}
