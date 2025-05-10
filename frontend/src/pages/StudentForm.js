"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { createStudent, getStudentById, updateStudent, reset, clearStudent } from "../features/students/studentSlice"
import { getBranches } from "../features/branches/branchSlice"
import { getUsers } from "../features/users/userSlice"
import Layout from "../components/Layout"
import { toast } from "react-toastify"
import { FaSave, FaArrowLeft } from "react-icons/fa"
import Spinner from "../components/Spinner"

function StudentForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { branches } = useSelector((state) => state.branches)
  const { users } = useSelector((state) => state.users)
  const { student, isLoading, isError, isSuccess, message } = useSelector((state) => state.students)
  const { user } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    branchId: user?.branch?.id || "",
    registeredBy: user?.id || "",
  })

  const { fullName, email, phone, branchId, registeredBy } = formData

  const isEditMode = !!id
  const isAdmin = user?.role?.id === 1

  useEffect(() => {
    dispatch(getBranches())

    // Fetch users if admin
    if (isAdmin) {
      dispatch(getUsers())
    }

    if (isEditMode) {
      dispatch(getStudentById(id))
    } else {
      dispatch(clearStudent())
    }

    return () => {
      dispatch(reset())
    }
  }, [dispatch, id, isEditMode, isAdmin])

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }

    if (isSuccess && !isLoading && !isEditMode) {
      toast.success("Student added successfully")
      navigate("/students")
    }
  }, [isError, isSuccess, message, navigate, isLoading, isEditMode])

  useEffect(() => {
    if (student && isEditMode) {
      setFormData({
        fullName: student.full_name || "",
        email: student.email || "",
        phone: student.phone || "",
        branchId: student.branch_id || "",
        registeredBy: student.registered_by || "",
      })
    }
  }, [student, isEditMode])

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  const onSubmit = (e) => {
    e.preventDefault()

    if (!fullName) {
      toast.error("Please enter a name")
      return
    }

    const studentData = {
      fullName,
      email,
      phone,
      branchId: Number(branchId) || user.branch.id,
      registeredBy: Number(registeredBy) || user.id,
    }

    if (isEditMode) {
      dispatch(updateStudent({ id, studentData }))
        .unwrap()
        .then(() => {
          toast.success("Student updated successfully")
          navigate("/students")
        })
        .catch((error) => {
          toast.error(error)
        })
    } else {
      dispatch(createStudent(studentData))
    }
  }

  if (isLoading && isEditMode) {
    return <Spinner />
  }

  return (
    <Layout>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">{isEditMode ? "Edit Student" : "Add Student"}</h1>
          <button
            onClick={() => navigate("/students")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Back to Students
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
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={onChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              {isAdmin && (
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
              )}

              {isAdmin && (
                <div>
                  <label htmlFor="registeredBy" className="block text-sm font-medium text-gray-700 mb-1">
                    Registered By <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="registeredBy"
                    name="registeredBy"
                    value={registeredBy}
                    onChange={onChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="">Select User</option>
                    {users.map((u) => (
                      <option key={u.user_id} value={u.user_id}>
                        {u.full_name} ({u.role?.name})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                disabled={isLoading}
              >
                <FaSave className="mr-2" />
                {isLoading ? "Saving..." : "Save Student"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export default StudentForm
