"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getDashboardStats, getBranchComparison } from "../features/dashboard/dashboardSlice"
import { Bar, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement)

const AdminDashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { stats, branchComparison, isLoading } = useSelector((state) => state.dashboard)
  const [selectedBranch, setSelectedBranch] = useState("all")

  useEffect(() => {
    dispatch(getDashboardStats(selectedBranch === "all" ? null : selectedBranch))

    if (user && (user.role === "admin" || user.role === "super_admin")) {
      dispatch(getBranchComparison())
    }
  }, [dispatch, selectedBranch, user])

  // Handle branch change
  const handleBranchChange = (e) => {
    setSelectedBranch(e.target.value)
  }

  if (isLoading || !stats) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  // Prepare data for charts
  const applicationStatusData = {
    labels: stats.applicationsByStatus.map((item) => item.application_status),
    datasets: [
      {
        label: "Applications by Status",
        data: stats.applicationsByStatus.map((item) => item.count),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const applicationCountryData = {
    labels: stats.applicationsByCountry.map((item) => item.country),
    datasets: [
      {
        label: "Applications by Country",
        data: stats.applicationsByCountry.map((item) => item.count),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const documentCompletionData = {
    labels: ["Complete", "Pending", "Rejected"],
    datasets: [
      {
        label: "Document Completion",
        data: [
          stats.documentStats.complete_applications,
          stats.documentStats.pending_applications,
          stats.documentStats.rejected_applications,
        ],
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 206, 86, 0.6)", "rgba(255, 99, 132, 0.6)"],
        borderWidth: 1,
      },
    ],
  }

  // Branch comparison data (for admin only)
  const branchComparisonData = {
    labels: branchComparison.map((branch) => branch.branch_name),
    datasets: [
      {
        label: "Total Students",
        data: branchComparison.map((branch) => branch.total_students),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
      {
        label: "Total Applications",
        data: branchComparison.map((branch) => branch.total_applications),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
      {
        label: "Approved Applications",
        data: branchComparison.map((branch) => branch.approved_applications),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

        {/* Branch selector */}
        <div className="w-64">
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={selectedBranch}
            onChange={handleBranchChange}
          >
            <option value="all">All Branches</option>
            {/* Add branch options here */}
          </select>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Students</h2>
          <p className="text-3xl font-bold text-indigo-600">{stats.totalStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Applications</h2>
          <p className="text-3xl font-bold text-indigo-600">{stats.totalApplications}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Document Completion</h2>
          <p className="text-3xl font-bold text-indigo-600">
            {stats.documentStats.complete_applications} / {stats.documentStats.total_applications}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Applications by Status</h2>
          <Pie data={applicationStatusData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Applications by Country</h2>
          <Pie data={applicationCountryData} />
        </div>
      </div>

      {/* Document completion chart */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Document Completion Status</h2>
        <Pie data={documentCompletionData} />
      </div>

      {/* Branch comparison (admin only) */}
      {user && (user.role === "admin" || user.role === "super_admin") && branchComparison.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Branch Performance Comparison</h2>
          <Bar
            data={branchComparisonData}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      )}

      {/* Recent applications */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Applications</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  University
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentApplications.map((app, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.student_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.country_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.university_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.course_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        app.application_status === "approved"
                          ? "bg-green-100 text-green-800"
                          : app.application_status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {app.application_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(app.submitted_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
