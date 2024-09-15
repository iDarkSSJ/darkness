import AdmZip from 'adm-zip'
import { uploadToCloud } from '../config/cloudinaryConfig.js'

export const compressToZipInMemory = (fileBuffer, filename) => {
  return new Promise((resolve, reject) => {
    try {
      const zip = new AdmZip()
      zip.addFile(crypto.randomUUID(), fileBuffer)
      const zipBuffer = zip.toBuffer()
      resolve(zipBuffer)
    } catch (err) {
      reject(err)
    }
  })
}

export const uploadStateToCloud = async (stateBuffer) => {
  try {
    const stateUploadResult = await uploadToCloud(stateBuffer, 'states', 'raw')
    return {
      state_public_id: stateUploadResult.public_id,
      state_url: stateUploadResult.secure_url,
    }
  } catch (err) {
    console.error('Error uploading to cloud:', err)
    throw new Error('Failed to upload state to cloud.')
  }
}
