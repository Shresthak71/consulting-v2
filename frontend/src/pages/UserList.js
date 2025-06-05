"use client"

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Link } from "react-router-dom"
import { getUsers, deleteUser, reset } from "../features/users/userSlice"
import { getBranches } from "../features/branches/branchSlice"
//import Layout from "../components/Layout"
import { toast } from "react-toastify"
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUser } from "react-icons/fa"
import Spinner from "../components/Spinner"
import Modal from "../components/Modal"

function UserList() {
  const dispatch = useDispatch()
  const { users, isLoading, isError, isSuccess, message } = useSelector((state) => state.users)
  const { branches } = useSelector((state) => state.branches)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  useEffect(() => {
    dispatch(getUsers())
    dispatch(getBranches())

    return () => {
      dispatch(reset())
    }
  }, [dispatch])

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }
  }, [isError, message])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const confirmDelete = (user) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const handleDelete = () => {
    dispatch(deleteUser(userToDelete.user_id))
      .unwrap()
      .then(() => {
        toast.success("User deleted successfully")
        setShowDeleteModal(false)
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

  const getBranchName = (branchId) => {
    const branch = branches.find((b) => b.branch_id === branchId)
    return branch ? branch.name : "N/A"
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Users</h1>
          <Link
            to="/users/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
          >
            <FaPlus className="mr-2" /> Add User
          </Link>
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
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
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
                            <FaUser className="h-5 w-5 text-indigo-600" />
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
                          {user.role?.role_name || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.branch?.branch_name || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/users/${user.user_id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() => confirmDelete(user)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        footer={
          <>
            <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={handleDelete}
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-500">
          Are you sure you want to delete {userToDelete?.full_name}? This action cannot be undone.
        </p>
      </Modal>
    </>
  )
}

export default UserList
