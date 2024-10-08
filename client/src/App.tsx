import { BrowserRouter } from "react-router-dom"
import "./App.css"
import AuthProvider from "./context/AuthContext"
import AppRouter from "./routes/AppRouter"

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </>
  )
}

export default App
