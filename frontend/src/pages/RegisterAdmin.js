
import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
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
    roleId: "", // Default empty role to force selection
    branchId: "", // Default empty branch to force selection
  })
  const [submitted, setSubmitted] = useState(false)
  const { fullName, email, password, confirmPassword, roleId, branchId } = formData

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth)
  const { branches, isLoading: branchesLoading } = useSelector((state) => state.branches)
  const { roles, isLoading: rolesLoading } = useSelector((state) => state.users)

  // 🔄 Clear previous auth state when component mounts

  useEffect(() => {
    dispatch(reset())
  }, [dispatch])

  // 📥 Load branches and roles
  
  useEffect(() => {
    // this component is redirecting to login page.
    dispatch(getBranches())
    dispatch(getRoles())
  }, [dispatch])
  
//test component load

/*
return (
  <div>
    <h1>Hello, !</h1>
    <p>Welcome to our React app.</p>
  </div>
);
*/

  // ✅ Handle success/failure feedback
  

  useEffect(() => {
    if (!submitted) return
    if (isError) {
      toast.error(message)
    }

    if (isSuccess) {
      toast.success("Administrator account created successfully! Please log in.")
      navigate("/login")
    }

    return () => {
      dispatch(reset())
    }
  }, [isError, isSuccess, message,navigate, dispatch,submitted])
  
  
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

    if (!roleId) {
      toast.error("Please select a role")
      return
    }

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
      isAdminCreating: true,
    }
    setSubmitted(true)
    dispatch(register(userData))
  }

  if (isLoading || branchesLoading || rolesLoading) {
    return <Spinner />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Register Administrator</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create an admin account to manage the Education Consulting System.
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
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={onChange}
              />
            </div>
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
                  roles.map((role) => (
                    <option key={role.role_id} value={role.role_id}>
                      {role.role_name}
                    </option>
                  ))}
              </select>
            </div>
            {roleId !== "1" && (
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
            )}
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
  
}

export default Register
