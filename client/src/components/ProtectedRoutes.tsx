import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import Loader from "./icons/Loader"
import { GameProvider } from "../context/GameContext"

function ProtectedRoutes() {
  const { isLoading, isAuth } = useAuth()

  if (isLoading) return <Loader />
  if (!isAuth) return <Navigate to="/login" />

  return (
    <GameProvider>
      <Outlet />
    </GameProvider>
  )
}

export default ProtectedRoutes