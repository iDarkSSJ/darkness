import { useForm } from "react-hook-form"
import GoogleButton from "../components/GoogleButton"
import { useAuth } from "../context/useAuth"
import { GoogleAction, RegisterUserType } from "../types/types.d"
import { Link } from "react-router-dom"
import { useEffect } from "react"
import { useQuery } from "../utils/utils"

function Register() {
  const query = useQuery()
  const errorMessage = query.get("error")
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterUserType>()

  const { signUp, errors: apiErrors, isAuth } = useAuth()

  const handleOnSubmit = handleSubmit(async (data) => {
    signUp(data)
  })

  useEffect(() => {
    if (isAuth) {
      window.location.href = "/"
    }
  }, [isAuth])

  return (
    <div className="login">
      <div className="loginCard">
        <h1>Create an account</h1>
        <form onSubmit={handleOnSubmit}>
          <div>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="user321"
              {...register("user_name", {
                required: true,
                minLength: 3,
                maxLength: 15,
              })}
            />
            {errors.user_name && (
              <span className="error">
                Username must be between 3 and 15 characters.
              </span>
            )}
            <label htmlFor="email">Email</label>
            <input
              type="text"
              id="email"
              placeholder="your@email.com"
              {...register("user_email", {
                required: true,
                pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              })}
            />
            {errors.user_email && (
              <span className="error">Insert a valid Email</span>
            )}
            <label htmlFor="user_password">Password</label>
            <input
              type="password"
              id="user_password"
              placeholder="Password"
              autoComplete="current_password"
              {...register("user_password", {
                required: true,
                minLength: 6,
                maxLength: 30,
              })}
            />
            {errors.user_password && (
              <span className="error">
                Password must be between 6 and 30 characters.
              </span>
            )}
          </div>
          {apiErrors && <span className="error">{apiErrors}</span>}
          {errorMessage && (
            <span className="error">{decodeURIComponent(errorMessage)}</span>
          )}
          <button type="submit">Create Account</button>
        </form>
        <div className="or">
          <span>or</span>
        </div>
        <GoogleButton action={GoogleAction.REGISTER} />
        <div>
          <p>
            Already have an account? <Link to={"/login"}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
