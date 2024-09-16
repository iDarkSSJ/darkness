import { createContext, ReactNode, useEffect, useState } from "react"
import {
  APIError,
  LoginUserType,
  ProfileType,
  RegisterUserType,
} from "../types/types"
import {
  loginRequest,
  profileRequest,
  registerRequest,
  verifyRequest,
} from "../api/auth"

export const AuthContext = createContext<{
  isAuth: boolean
  errors: string | null
  isLoading: boolean
  profile: ProfileType | null
  signUp: (user: RegisterUserType) => Promise<void>
  logIn: (user: LoginUserType) => Promise<void>
  setErrors: React.Dispatch<React.SetStateAction<string | null>>
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>
} | null>(null)

function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuth, setIsAuth] = useState(false)
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [errors, setErrors] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logIn = async (user: LoginUserType) => {
    try {
      const response = await loginRequest(user)
      if (response.status === 200) {
        setIsAuth(true)
        setErrors(null)
        window.location.reload()
      } else {
        setErrors("Login failed")
      }
    } catch (err) {
      const error = err as APIError
      setErrors(error.response?.data?.error ?? "Error")
    }
  }

  const signUp = async (user: RegisterUserType) => {
    try {
      const response = await registerRequest(user)
      if (response.status === 200) {
        setIsAuth(true)
        window.location.reload()
        setErrors(null)
      } else {
        setErrors("Registration failed")
      }
    } catch (err) {
      const error = err as APIError
      setErrors(error.response?.data?.error ?? "Error")
    }
  }

  const getProfile = async () => {
    try {
      const response = await profileRequest()
      if (response.status === 200) {
        setProfile(response.data)
      } else {
        setErrors("Could not fetch profile")
      }
    } catch (err) {
      const error = err as APIError
      setErrors(error.response?.data?.error ?? "Error")
    }
  }

  useEffect(() => {
    const checkLogin = async () => {
      setIsLoading(true)
      try {
        const response = await verifyRequest()
        if (response.status === 200) {
          await getProfile()
          setIsAuth(true)
        } else {
          setIsAuth(false)
        }
      } catch (err) {
        setIsAuth(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkLogin()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isAuth,
        errors,
        isLoading,
        profile,
        setErrors,
        setIsLoading,
        logIn,
        signUp,
        setIsAuth,
      }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
