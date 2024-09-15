import { useEffect, useState } from "react"
import { formatDate } from "../assets/formatDate.d"
import { useAuth } from "../context/useAuth"
import { SessionType } from "../types/types"
import {
  clearAllSessionsRequest,
  deleteSessionRequest,
  logoutRequest,
  sessionsRequest,
} from "../api/auth"

function ProfilePage() {
  const [sessions, setSessions] = useState<SessionType[] | null>(null)
  const { profile, setIsAuth } = useAuth()

  const handleDeleteSession = async (session_id: string) => {
    try {
      const response = await deleteSessionRequest(session_id)
      if (response.status === 200) {
        console.log("Session deleted successfully")
        setSessions(
          sessions
            ? sessions?.filter((session) => session.session_id !== session_id)
            : sessions
        )
      }
    } catch (err) {
      console.error("Failed to delete session", err)
    }
  }

  const handleClearSessions = async () => {
    try {
      const response = await clearAllSessionsRequest()
      if (response.status === 200) {
        setIsAuth(false)
        window.location.reload()
      }
    } catch (err) {
      console.error("Failed to clear sessions", err)
    }
  }

  const handleLogOut = async () => {
    try {
      const response = await logoutRequest()
      if (response.status === 200) {
        setIsAuth(false)
        window.location.reload()
      }
    } catch (err) {
      console.error("Failed to log out", err)
    }
  }

  useEffect(() => {
    const getSessions = async () => {
      if (profile) {
        const response = await sessionsRequest()
        if (response.status === 200) {
          setSessions(response.data)
        } else {
          console.error("Failed to fetch sessions")
        }
      }
    }
    getSessions()
  }, [profile])

  return (
    <main className="profileMain">
      <div>
        <h1>Account</h1>
        <div className="card">
          <div>
            <h2>Profile</h2>
            <button onClick={handleLogOut}>Log Out</button>
          </div>
          <div>
            <label>Username</label>
            <p>{profile?.user_name}</p>
          </div>
          <div>
            <label>Email</label>
            <p>{profile?.user_email}</p>
          </div>
          <div>
            <label>Joined</label>
            <p>{formatDate(profile?.created_at)}</p>
          </div>
        </div>
        <div className="card">
          <h2>Security</h2>
          <div>
            <label>Password</label>
            <strong>This does not work yet.</strong>
            {profile?.password_pending ? (
              <button>Create Password</button>
            ) : (
              <button>UpdatePassword</button>
            )}
          </div>
        </div>
        <div className="card sessionCard">
          <div>
            <h2>Sessions</h2>
            <button onClick={handleClearSessions}>Clear All Sessions</button>
          </div>
          {sessions && sessions.length > 0 ? (
            <ul className="sessionList">
              {sessions.map((session) => (
                <li key={session.session_id} className="sessionItem">
                  <div className="sessionDetails">
                    <p className="sessionDevice">{session.device}</p>
                    <p className="sessionTime">
                      {formatDate(session.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteSession(session.session_id)}>
                    End Session
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No active sessions.</p>
          )}
        </div>
      </div>
    </main>
  )
}

export default ProfilePage
