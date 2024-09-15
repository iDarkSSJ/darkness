import { GoogleAction } from "../types/types.d"
import Google from "./svg/Google"

function GoogleButton({ action }: { action: GoogleAction }) {
  const baseURL = import.meta.env.VITE_SERVER_APP_API_URL

  const url =
    action === GoogleAction.LOGIN ? `${baseURL}/api/google/login` : `${baseURL}/api/google/register`

  const handleClick = () => {
    window.location.href = url
  }

  return (
    <button onClick={handleClick} className="googleButton">
      <div>
        <Google />
        <span>Google</span>
      </div>
    </button>
  )
}

export default GoogleButton