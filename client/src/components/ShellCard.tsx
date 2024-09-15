import { useNavigate } from "react-router-dom"
import { ShellType } from "../types/types"

function ShellCard({ shell }: { shell: ShellType }) {
  const navigate = useNavigate()
  const handleOnclick = () => {
    navigate(`/shells/${shell.shell_id}`)
  }

  return (
    <div className="shellCard">
      <button onClick={handleOnclick}>
        <div className="shellCover">
          <img
            src={
              shell.shell_cover_url
                ? shell.shell_cover_url
                : "https://res.cloudinary.com/drlxsagkx/image/upload/v1724365507/ecypqoosds6ojy1oymol.png"
            }
            alt="Shell image"
          />
        </div>
        <div className="shellInfo">
          <h2>{shell.shell_name}</h2>
          <p>{shell.shell_core}</p>
        </div>
      </button>
    </div>
  )
}

export default ShellCard
