import { Navigate, Outlet } from "react-router-dom"
import { useSelector } from "react-redux"
import Layout from "./Layout"

const PrivateRoute = () => {
  const { user } = useSelector((state) => state.auth)

  if (!user) {
    return <Navigate to="/login" />
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default PrivateRoute
