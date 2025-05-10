"use client"

import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useParams, useNavigate, Link } from "react-router-dom"
import { getBranchById, getBranchStaff, reset } from "../features/branches/branchSlice"
import Layout from "../components/Layout"
import { toast } from "react-toastify"
import { FaArrowLeft, FaPlus, FaUser } from "react-icons/fa"
import Spinner from "../components/Spinner"

function BranchStaff() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { branch, branchStaff, isLoading, isError, message } = useSelector((state) => state.branches)

  useEffect(() => {
    dispatch(getBranchById(id))
    dispatch(getBranchStaff(id))

    return () => {
      dispatch(reset())
    }
  }, [dispatch, id])

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }
  }, [isError, message])

  if (isLoading || !branch) {
    return <Spinner />
  }

  return (
    <Layout>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">{branch.name} - Staff</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate("/branches")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md flex items-center"
            >
              <FaArrowLeft className="mr-2" /> Back to Branches
            </button>
            <Link
              to={`/users/new?branchId=${id}`}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
            >
              <FaPlus className="mr-2" /> Add Staff
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-indigo-50 border-b">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <FaUser className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">{branch.name}</h2>
                <p className="text-sm text-gray-500">
                  {branch.address} | {branch.email} | {branch.phone}
                </p>
              </div>
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {branchStaff.length > 0 ? (
                  branchStaff.map((staff) => (
                    <tr key={staff.user_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <FaUser className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{staff.full_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{staff.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${staff.role_name === "Admin" ? "bg-red-100 text-red-800" : ""}
                          ${staff.role_name === "Branch Manager" ? "bg-blue-100 text-blue-800" : ""}
                          ${staff.role_name === "Counselor" ? "bg-green-100 text-green-800" : ""}
                        `}
                        >
                          {staff.role_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/users/${staff.user_id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      No staff found for this branch
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default BranchStaff
