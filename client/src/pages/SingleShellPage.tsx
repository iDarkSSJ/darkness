import { useEffect, useState } from "react"
import { useAuth } from "../context/useAuth"
import { getSingleShellRequest } from "../api/shells"
import { useNavigate, useParams } from "react-router-dom"
import { ShellType } from "../types/types.d"
import StateModal from "../components/modals/StateModal"
import StateProvider from "../context/StateContext"
import useGame from "../context/useGame"
import useGameControls from "../hooks/useGameControls"
import { formatCountdown } from "../utils/FormatCountdown"
import {
  Camera,
  CloudDone,
  Delete,
  Edit,
  ErrorIcon,
  Pause,
  Play,
  ProgressLoad,
} from "../components/icons/Icons"

function SingleShellPage() {
  const [shell, setShell] = useState<ShellType | null>(null)
  const { profile } = useAuth()
  const { shell_id = "" } = useParams()
  const { gameInstance } = useGame()
  const navigate = useNavigate()

  const {
    isPaused,
    isPlaying,
    OnModalState,
    stateFunction,
    canvasRef,
    autoSaveLoad,
    autoSaveTime,
    handleOnPlay,
    handleOnPause,
    handleOnSave,
    handleOnLoad,
    handleOnScreenshot,
    setOnModalState,
  } = useGameControls(gameInstance, shell)

  useEffect(() => {
    const getShell = async () => {
      if (profile) {
        try {
          const response = await getSingleShellRequest(shell_id)
          if (response.status === 200) {
            setShell(response.data)
          }
        } catch (err) {
          console.error("Failed to fetch shell", err)
          navigate("/shells")
        }
      }
    }
    getShell()
  }, [profile, navigate, shell_id])

  const handleClick = (href: string) => () => {
    if (gameInstance.current) {
      gameInstance.current.exit()
    }
    navigate(href)
  }

  return (
    <>
      <div className="shellCoverBg">
        <img
          src={
            shell?.shell_cover_url ||
            "https://res.cloudinary.com/drlxsagkx/image/upload/v1724365507/ecypqoosds6ojy1oymol.png"
          }
        />
      </div>
      <div
        className={isPaused ? "pausePop pausePopOn" : "pausePop pausePopOff"}>
        Your Game is Paused
        <div className="gif">
          <img src="https://media.tenor.com/UkvleU1dQK4AAAAi/2d-mario-running.gif" />
        </div>
      </div>
      {gameInstance.current && OnModalState && (
        <StateProvider>
          <StateModal
            stateFunction={stateFunction}
            setOnModalState={setOnModalState}
          />
        </StateProvider>
      )}
      {shell && (
        <main className="singleShellMain">
          <div>
            <div className="shellHeader">
              <h2>{shell?.shell_name}</h2>
              <div>
                {isPlaying && (
                  <div className="autosaveInfo">
                    {formatCountdown(autoSaveTime)}
                    {autoSaveLoad === 0 ? (
                      <CloudDone />
                    ) : autoSaveLoad === 1 ? (
                      <ProgressLoad />
                    ) : (
                      <ErrorIcon />
                    )}
                  </div>
                )}
                {!isPlaying && (
                  <div className="shellOptions">
                    <button onClick={handleClick(`/shells/edit/${shell_id}`)}>
                      <Edit />
                    </button>
                    <button onClick={handleClick(`/shells/remove/${shell_id}`)}>
                      <Delete />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="gameContainer">
              <div className="canvasShell">
                {!isPlaying && (
                  <button onClick={handleOnPlay}>
                    <Play />
                    Play
                  </button>
                )}
                {isPlaying ? (
                  <canvas width={800} ref={canvasRef} className="gameCanvas" />
                ) : null}
              </div>
              {isPlaying && (
                <div className="gameTools">
                  <button
                    className={isPaused ? "playBtn" : "pauseBtn"}
                    onClick={handleOnPause}>
                    {isPaused ? <Play /> : <Pause />}
                  </button>
                  <button onClick={handleOnSave}>Save</button>
                  <button onClick={handleOnLoad}>Load</button>
                  <button
                    onClick={() => {
                      gameInstance.current?.restart()
                    }}>
                    Reset
                  </button>
                  <button onClick={handleOnScreenshot}>
                    <Camera />
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      )}
    </>
  )
}

export default SingleShellPage
