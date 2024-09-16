import axios from './axios'

export const getShellsRequest = async () => axios.get('/shells')

export const getSingleShellRequest = async (shell_id: string) => {
  return axios.get(`/shells/${shell_id}`)
}

export const addShellRequest = async (data: FormData) => axios.post('/add-shell', data);
