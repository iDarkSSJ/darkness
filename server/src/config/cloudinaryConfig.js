import { v2 as cloudinary } from 'cloudinary'
import { configDotenv } from 'dotenv'
import crypto from 'crypto'

configDotenv()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadToCloud = (fileBuffer, folder, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    let uploadOptions = {
      folder,
      resource_type: resourceType,
      public_id: crypto.randomUUID(),
    }

    if (resourceType === 'image') {
      uploadOptions = {
        ...uploadOptions,
        transformation: [
          {
            width: 500,
            crop: 'scale',
            fetch_format: 'auto',
            quality: 'auto:good',
          },
        ],
      }
    }

    cloudinary.uploader
      .upload_stream(uploadOptions, (err, result) => {
        if (err) {
          reject(new Error(JSON.stringify(err)))
        } else {
          resolve(result)
        }
      })
      .end(fileBuffer)
  })
}

export const deleteRawFromCloud = (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.api
      .delete_resources([publicId], { type: 'upload', resource_type: 'raw' })
      .then((result) => resolve(result))
      .catch((err) => reject(new Error(JSON.stringify(err))))
  })
}

export const deleteImageFromCloud = (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.api
      .delete_resources([publicId], { type: 'upload', resource_type: 'image' })
      .then((result) => resolve(result))
      .catch((err) => reject(new Error(JSON.stringify(err))))
  })
}
