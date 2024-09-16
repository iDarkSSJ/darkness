import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { googleVerifyReq } from "../api/auth"
import { useAuth } from "../context/useAuth"
import Loader from "./icons/Loader"

function GoogleVerify() {
  const { tempId = "" } = useParams()
  const { setIsLoading } = useAuth()

  useEffect(() => {
    const getToken = async () => {
      try {
        const response = await googleVerifyReq(tempId)
        if (response.status === 200) {
          setIsLoading(false)
          window.location.href = "/shells"
        }
      } catch (err) {
        setIsLoading(false)
        window.location.href = "/login?error=Error validating account"
      }
    }

    getToken()
  }, [tempId, setIsLoading])

  return <Loader />
}

export default GoogleVerify
