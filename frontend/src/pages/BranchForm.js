"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { createBranch, getBranchById, updateBranch, reset, clearBranch } from "../features/branches/branchSlice"
import Layout from "../components/Layout"
import { toast } from "react-toastify"
import { FaSave, FaArrowLeft } from "react-icons/fa"
import Spinner from "../components/Spinner"

function BranchForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { branch, isLoading, isError, isSuccess, message } = useSelector((state) => state.branches)

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  })

  const { name, address, phone, email } = formData

  const isEditMode = !!id

  useEffect(() => {
    if (isEditMode) {
      dispatch(getBranchById(id))
    } else {
      dispatch(clearBranch())
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
      toast.success("Branch added successfully")
      navigate("/branches")
    }
  }, [isError, isSuccess, message, navigate, isLoading, isEditMode])

  useEffect(() => {
    if (branch && isEditMode) {
      setFormData({
        name: branch.name || "",
        address: branch.address || "",
        phone: branch.phone || "",
        email: branch.email || "",
      })
    }
  }, [branch, isEditMode])

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  const onSubmit = (e) => {
    e.preventDefault()

    if (!name) {
      toast.error("Please enter a branch name")
      return
    }

    const branchData = {
      name,
      address,
      phone,
      email,
    }

    if (isEditMode) {
      dispatch(updateBranch({ id, branchData }))
        .unwrap()
        .then(() => {
          toast.success("Branch updated successfully")
          navigate("/branches")
        })
        .catch((error) => {
          toast.error(error)
        })
    } else {
      dispatch(createBranch(branchData))
    }
  }

  if (isLoading && isEditMode) {
    return <Spinner />
  }

  return (
    <Layout>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">{isEditMode ? "Edit Branch" : "Add Branch"}</h1>
          <button
            onClick={() => navigate("/branches")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Back to Branches
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <form onSubmit={onSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
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

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={address}
                  onChange={onChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                disabled={isLoading}
              >
                <FaSave className="mr-2" />
                {isLoading ? "Saving..." : "Save Branch"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export default BranchForm
