import { createContext, ReactNode, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { StateType } from "../types/types"
import { getStatesReq } from "../api/states"

export const StateContext = createContext<{
  states: StateType[] | null
  setStates: (states: StateType[] | null) => void
} | null>(null)

function StateProvider({ children }: { children: ReactNode }) {
  const { shell_id = "" } = useParams()
  const [states, setStates] = useState<StateType[] | null>(null)

  useEffect(() => {
    // fetch the states
    const getStates = async () => {
      if (shell_id) {
        try {
          const response = await getStatesReq(shell_id)
          if (response.status === 200) {
            setStates(response.data)
          } else {
            console.error("Failed to fetch states", response.data)
          }
        } catch (err) {
          console.error("Failed to fetch states", err)
        }
      }
    }
    getStates()
  }, [shell_id])

  return (
    <StateContext.Provider value={{ states, setStates }}>
      {children}
    </StateContext.Provider>
  )
}

export default StateProvider
