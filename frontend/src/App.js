"use client"

import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

// Pages
import Login from "./pages/Login"
import Register from "./pages/Register"
import AdminDashboard from "./pages/AdminDashboard"
import ChecklistPage from "./pages/ChecklistPage"
import UploadDocumentForm from "./pages/UploadDocumentForm"
import AdminAnalytics from "./pages/AdminAnalytics"
import ExpiringDocumentsPage from "./pages/ExpiringDocumentsPage"
import BulkOperationsPage from "./pages/BulkOperationsPage"

// Components
import Header from "./components/Header"
import Sidebar from "./components/Sidebar"
import PrivateRoute from "./components/PrivateRoute"
import NotificationDropdown from "./components/NotificationDropdown"

// Redux
import { getCurrentUser } from "./features/auth/authSlice"
import { connectSocket } from "./features/message/messageSlice"

const App = () => {
  const dispatch = useDispatch()
  const { user, token } = useSelector((state) => state.auth)

  useEffect(() => {
    if (token) {
      dispatch(getCurrentUser())
      dispatch(connectSocket())
    }
  }, [dispatch, token])

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <ToastContainer position="top-right" autoClose={3000} />

        {user && <Sidebar />}

        <div className="flex-1 flex flex-col overflow-hidden">
          {user && (
            <Header>
              <div className="flex items-center">
                <NotificationDropdown />
                {/* Other header elements */}
              </div>
            </Header>
          )}

          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
              <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

              <Route path="/" element={<PrivateRoute />}>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<AdminDashboard />} />
                <Route path="/documents/:applicationId" element={<ChecklistPage />} />
                <Route path="/upload/:applicationId" element={<UploadDocumentForm />} />
                <Route path="/analytics" element={<AdminAnalytics />} />
                <Route path="/documents/expiring" element={<ExpiringDocumentsPage />} />
                <Route path="/bulk" element={<BulkOperationsPage />} />
              </Route>
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
