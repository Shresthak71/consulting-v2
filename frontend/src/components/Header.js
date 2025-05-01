"use client"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { logout } from "../features/auth/authSlice"
import NotificationDropdown from "./NotificationDropdown"

const Header = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate("/login")
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">EduConsult</h1>
            </div>
          </div>
          <div className="flex items-center">
            <NotificationDropdown />
            <div className="ml-3 relative">
              <div className="flex items-center">
                <span className="mr-2 text-sm font-medium text-gray-700">{user?.fullName}</span>
                <span className="mr-4 px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">{user?.role}</span>
                {user?.branchName && (
                  <span className="mr-4 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    {user.branchName}
                  </span>
                )}
                <button onClick={handleLogout} className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
