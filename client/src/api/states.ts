import axios from "./axios"

export const getStatesReq = (shell_id: string) => {
  return axios.get(`/states/${shell_id}`)
}

export const createStateReq = (shell_id: string, stateBlob: Blob, slot_number: number) => {
  const formData = new FormData()

  formData.append('state', stateBlob, 'state.bin')

  formData.append('slot_number', slot_number.toString())

  return axios.post(`/add-state/${shell_id}`, formData)
}

export const autoSaveReq = (shell_id: string, stateBlob: Blob) => {
  const autoSaveSlot = 0
  const formData = new FormData()
  formData.append('state', stateBlob, 'state.bin')
  formData.append('slot_number', autoSaveSlot.toString())
  return axios.post(`/add-state/${shell_id}`, formData)
}

export const getAutoSave = (shell_id:string) => {
  return axios.get(`/states/${shell_id}/0`)
}


