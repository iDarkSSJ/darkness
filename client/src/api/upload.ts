import axios from './axios'


export const getSignature = async (resourceType: 'image' | 'raw') => {
  const response = await axios.get(`/upload-signature`, {
    params: { resourceType }, 
  })
  return response.data
}