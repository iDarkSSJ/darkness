import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import useGame from "../context/useGame"

function NavBar() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const { gameInstance } = useGame()

  const handleClick = (href: string) => () => {
    if (gameInstance.current) {
      gameInstance.current.exit()
    }
    navigate(href)
  }

  const handleOnNavClick = () => {
    if (gameInstance.current) {
      gameInstance.current.exit()
    }
  }

  return (
    <header className="navContainer">
      <nav>
        <ul>
          <div>
            <h1>
              Dark<strong>nes</strong>s
            </h1>
          </div>
          <li>
            <NavLink
              onClick={handleOnNavClick}
              className={({ isActive }) => (isActive ? "active" : "")}
              to={"/shells"}>
              Shells
            </NavLink>
          </li>
          <li>
            <NavLink
              onClick={handleOnNavClick}
              className={({ isActive }) => (isActive ? "active" : "")}
              to={"/inputs"}>
              Inputs
            </NavLink>
          </li>
        </ul>
        <div>
          <div>
            <button onClick={handleClick("/shells/new")}>New</button>
          </div>
          <div>
            <button onClick={handleClick("/profile")}>
              {profile?.user_name}
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default NavBar
