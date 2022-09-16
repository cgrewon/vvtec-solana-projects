import Link from "next/link"

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-brand">
          <Link href={"/"}>
            <a className="navbar-item">
              <b>Vvtec Network</b>
            </a>
          </Link>
        </div>
        <div className="navbar-menu">
          <div className="navbar-start">
            <Link href={"/"}>
              <a className="navbar-item">
                EVM
              </a>
            </Link>
            <Link href={"/solana"}>
              <a className="navbar-item">
                Solana
              </a>
            </Link>
            <Link href={"/near"}>
              <a className="navbar-item">
                NEAR
              </a>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar