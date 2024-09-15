import { Nostalgist } from "nostalgist"
import { base64StringToBlob, blobToBase64String } from "blob-util"
import "./App.css"
import React, { useRef, useState, useEffect } from "react"
import {
  ACCEPTED_ROM_EXTENSIONS,
  RomExtension,
  EXTENSION_TO_CORE,
} from "./types/types.d"

function OldApp() {
  const [fullScreen, setFullScreen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [romFile, setRomFile] = useState<File | null>(null)
  const [fileExtension, setFileExtension] = useState<RomExtension | null>(null)
  const [savedState, setSavedState] = useState<Blob | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const nostalgistRef = useRef<Nostalgist | null>(null)

  useEffect(() => {
    const loadGame = async () => {
      if (isPlaying && romFile && canvasRef.current && fileExtension) {
        if (EXTENSION_TO_CORE[fileExtension]) {
          try {
            const nostalgist = await Nostalgist.launch({
              element: canvasRef.current,
              rom: [romFile],
              core: EXTENSION_TO_CORE[fileExtension],
            })
            console.log("nostalgist: ", nostalgist)
            nostalgistRef.current = nostalgist
            console.log("current: ", nostalgistRef.current)
          } catch (error) {
            console.error("Error during nostalgist operation: ", error)
          }
        }
      }
    }

    loadGame()
    const savedLocalState = loadStateFromLocalStorage()
    setSavedState(savedLocalState)
  }, [isPlaying, romFile, fileExtension])

  // ROM file and CORE
  const handleRom = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const ext = file.name.split(".").pop()?.toLowerCase() as RomExtension

    if (!ACCEPTED_ROM_EXTENSIONS.includes(ext)) return

    setRomFile(file)
    setFileExtension(ext)
    setIsPlaying(true)
  }

  // SAVE STATE
  const handleSaveState = async () => {
    if (nostalgistRef.current) {
      try {
        const { state } = await nostalgistRef.current.saveState()
        console.log("State saved: ", state)
        setSavedState(state)
        saveStateToLocalStorage(state)
      } catch (error) {
        console.error("Error at save the state: ", error)
      }
    }
  }

  // LOAD STATE
  const handleLoadState = async () => {
    const localState = loadStateFromLocalStorage()
    if (localState && nostalgistRef.current) {
      try {
        await nostalgistRef.current.loadState(localState)
      } catch (error) {
        console.error("Error al cargar el estado:", error)
      }
    }
  }

  // -------------LOCAL STORAGE----------------

  const saveStateToLocalStorage = (stateBlob: Blob) => {
    blobToBase64String(stateBlob)
      .then((stateBase64) => {
        localStorage.setItem("gameState", stateBase64)
      })
      .catch((err) => {
        console.error("Error converting to base64: ", err)
        localStorage.removeItem("gameState")
      })
  }

  const loadStateFromLocalStorage = () => {
    const base64data = localStorage.getItem("gameState")
    if (!base64data) return null

    try {
      const savedState = base64StringToBlob(base64data)
      return savedState
    } catch (error) {
      console.error("Failed to decode base64 data:", error)
      return null
    }
  }

  return (
    <>
      <h3>DARKNES</h3>
      {!isPlaying && (
        <input
          onChange={handleRom}
          type="file"
          accept=".nes,.snes,.gb,.gba,.gbc,.sfc,.smc"
        />
      )}
      {isPlaying && (
        <>
          <canvas
            id="game"
            ref={canvasRef}
            className={fullScreen ? "fullscreen" : ""}></canvas>
          <div>
            <button onClick={handleSaveState}>Guardar Estado</button>
            <button onClick={handleLoadState} disabled={!savedState}>
              Cargar Estado
            </button>
            <button
              onClick={async () => {
                setFullScreen(true)

                nostalgistRef.current?.resize({
                  width: window.innerWidth,
                  height: window.innerHeight,
                })

                document.documentElement.requestFullscreen()
              }}>
              fullScreen
            </button>
          </div>
        </>
      )}
    </>
  )
}

export default OldApp
