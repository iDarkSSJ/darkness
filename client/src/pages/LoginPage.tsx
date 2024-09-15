import { useForm } from "react-hook-form"
import GoogleButton from "../components/GoogleButton"
import { useAuth } from "../context/useAuth"
import { GoogleAction, LoginUserType } from "../types/types.d"
import { Link, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useQuery } from "../utils/utils"

function Login() {
  const query = useQuery()
  const navigate = useNavigate()
  const errorMessage = query.get("error")
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginUserType>()
  const { logIn, errors: apiErrors, isAuth } = useAuth()

  const handleOnSubmit = handleSubmit(async (data) => {
    logIn(data)
  })

  useEffect(() => {
    if (isAuth) {
      navigate("/shells")
    }
  }, [isAuth, navigate])

  return (
    <div className="login">
      <div className="loginCard">
        <h1>Sign In to Darknes</h1>
        <form onSubmit={handleOnSubmit}>
          <div>
            <label htmlFor="user">Email or Username</label>
            <input
              type="text"
              id="user"
              placeholder="your@email.com or user321"
              {...register("user", {
                required: true,
                minLength: 3,
                maxLength: 15,
              })}
            />
            {errors.user && (
              <span className="error">This field is required</span>
            )}
            <label htmlFor="user_password">Password</label>
            <input
              type="password"
              id="user_password"
              placeholder="Password"
              autoComplete="current_password"
              {...register("user_password", {
                required: true,
                maxLength: 30,
                minLength: 6,
              })}
            />
            {errors.user_password && (
              <span className="error">Insert a valid password</span>
            )}
          </div>
          {apiErrors && <span className="error">{apiErrors}</span>}
          {errorMessage && (
            <span className="error">{decodeURIComponent(errorMessage)}</span>
          )}
          <button type="submit">Sign In</button>
        </form>
        <div className="or">
          <span>or</span>
        </div>
        <GoogleButton action={GoogleAction.LOGIN} />
        <div>
          <p>
            Don't have an account? <Link to={"/register"}>Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
