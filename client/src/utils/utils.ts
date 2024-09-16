import JSZip from "jszip";
import { useLocation } from "react-router-dom";
import { getSignature } from "../api/upload";
import axios from "axios";

export function useQuery() {
  return new URLSearchParams(useLocation().search)
}

export async function unZipFile(fileUrl: string) {
  const response = await fetch(fileUrl)
  const blob = await response.blob()
  const zip = new JSZip()
  const zipContent = await zip.loadAsync(blob)

  const romFileName = Object.keys(zipContent.files)[0]
  const romBlob = await zipContent.files[romFileName].async('blob')

  return romBlob
}

export async function saveThumbToCache(shell_id: string, slot_number: string | number, thumbnailBlob: Blob | undefined) {
  const cache = await caches.open('thumb-cache')

  const url = `/thumb/${shell_id}/${slot_number}`
  const request = new Request(url)
  const response = new Response(thumbnailBlob)
  await cache.put(request, response)
}

export async function getThumbFromCache(shell_id: string, slot_number: string | number) {
  const cache = await caches.open('thumb-cache')
  const url = `/thumb/${shell_id}/${slot_number}`
  const response = await cache.match(url)
  if (response) {
    const blob = await response.blob()
    return blob
  }
  return null
}

export const uploadToCloudinary = async (file: Blob, resourceType: 'image' | 'raw') => {
  try {
    const { signature, timestamp } = await getSignature(resourceType)

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    if (!cloudName) {
      throw new Error('Cloud Name is not defined')
    }

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`
    const formData = new FormData()

    formData.append('file', file)
    formData.append('upload_preset', 'roms_preset')
    formData.append('timestamp', timestamp.toString())
    formData.append('signature', signature)
    formData.append('api_key', import.meta.env.VITE_CLOUDINARY_API_KEY)
    formData.append('folder', resourceType === 'image' ? 'covers' : 'roms')

    if (resourceType === 'image') {
      formData.append('eager', 'c_scale,w_500,q_auto:good')
    }

    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  } catch (error) {
    console.error('Failed to upload file to Cloudinary:', error)
    throw error
  }
}