import { StateFunctionType, StateType } from "../types/types.d"
import { createStateReq } from "../api/states"
import { useStates } from "../context/useStates"
import { formatDate } from "../utils/FormatDate"
import { getThumbFromCache, saveThumbToCache } from "../utils/utils"
import { useEffect, useState } from "react"
import Loader from "./icons/Loader"
import useGame from "../context/useGame"

interface PropsType {
  stateInfo: StateType | undefined
  slotNumber: number
  functionType: keyof typeof StateFunctionType | undefined
  shellId: string
  setOnModalState: React.Dispatch<React.SetStateAction<boolean>>
}

function StateSlot({
  slotNumber,
  functionType,
  stateInfo,
  shellId,
  setOnModalState,
}: PropsType) {
  const [isLoading, setIsLoading] = useState(false)
  const { gameInstance } = useGame()

  const { states, setStates } = useStates()
  const [stateImage, setStateImage] = useState<string>("")
  const [localStateInfo, setLocalStateInfo] = useState<StateType | undefined>(
    stateInfo
  )

  const isEmpty = !localStateInfo
  const stateDate = localStateInfo?.saved_at
  const shell_id = localStateInfo ? localStateInfo.shell_id : shellId

  useEffect(() => {
    const getThumb = async () => {
      const blob = await getThumbFromCache(shell_id, slotNumber)
      if (blob) {
        const url = URL.createObjectURL(blob)
        setStateImage(url)
        return
      }
      setStateImage(
        "https://res.cloudinary.com/drlxsagkx/image/upload/v1724365507/ecypqoosds6ojy1oymol.png"
      )
    }
    getThumb()
  }, [shell_id, slotNumber])

  const handleClick = async () => {
    if (functionType === StateFunctionType.SAVE) {
      if (gameInstance.current) {
        try {
          setIsLoading(true)
          const { state, thumbnail } = await gameInstance.current.saveState()
          const response = await createStateReq(shell_id, state, slotNumber)

          if (response.status === 200) {
            const newState = response.data
            if (states) {
              const updatedStates = states.map((s) =>
                s.slot_number === slotNumber ? newState : s
              )

              setStates(updatedStates)
              setLocalStateInfo(newState)

              await saveThumbToCache(shell_id, slotNumber, thumbnail)
              if (thumbnail) {
                const imgUrl = URL.createObjectURL(thumbnail)
                setStateImage(imgUrl)
              }

              setIsLoading(false)
            }
          }
        } catch (err) {
          console.error("Failed to save state", err)
          setIsLoading(false)
        }
      }
    } else if (functionType === StateFunctionType.LOAD) {
      if (gameInstance.current) {
        try {
          if (stateInfo?.state_url) {
            setIsLoading(true)
            const response = await fetch(stateInfo.state_url)
            const blob = await response.blob()
            await gameInstance.current.loadState(blob)
            setIsLoading(false)
            setOnModalState(false)
          }
        } catch (err) {
          setIsLoading(false)
          console.error("Failed to save state", err)
        }
      }
    }
  }

  return (
    <div className="stateSlot">
      {isLoading && <Loader />}
      <button onClick={handleClick} disabled={isLoading}>
        <div className="stateThumb">
          <img
            className="stateImage"
            src={
              !isEmpty
                ? stateImage
                : "https://res.cloudinary.com/drlxsagkx/image/upload/e_grayscale/v1724365507/ecypqoosds6ojy1oymol.png"
            }
            alt={`Slot ${slotNumber}`}
          />
        </div>
        <div className="stateInfo">
          <span>{isEmpty ? "Empty" : formatDate(stateDate)}</span>
          <h3 className="slotNumber">Slot {slotNumber}</h3>
        </div>
      </button>
    </div>
  )
}

export default StateSlot
