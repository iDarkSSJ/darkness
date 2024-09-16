import { useState } from "react"
import { useForm } from "react-hook-form"
import {
  ACCEPTED_COVER_EXTENSIONS,
  ACCEPTED_ROM_EXTENSIONS,
  APIError,
  CoverExtension,
  EXTENSION_TO_CORE,
  RomExtension,
} from "../types/types.d"
import { useNavigate } from "react-router-dom"
import { addShellRequest } from "../api/shells"
import Loader from "../components/icons/Loader"
import { uploadToCloudinary } from "../utils/utils"
import JSZip from "jszip"

function CreateShellPage() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const [errors, setErrors] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm()

  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toLowerCase() || ""
  }

  const reqNewShell = async (data: FormData) => {
    try {
      const response = await addShellRequest(data)
      if (response.status === 200) {
        setIsLoading(false)
        navigate("/shells")
      } else {
        setIsLoading(false)
        setErrors("Failed to create new shell.")
      }
    } catch (err) {
      setIsLoading(false)
      console.error("Error creating new shell:", err)
      const error = err as APIError
      setErrors(error.response?.data?.error ?? "Error")
    }
  }

  const handleOnSubmit = handleSubmit(async (data) => {
    setIsLoading(true)
    setErrors(null)
    const { shell_name, shell_cover, shell_rom } = data

    const romFileExtension = getFileExtension(shell_rom[0].name) as RomExtension

    if (shell_cover[0]) {
      const coverFileExtension = getFileExtension(
        shell_cover[0].name
      ) as CoverExtension
      if (!ACCEPTED_COVER_EXTENSIONS.includes(coverFileExtension)) {
        setErrors("Invalid cover file extension.")
        return
      }
    }
    if (!ACCEPTED_ROM_EXTENSIONS.includes(romFileExtension)) {
      setErrors("Invalid ROM file extension.")
      return
    }

    const shell_core = EXTENSION_TO_CORE[romFileExtension]

    try {
      const zip = new JSZip()
      zip.file(shell_rom[0].name, shell_rom[0], {
        compression: "DEFLATE",
        compressionOptions: { level: 9 },
      })
      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 9 },
      })

      const romUploadResult = await uploadToCloudinary(zipBlob, "raw")

      let coverUploadResult = null
      if (shell_cover[0]) {
        coverUploadResult = await uploadToCloudinary(shell_cover[0], "image")
      }

      const formData = new FormData()
      formData.append("shell_name", shell_name)
      formData.append("shell_core", shell_core)
      formData.append("shell_rom_url", romUploadResult.secure_url)
      formData.append("shell_rom_public_id", romUploadResult.public_id)
      if (coverUploadResult) {
        formData.append("shell_cover_url", coverUploadResult.secure_url)
        formData.append("shell_cover_public_id", coverUploadResult.public_id)
      }

      await reqNewShell(formData)
    } catch (err) {
      setIsLoading(false)
      console.error("Error during shell creation: ", err)
    }
  })

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const coverFile = e.target.files?.[0]
    if (coverFile) {
      const coverPreviewUrl = URL.createObjectURL(coverFile)
      setCoverPreview(coverPreviewUrl)
    }
  }

  return (
    <main>
      <div>
        <h2>Create Shell</h2>
        <form className="shellForm" onSubmit={handleOnSubmit}>
          <div>
            <label htmlFor="shellName">Name</label>
            <input
              type="text"
              id="shellName"
              placeholder="Flappy Bird"
              {...register("shell_name", {
                required: true,
                minLength: 3,
                maxLength: 30,
              })}
            />
            {formErrors.shell_name && (
              <span className="error">
                The name must be between 3 and 30 characters long
              </span>
            )}
          </div>
          <div>
            <label className="label optional" htmlFor="shellCover">
              Cover
            </label>
            <input
              className="input-file"
              id="shellCover"
              type="file"
              accept=".jpg, .png, .jpeg"
              {...register("shell_cover", {
                required: false,
              })}
              onChange={handleCoverChange}
            />
            {coverPreview && (
              <div className="coverPreview">
                <img src={coverPreview} />
              </div>
            )}
            {formErrors.shell_cover && (
              <span className="error">Invalid file type.</span>
            )}
          </div>
          <div>
            <label className="label" htmlFor="shellRom">
              ROM
            </label>
            <input
              className="input-file"
              id="shellRom"
              type="file"
              accept=".nes,.snes,.gb,.gba,.gbc,.sfc,.smc,.bin,.md,.gen,smd"
              {...register("shell_rom", {
                required: true,
              })}
            />
            {formErrors.shell_rom && (
              <span className="error">Invalid Rom.</span>
            )}
          </div>
          {errors && <span className="error">{errors}</span>}
          {!isLoading && <button type="submit">Create Shell</button>}
          {isLoading && <Loader />}
        </form>
        <footer>
          <p>
            Aceptamos archivos con las siguientes extensiones:
            <strong>
              .nes, .snes, .gb, .gba, .gbc, .sfc, .smc, .bin, .md, .gen, .smd
            </strong>
            Esto incluye juegos para Game Boy, Game Boy Color, Game Boy Advance,
            Mega Drive, NES y SNES.
          </p>
        </footer>
      </div>
    </main>
  )
}

export default CreateShellPage
