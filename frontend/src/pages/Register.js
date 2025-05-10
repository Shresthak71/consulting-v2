"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate, Link } from "react-router-dom"
import { register, reset } from "../features/auth/authSlice"
import { getBranches } from "../features/branches/branchSlice"
import { getRoles } from "../features/users/userSlice"
import { toast } from "react-toastify"
import Spinner from "../components/Spinner"

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    roleId: "3", // Default to Counselor role
    branchId: "1",//for super admin user.
  })

  const { fullName, email, password, confirmPassword, roleId, branchId } = formData

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth)
  const { branches, isLoading: branchesLoading } = useSelector((state) => state.branches)
  const { roles, isLoading: rolesLoading } = useSelector((state) => state.users)

  // Check if current user is super admin
  const isSuperAdmin = user && user.role && user.role.id === 1
  const isLoggedIn = !!user

  useEffect(() => {
    dispatch(getBranches())

    // Only fetch roles if user is logged in and is admin
    if (isLoggedIn && isSuperAdmin) {
      dispatch(getRoles())
    }
  }, [dispatch, isLoggedIn, isSuperAdmin])

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }

    if (isSuccess && !isLoggedIn) {
      toast.success("Registration successful! Please log in.")
      navigate("/login")
    } else if (isSuccess && isLoggedIn) {
      toast.success("User created successfully!")
      navigate("/users")
    }

    return () => {
      dispatch(reset())
    }
  }, [isError, isSuccess, message, navigate, dispatch, isLoggedIn])

  // IMPORTANT: Remove this effect that was causing the redirect
  // useEffect(() => {
  //   if (isLoggedIn && !isSuperAdmin) {
  //     navigate("/dashboard")
  //   }
  // }, [isLoggedIn, isSuperAdmin, navigate])

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  const onSubmit = (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    // For public registration, only allow counselor role
    if (!isLoggedIn) {
      const userData = {
        fullName,
        email,
        password,
        roleId: 3, // Counselor role
        branchId: branchId ? Number.parseInt(branchId) : null,
      }

      if (!branchId) {
        toast.error("Please select a branch")
        return
      }

      dispatch(register(userData))
    } else {
      // Admin registration flow
      if (!roleId) {
        toast.error("Please select a role")
        return
      }

      // If role is super admin, check if current user is super admin
      if (Number.parseInt(roleId) === 1 && !isSuperAdmin) {
        toast.error("You don't have permission to create a super admin account")
        return
      }

      // Validate branch selection for non-admin roles
      if (Number.parseInt(roleId) !== 1 && !branchId) {
        toast.error("Please select a branch")
        return
      }

      const userData = {
        fullName,
        email,
        password,
        roleId: Number.parseInt(roleId),
        branchId: branchId ? Number.parseInt(branchId) : null,
        isAdminCreating: true, // Add this flag
      }

      dispatch(register(userData))
    }
  }

  if (isLoading || branchesLoading || (isLoggedIn && isSuperAdmin && rolesLoading)) {
    return <Spinner />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLoggedIn && isSuperAdmin ? "Create New User" : "Create your account"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLoggedIn && isSuperAdmin
              ? "Register a new user for the Education Consulting System"
              : "Register to access the Education Consulting System"}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Full Name"
                value={fullName}
                onChange={onChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={onChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={onChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={onChange}
              />
            </div>

            {/* Role Selection - Only for admin users */}
            {isLoggedIn && isSuperAdmin && (
              <div>
                <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="roleId"
                  name="roleId"
                  value={roleId}
                  onChange={onChange}
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select a role</option>
                  {roles &&
                    roles.map(
                      (role) =>
                        // Only show super admin option if current user is super admin
                        (role.role_id !== 1 || isSuperAdmin) && (
                          <option key={role.role_id} value={role.role_id}>
                            {role.role_name}
                          </option>
                        ),
                    )}
                </select>
              </div>
            )}

            {/* Branch Selection - Always show for public registration */}
            <div>
              <label htmlFor="branchId" className="block text-sm font-medium text-gray-700">
                Branch
              </label>
              <select
                id="branchId"
                name="branchId"
                value={branchId}
                onChange={onChange}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Select a branch</option>
                {branches &&
                  branches.map((branch) => (
                    <option key={branch.branch_id} value={branch.branch_id}>
                      {branch.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Register"}
            </button>
          </div>
    
          {/*
          !isLoggedIn && (
            <div className="text-sm text-center">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Sign in
                </Link>
              </p>
            </div>
          )
            */
            }
          
        </form>
      </div>
    </div>
  )
}

export default Register
