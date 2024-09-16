import { v2 as cloudinary } from 'cloudinary'
import { config as configDotenv } from 'dotenv'
import { Router } from 'express'

configDotenv()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadRouter = Router()

uploadRouter.get('/upload-signature', (req, res) => {
  const { resourceType } = req.query
  const timestamp = Math.round(new Date().getTime() / 1000)

  const params = {
    timestamp: timestamp.toString(),
    upload_preset: 'roms_preset',
    folder: resourceType === 'image' ? 'covers' : 'roms',
  }

  // Add eager transformation for images
  if (resourceType === 'image') {
    params.eager = 'c_scale,w_500,q_auto:good'
  }

  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET)

  res.json({ signature, timestamp })
})

export default uploadRouter
