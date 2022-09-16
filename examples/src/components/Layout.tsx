import Navbar from "./Navbar"

const Layout = ({ children }: any) => {
  return (
    <>
      <Navbar />
      <section className="hero is-fullheight-with-navbar">
        <div className="hero-body is-justify-content-center">
          {children}
        </div>
      </section>
    </>
  )
}

export default Layout