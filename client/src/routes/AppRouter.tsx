import { Navigate, Outlet, Route, Routes } from "react-router-dom"
import Login from "../pages/LoginPage"
import Register from "../pages/RegisterPage"
import ProtectedRoutes from "../components/ProtectedRoutes"
import ProfilePage from "../pages/ProfilePage"
import NavBar from "../components/NavBar"
import ShellsPage from "../pages/ShellsPage"
import CreateShellPage from "../pages/CreateShellPage"
import SingleShellPage from "../pages/SingleShellPage"
import OldApp from "../OldApp"
import GoogleVerify from "../components/GoogleVerify"

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/old" element={<OldApp />} />
      <Route path="/google/auth/:tempId" element={<GoogleVerify />} />

      <Route element={<ProtectedRoutes />}>
        <Route
          element={
            <>
              <NavBar />
              <Outlet />
            </>
          }>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/shells" element={<ShellsPage />} />
          <Route path="/shells/new" element={<CreateShellPage />} />
          <Route path="/shells/:shell_id" element={<SingleShellPage />} />
        </Route>
        <Route path="*" element={<Navigate to={"/login"} />} />
      </Route>
    </Routes>
  )
}

export default AppRouter
