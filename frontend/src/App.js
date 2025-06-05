import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Login from "./pages/Login"
//import Register from "./pages/Register"
import Register from "./pages/RegisterAdmin"
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
import ApplicationList from "./pages/ApplicationList"
import ApplicationForm from "./pages/ApplicationForm"
import ApplicationDetail from "./pages/ApplicationDetail"
import DocumentList from "./pages/DocumentList"
import DocumentForm from "./pages/DocumentForm"
//import Layout from "./components/Layout"  
import PrivateRoute from "./components/PrivateRoute"

function App() {
  return (
    <>
       <BrowserRouter future={{ v7_startTransition: true }}>
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
               {/* Application Routes */}
               <Route path="/applications" element={<ApplicationList />} />
              <Route path="/applications/new" element={<ApplicationForm />} />
              <Route path="/applications/:id" element={<ApplicationDetail />} />
              <Route path="/applications/:id/edit" element={<ApplicationForm />} />
              {/* Document Routes */}
              <Route path="/documents" element={<DocumentList />} />
              <Route path="/documents/new" element={<DocumentForm />} />
              <Route path="/documents/:id/edit" element={<DocumentForm />} />


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
        </BrowserRouter>
      <ToastContainer />
    </>
  )
}

export default App
