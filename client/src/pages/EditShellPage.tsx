import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  ACCEPTED_COVER_EXTENSIONS,
  APIError,
  CoverExtension,
} from "../types/types.d"
import { useNavigate, useParams } from "react-router-dom"
import { updateShellRequest, getSingleShellRequest } from "../api/shells"
import Loader from "../components/icons/Loader"
import { uploadToCloudinary } from "../utils/utils"

function EditShellPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [isFormChanged, setIsFormChanged] = useState(false)
  const { shell_id } = useParams()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors: formErrors },
  } = useForm()

  useEffect(() => {
    const fetchShellData = async () => {
      try {
        const response = await getSingleShellRequest(shell_id)
        if (response.status === 200) {
          const shellData = response.data
          setValue("shell_name", shellData.shell_name)
          setCoverPreview(shellData.shell_cover_url)
        } else {
          setErrors("Failed to fetch shell data.")
        }
      } catch (err) {
        console.error("Error fetching shell data:", err)
        setErrors("Error fetching shell data.")
      }
    }

    if (shell_id) {
      fetchShellData()
    }
  }, [shell_id, setValue])

  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toLowerCase() || ""
  }

  const reqUpdateShell = async (data: {
    shell_id: string
    shell_name: string
    shell_cover_url: string
    shell_cover_public_id: string
  }) => {
    try {
      const response = await updateShellRequest(data)
      if (response.status === 200) {
        setIsLoading(false)
        navigate("/shells")
      } else {
        setIsLoading(false)
        setErrors("Failed to update shell.")
      }
    } catch (err) {
      setIsLoading(false)
      console.error("Error updating shell:", err)
      const error = err as APIError
      setErrors(error.response?.data?.error ?? "Error")
    }
  }

  const handleOnSubmit = handleSubmit(async (data) => {
    setIsLoading(true)
    setErrors(null)
    const { shell_name, shell_cover } = data

    if (shell_cover[0]) {
      const coverFileExtension = getFileExtension(
        shell_cover[0].name
      ) as CoverExtension
      if (!ACCEPTED_COVER_EXTENSIONS.includes(coverFileExtension)) {
        setErrors("Invalid cover file extension.")
        return
      }
    }

    try {
      let coverUploadResult = null
      if (shell_cover[0]) {
        coverUploadResult = await uploadToCloudinary(shell_cover[0], "image")
      }

      const body = {
        shell_id: shell_id || "",
        shell_name: shell_name,
        shell_cover_url: coverUploadResult?.secure_url,
        shell_cover_public_id: coverUploadResult?.public_id,
      }

      await reqUpdateShell(body)
    } catch (err) {
      setIsLoading(false)
      console.error("Error during shell update: ", err)
    }
  })

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const coverFile = e.target.files?.[0]
    if (coverFile) {
      const coverPreviewUrl = URL.createObjectURL(coverFile)
      setCoverPreview(coverPreviewUrl)
    }
    setIsFormChanged(true)
  }

  const handleInputChange = () => {
    setIsFormChanged(true)
  }

  return (
    <main>
      <div>
        <h2>Edit Shell</h2>
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
              onChange={handleInputChange}
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
          {errors && <span className="error">{errors}</span>}
          <button
            className={isFormChanged ? "btnn" : "btnDisabled"}
            type="submit"
            disabled={!isFormChanged || isLoading}>
            Update Shell
          </button>
          {isLoading && <Loader />}
        </form>
      </div>
    </main>
  )
}

export default EditShellPage
