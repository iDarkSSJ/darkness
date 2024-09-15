import { Nostalgist } from "nostalgist"
import React, { createContext, useRef } from "react"

export const GameContext = createContext<{
  gameInstance: React.MutableRefObject<Nostalgist | null>
} | null>(null)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const gameInstance = useRef<Nostalgist | null>(null)
  return (
    <GameContext.Provider value={{ gameInstance }}>
      {children}
    </GameContext.Provider>
  )
}
