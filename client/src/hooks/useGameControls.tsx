import { Nostalgist } from "nostalgist"
import { useCallback, useEffect, useRef, useState } from "react"
import { ShellType, StateFunctionType, StateType } from "../types/types.d"
import { unZipFile } from "../utils/utils"
import { autoSaveReq, getAutoSave } from "../api/states"
import { useLocation, useParams } from "react-router-dom"

const useGameControls = (
  gameInstance: React.MutableRefObject<Nostalgist | null>,
  shell: ShellType | null
) => {
  const [stateFunction, setStateFunction] = useState<StateFunctionType>()
  const [OnModalState, setOnModalState] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const { shell_id = "" } = useParams()
  const location = useLocation()
  const [autoSaveLoad, setAutoSaveLoad] = useState(0)
  const [autoSaveTime, setAutoSaveTime] = useState<number>(0)

  const autosave = useCallback(async () => {
    if (gameInstance.current) {
      try {
        if (shell_id) {
          const { state } = await gameInstance.current.saveState()
          setAutoSaveLoad(1)
          const response = await autoSaveReq(shell_id, state)
          if (response.status === 200) {
            setAutoSaveLoad(0)
            setAutoSaveTime(180)
          } else {
            setAutoSaveLoad(2)
            setAutoSaveTime(45)
          }
        }
      } catch (error) {
        console.error("Error autosaving state: ", error)
      }
    }
  }, [shell_id, gameInstance])

  useEffect(() => {
    let timerId: ReturnType<typeof setInterval> | undefined
    if (gameInstance.current && isPlaying && !isPaused) {
      timerId = setInterval(() => {
        setAutoSaveTime((prevTime) => {
          if (prevTime <= 0) {
            autosave()
            return 180
          }
          return prevTime - 1
        })
      }, 1000)
    } else {
      if (timerId) {
        clearInterval(timerId)
      }
    }
    return () => {
      if (timerId) {
        clearInterval(timerId)
      }
    }
  }, [isPlaying, isPaused, autosave, gameInstance, autoSaveTime])

  // Pause when the user changes the window
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && gameInstance.current && !isPaused) {
        gameInstance.current.pause()
        setIsPaused(true)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isPaused, gameInstance])

  // Handle unload (exit game)
  useEffect(() => {
    const handleUnload = (event: BeforeUnloadEvent) => {
      if (gameInstance.current) {
        setIsPaused(false)
        event.preventDefault()
      }
    }

    window.addEventListener("beforeunload", handleUnload)

    return () => {
      window.removeEventListener("beforeunload", handleUnload)
    }
  }, [gameInstance])

  useEffect(() => {
    return () => {
      if (gameInstance.current) {
        window.location.reload()
      }
    }
  }, [location, gameInstance])

  // loadGame
  useEffect(() => {
    const loadGame = async () => {
      const canvas = canvasRef.current
      const gameRom = shell?.shell_rom_url
      const core = shell?.shell_core
      if (canvas && isPlaying && core && gameRom) {
        try {
          // Check if exist a autosave state
          let blob
          const autoStateRes = await getAutoSave(shell_id)
          if (autoStateRes.status === 200) {
            const state: StateType = autoStateRes.data
            const response = await fetch(state.state_url)
            blob = await response.blob()
          }
          const romData = await unZipFile(gameRom)
          const gameProvider = await Nostalgist.launch({
            element: canvas,
            rom: romData,
            core: core,
            state: blob ? blob : undefined,
          })
          gameInstance.current = gameProvider

          setAutoSaveTime(180)
        } catch (err) {
          console.error("Error during game loading: ", err)
          setIsPlaying(false)
        }
      }
    }

    if (isPlaying) {
      loadGame()
    }
  }, [isPlaying, shell, gameInstance, autosave, shell_id])

  const handleOnPlay = () => {
    if (shell) {
      setIsPlaying(true)
    }
  }

  const handleOnPause = () => {
    if (gameInstance.current) {
      if (isPaused) {
        gameInstance.current.resume()
        setIsPaused(false)
      } else {
        gameInstance.current.pause()
        setIsPaused(true)
      }
    }
  }

  const handleOnSave = async () => {
    if (gameInstance.current) {
      if (!isPaused) {
        gameInstance.current.pause()
        setIsPaused(true)
      }
      setStateFunction(StateFunctionType.SAVE)
      setOnModalState(true)
    }
  }

  const handleOnLoad = async () => {
    if (gameInstance.current) {
      if (!isPaused) {
        gameInstance.current.pause()
        setIsPaused(true)
      }
      setStateFunction(StateFunctionType.LOAD)
      setOnModalState(true)
    }
  }

  const handleOnScreenshot = async () => {
    if (gameInstance.current) {
      if (!isPaused) {
        gameInstance.current.pause()
        setIsPaused(true)
      }
      const blob = await gameInstance.current.screenshot()

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${crypto.randomUUID()}.jpg`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)
    }
  }

  return {
    isPaused,
    isPlaying,
    OnModalState,
    stateFunction,
    canvasRef,
    autoSaveLoad,
    autoSaveTime,
    setIsPaused,
    handleOnPlay,
    handleOnPause,
    handleOnSave,
    handleOnLoad,
    handleOnScreenshot,
    setStateFunction,
    setOnModalState,
  }
}

export default useGameControls
