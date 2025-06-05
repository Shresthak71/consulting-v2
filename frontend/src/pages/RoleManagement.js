"use client"

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { getUsers, getRoles, updateUserRole, reset } from "../features/users/userSlice"
//import Layout from "../components/Layout"
import { toast } from "react-toastify"
import { FaUserShield, FaSearch, FaSave } from "react-icons/fa"
import Spinner from "../components/Spinner"
import Modal from "../components/Modal"

function RoleManagement() {
  const dispatch = useDispatch()
  const { users, roles, isLoading, isError, isSuccess, message } = useSelector((state) => state.users)
  const { user: currentUser } = useSelector((state) => state.auth)

  const [searchTerm, setSearchTerm] = useState("")
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedRole, setSelectedRole] = useState("")

  // Check if current user is super admin (role_id === 1)
  const isSuperAdmin = currentUser?.role?.id === 1

  useEffect(() => {
    // Only super admins can access this page
    if (!isSuperAdmin) {
      toast.error("You do not have permission to access this page")
      return
    }

    dispatch(getUsers())
    dispatch(getRoles())

    return () => {
      dispatch(reset())
    }
  }, [dispatch, isSuperAdmin])

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }

    if (isSuccess && message) {
      toast.success(message)
    }
  }, [isError, isSuccess, message])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const openRoleModal = (user) => {
    setSelectedUser(user)
    setSelectedRole(user.role?.id || "")
    setShowRoleModal(true)
  }

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value)
  }

  const handleRoleSubmit = () => {
    if (!selectedRole) {
      toast.error("Please select a role")
      return
    }

    dispatch(
      updateUserRole({
        userId: selectedUser.user_id,
        roleData: { roleId: selectedRole },
      }),
    )
      .unwrap()
      .then(() => {
        toast.success(`Role updated for ${selectedUser.full_name}`)
        setShowRoleModal(false)
      })
      .catch((error) => {
        toast.error(error)
      })
  }

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.role && user.role.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.branch && user.branch.name && user.branch.name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  if (isLoading) {
    return <Spinner />
  }

  if (!isSuperAdmin) {
    return (
      <>
        <div className="container mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Access Denied!</strong>
            <span className="block sm:inline"> You do not have permission to access this page.</span>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Role Management</h1>
          <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
            Super Admin Access
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.user_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <FaUserShield
                              className={`h-5 w-5 ${user.role?.id === 1 ? "text-red-600" : "text-indigo-600"}`}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${user.role?.id === 1 ? "bg-red-100 text-red-800" : ""}
                          ${user.role?.id === 2 ? "bg-blue-100 text-blue-800" : ""}
                          ${user.role?.id === 3 ? "bg-green-100 text-green-800" : ""}
                        `}
                        >
                          {user.role?.name || "No Role"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.branch?.name || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openRoleModal(user)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md"
                        >
                          Change Role
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Role Change Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Change User Role"
        footer={
          <>
            <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setShowRoleModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleRoleSubmit}
            >
              <FaSave className="mr-2" /> Save Changes
            </button>
          </>
        }
      >
        {selectedUser && (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Change role for <span className="font-medium">{selectedUser.full_name}</span>
            </p>

            <div className="mb-4">
              <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-1">
                Select Role <span className="text-red-500">*</span>
              </label>
              <select
                id="roleId"
                name="roleId"
                value={selectedRole}
                onChange={handleRoleChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </div>

            {selectedRole === "1" && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Warning:</strong> You are about to grant Super Admin privileges. This role has full access
                      to all system features.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}

export default RoleManagement
