"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { createUser, getUserById, updateUser, getRoles, reset, clearUser } from "../features/users/userSlice"
import { getBranches } from "../features/branches/branchSlice"
//import Layout from "../components/Layout"
import { toast } from "react-toastify"
import { FaSave, FaArrowLeft } from "react-icons/fa"
import Spinner from "../components/Spinner"

function UserForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { branches } = useSelector((state) => state.branches)
  const { user, roles, isLoading, isError, isSuccess, message } = useSelector((state) => state.users)
  const { user: currentUser } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    roleId: "",
    branchId: "",
  })

  const { fullName, email, password, confirmPassword, roleId, branchId } = formData

  const isEditMode = !!id

  useEffect(() => {
    dispatch(getBranches())
    dispatch(getRoles())

    if (isEditMode) {
      dispatch(getUserById(id))
    } else {
      dispatch(clearUser())
    }

    return () => {
      dispatch(reset())
    }
  }, [dispatch, id, isEditMode])

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }

    if (isSuccess && !isLoading && !isEditMode) {
      toast.success("User added successfully")
      navigate("/users")
    }
  }, [isError, isSuccess, message, navigate, isLoading, isEditMode])

  useEffect(() => {
    if (user && isEditMode) {
      setFormData({
        fullName: user.full_name || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
        roleId: user.role?.id || "",
        branchId: user.branch?.id || "",
      })
    }
  }, [user, isEditMode])

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  const onSubmit = (e) => {
    e.preventDefault()

    if (!fullName || !email) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!isEditMode && (!password || password.length < 6)) {
      toast.error("Password must be at least 6 characters")
      return
    }

    if (!isEditMode && password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    const userData = {
      fullName,
      email,
      roleId: Number(roleId),
      branchId: Number(branchId),
    }

    if (!isEditMode) {
      userData.password = password
    }

    if (isEditMode) {
      dispatch(updateUser({ id, userData }))
        .unwrap()
        .then(() => {
          toast.success("User updated successfully")
          navigate("/users")
        })
        .catch((error) => {
          toast.error(error)
        })
    } else {
      dispatch(createUser(userData))
    }
  }

  if (isLoading && isEditMode) {
    return <Spinner />
  }

  return (
    <>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">{isEditMode ? "Edit User" : "Add User"}</h1>
          <button
            onClick={() => navigate("/users")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Back to Users
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <form onSubmit={onSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={fullName}
                  onChange={onChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              {!isEditMode && (
                <>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={password}
                      onChange={onChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required={!isEditMode}
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={onChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required={!isEditMode}
                      minLength={6}
                    />
                  </div>
                </>
              )}

              <div>
                <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="roleId"
                  name="roleId"
                  value={roleId}
                  onChange={onChange}
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

              <div>
                <label htmlFor="branchId" className="block text-sm font-medium text-gray-700 mb-1">
                  Branch <span className="text-red-500">*</span>
                </label>
                <select
                  id="branchId"
                  name="branchId"
                  value={branchId}
                  onChange={onChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch.branch_id} value={branch.branch_id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                disabled={isLoading}
              >
                <FaSave className="mr-2" />
                {isLoading ? "Saving..." : "Save User"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default UserForm
