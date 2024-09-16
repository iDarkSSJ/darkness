import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { deleteShellRequest } from "../api/shells"
import Loader from "../components/icons/Loader"

function DeleteShellPage() {
  const { shell_id } = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string | null>(null)
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors(null)

    if (!shell_id) {
      setErrors("Shell ID is missing.")
      setIsLoading(false)
      return
    }

    try {
      const response = await deleteShellRequest({
        shell_id,
        confirm_password: confirmPassword,
      })
      if (response.status === 200) {
        navigate("/shells")
      } else {
        setErrors("Failed to delete shell.")
      }
    } catch (err) {
      console.error("Error deleting shell:", err)
      setErrors("Error deleting shell.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main>
      <div>
        <h2>Delete Shell</h2>
        <form onSubmit={handleDelete}>
          <div>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {errors && <span className="error">{errors}</span>}
          {!isLoading && <button type="submit">Delete Shell</button>}
          {isLoading && <Loader />}
        </form>
      </div>
    </main>
  )
}

export default DeleteShellPage
