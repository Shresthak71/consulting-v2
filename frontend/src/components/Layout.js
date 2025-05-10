"use client"

import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { logout } from "../features/auth/authSlice"
import {
  FaHome,
  FaUsers,
  FaFileAlt,
  FaClipboardList,
  FaBuilding,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserCog,
  FaUserShield,
} from "react-icons/fa"

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const onLogout = () => {
    dispatch(logout())
    navigate("/login")
  }

  const isAdmin = user?.role?.id === 1
  const isBranchManager = user?.role?.id === 2
  const isCounselor = user?.role?.id === 3
  const isSuperAdmin = user?.role?.id === 1

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 transition duration-300 transform lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center">
            <span className="text-white text-2xl mx-2 font-semibold">EduConsult</span>
          </div>
        </div>

        <nav className="mt-10">
          <Link
            to="/dashboard"
            className={`flex items-center px-6 py-2 mt-4 ${
              location.pathname === "/dashboard"
                ? "text-gray-100 bg-gray-700"
                : "text-gray-500 hover:bg-gray-700 hover:text-gray-100"
            }`}
          >
            <FaHome className="w-5 h-5" />
            <span className="mx-3">Dashboard</span>
          </Link>

          <Link
            to="/students"
            className={`flex items-center px-6 py-2 mt-4 ${
              location.pathname.startsWith("/students")
                ? "text-gray-100 bg-gray-700"
                : "text-gray-500 hover:bg-gray-700 hover:text-gray-100"
            }`}
          >
            <FaUsers className="w-5 h-5" />
            <span className="mx-3">Students</span>
          </Link>

          <Link
            to="/applications"
            className={`flex items-center px-6 py-2 mt-4 ${
              location.pathname.startsWith("/applications")
                ? "text-gray-100 bg-gray-700"
                : "text-gray-500 hover:bg-gray-700 hover:text-gray-100"
            }`}
          >
            <FaFileAlt className="w-5 h-5" />
            <span className="mx-3">Applications</span>
          </Link>

          <Link
            to="/documents"
            className={`flex items-center px-6 py-2 mt-4 ${
              location.pathname.startsWith("/documents")
                ? "text-gray-100 bg-gray-700"
                : "text-gray-500 hover:bg-gray-700 hover:text-gray-100"
            }`}
          >
            <FaClipboardList className="w-5 h-5" />
            <span className="mx-3">Documents</span>
          </Link>

          {(isAdmin || isBranchManager) && (
            <Link
              to="/branches"
              className={`flex items-center px-6 py-2 mt-4 ${
                location.pathname.startsWith("/branches")
                  ? "text-gray-100 bg-gray-700"
                  : "text-gray-500 hover:bg-gray-700 hover:text-gray-100"
              }`}
            >
              <FaBuilding className="w-5 h-5" />
              <span className="mx-3">Branches</span>
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/users"
              className={`flex items-center px-6 py-2 mt-4 ${
                location.pathname.startsWith("/users")
                  ? "text-gray-100 bg-gray-700"
                  : "text-gray-500 hover:bg-gray-700 hover:text-gray-100"
              }`}
            >
              <FaUserCog className="w-5 h-5" />
              <span className="mx-3">Users</span>
            </Link>
          )}

          {/* Super Admin Only - Role Management */}
          {isSuperAdmin && (
            <Link
              to="/roles"
              className={`flex items-center px-6 py-2 mt-4 ${
                location.pathname.startsWith("/roles")
                  ? "text-gray-100 bg-gray-700"
                  : "text-gray-500 hover:bg-gray-700 hover:text-gray-100"
              }`}
            >
              <FaUserShield className="w-5 h-5" />
              <span className="mx-3">Role Management</span>
            </Link>
          )}
        </nav>

        <div className="absolute bottom-0 w-full">
          <button
            onClick={onLogout}
            className="flex items-center px-6 py-2 mt-4 text-gray-500 hover:bg-gray-700 hover:text-gray-100 w-full"
          >
            <FaSignOutAlt className="w-5 h-5" />
            <span className="mx-3">Logout</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <button onClick={toggleSidebar} className="text-gray-500 focus:outline-none lg:hidden">
              {sidebarOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
            </button>

            <div className="flex items-center">
              <div className="relative">
                <div className="flex items-center space-x-4">
                  <div className="font-medium text-gray-700">
                    {user?.name} | {user?.role?.name}
                  </div>
                  {user?.branch?.name && (
                    <div className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{user.branch.name}</div>
                  )}
                  {isSuperAdmin && (
                    <div className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Super Admin</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default Layout
