import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import StudentList from "./pages/StudentList"
import StudentForm from "./pages/StudentForm"
import StudentDetail from "./pages/StudentDetail"
import BranchList from "./pages/BranchList"
import BranchForm from "./pages/BranchForm"
import BranchStaff from "./pages/BranchStaff"
import UserList from "./pages/UserList"
import UserForm from "./pages/UserForm"
import RoleManagement from "./pages/RoleManagement"
import PrivateRoute from "./components/PrivateRoute"

function App() {
  return (
    <>
      <Router>
        <div className="container">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Student Routes */}
              <Route path="/students" element={<StudentList />} />
              <Route path="/students/new" element={<StudentForm />} />
              <Route path="/students/:id" element={<StudentDetail />} />
              <Route path="/students/:id/edit" element={<StudentForm />} />

              {/* Branch Routes */}
              <Route path="/branches" element={<BranchList />} />
              <Route path="/branches/new" element={<BranchForm />} />
              <Route path="/branches/:id/edit" element={<BranchForm />} />
              <Route path="/branches/:id/staff" element={<BranchStaff />} />

              {/* User Routes */}
              <Route path="/users" element={<UserList />} />
              <Route path="/users/new" element={<UserForm />} />
              <Route path="/users/:id/edit" element={<UserForm />} />

              {/* Role Management - Super Admin Only */}
              <Route path="/roles" element={<RoleManagement />} />
            </Route>
          </Routes>
        </div>
      </Router>
      <ToastContainer />
    </>
  )
}

export default App
