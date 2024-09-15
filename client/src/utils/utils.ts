import JSZip from "jszip";
import { useLocation } from "react-router-dom";

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