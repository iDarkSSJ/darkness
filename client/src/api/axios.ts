import axios from 'axios'

const instance = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_APP_API_URL}/api`,
  withCredentials: true
})

export default instance
