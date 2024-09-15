import { useEffect, useState } from "react"
import ShellCard from "../components/ShellCard"
import { useAuth } from "../context/useAuth"
import { ShellType } from "../types/types"
import { getShellsRequest } from "../api/shells"

function ShellsPage() {
  const [shells, setShells] = useState<ShellType[] | null>(null)
  const { profile } = useAuth()

  useEffect(() => {
    const getShells = async () => {
      if (profile) {
        const response = await getShellsRequest()
        if (response.status === 200) {
          setShells(response.data)
        } else {
          console.error("Failed to fetch sessions")
        }
      }
    }
    getShells()
  }, [profile])

  return (
    <main className="shellMain">
      <div>
        <h2>Shells</h2>
        <div className="shellsContainer">
          {shells && shells.length > 0 ? (
            shells.map((shell) => (
              <ShellCard key={shell.shell_id} shell={shell} />
            ))
          ) : (
            <p>Does not exist shells yet.</p>
          )}
        </div>
      </div>
    </main>
  )
}

export default ShellsPage
