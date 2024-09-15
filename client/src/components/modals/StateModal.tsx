import { StateFunctionType } from "../../types/types.d"
import { useParams } from "react-router-dom"
import Loader from "../icons/Loader"
import StateSlot from "../StateSlot"
import { useStates } from "../../context/useStates"
import Xicon from "../icons/X"

function StateModal({
  stateFunction,
  setOnModalState,
}: {
  stateFunction: StateFunctionType | undefined
  setOnModalState: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const { states } = useStates()

  const { shell_id = '' } = useParams()

  const totalSlots = 6
  const slots = Array.from({ length: totalSlots }, (_, index) => index + 1)

  return (
    <section className="stateModalContainer">
      <div className="stateModal">
        <button className="closeModal" onClick={() => setOnModalState(false)}>
          <Xicon />
        </button>
        <h2>Select Slot to Save</h2>
        <div className="statesContainer">
          {states === null ? (
            <Loader />
          ) : (
            <>
              {slots.map((slotN) => {
                const state = states?.find((s) => s.slot_number === slotN)

                return (
                  <StateSlot
                    shellId={shell_id}
                    key={state ? state?.state_id : `empty${slotN}`}
                    stateInfo={state}
                    functionType={stateFunction}
                    slotNumber={slotN}
                    setOnModalState={setOnModalState}
                  />
                )
              })}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default StateModal
