import { useContext } from "react"
import { StateContext } from "./StateContext"

export const useStates = () => {
  const context = useContext(StateContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
