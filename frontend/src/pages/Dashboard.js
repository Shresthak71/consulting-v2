"use client"

import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { getDashboardStats, getApplicationTrends, getDocumentStats, reset } from "../features/dashboard/dashboardSlice"
//import Layout from "../components/Layout"
import { FaUsers, FaFileAlt, FaClipboardCheck, FaExclamationTriangle, FaGlobe, FaBuilding } from "react-icons/fa"
import { Bar, Line, Pie } from "react-chartjs-2"
import { Chart, registerables } from "chart.js"
Chart.register(...registerables)

function Dashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { stats, trends, documentStats, isLoading } = useSelector((state) => state.dashboard)

  useEffect(() => {
    dispatch(getDashboardStats())
    dispatch(getApplicationTrends())
    dispatch(getDocumentStats())

    return () => {
      dispatch(reset())
    }
  }, [dispatch])

  // Prepare chart data for application status
  const applicationStatusData = {
    labels: stats?.applicationsByStatus?.map((item) => item.application_status) || [],
    datasets: [
      {
        label: "Applications by Status",
        data: stats?.applicationsByStatus?.map((item) => item.count) || [],
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(255, 99, 132, 0.6)",
        ],
        borderWidth: 1,
      },
    ],
  }

  // Prepare chart data for applications by country
  const applicationsByCountryData = {
    labels: stats?.applicationsByCountry?.map((item) => item.country) || [],
    datasets: [
      {
        label: "Applications by Country",
        data: stats?.applicationsByCountry?.map((item) => item.count) || [],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
        borderWidth: 1,
      },
    ],
  }

  // Prepare chart data for monthly trends
  const monthlyTrendsData = {
    labels: trends?.monthlyApplications?.map((item) => item.month) || [],
    datasets: [
      {
        label: "Applications",
        data: trends?.monthlyApplications?.map((item) => item.count) || [],
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Approvals",
        data: trends?.monthlyApprovals?.map((item) => item.count) || [],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  }

  return (
    <>
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6 flex items-center">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <FaUsers className="text-blue-500 text-xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Students</p>
                  <p className="text-2xl font-bold">{stats?.totalStudents || 0}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 flex items-center">
                <div className="rounded-full bg-yellow-100 p-3 mr-4">
                  <FaFileAlt className="text-yellow-500 text-xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Active Applications</p>
                  <p className="text-2xl font-bold">
                    {stats?.applicationsByStatus?.find((item) => item.application_status === "processing")?.count || 0}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 flex items-center">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <FaClipboardCheck className="text-green-500 text-xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Approved Visas</p>
                  <p className="text-2xl font-bold">
                    {stats?.applicationsByStatus?.find((item) => item.application_status === "approved")?.count || 0}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 flex items-center">
                <div className="rounded-full bg-red-100 p-3 mr-4">
                  <FaExclamationTriangle className="text-red-500 text-xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Pending Documents</p>
                  <p className="text-2xl font-bold">
                    {stats?.documentsByStatus?.find((item) => item.status === "pending")?.count || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Applications by Status</h2>
                <div className="h-64">
                  <Bar
                    data={applicationStatusData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Applications by Country</h2>
                <div className="h-64">
                  <Pie
                    data={applicationsByCountryData}
                    options={{
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Monthly Application Trends</h2>
              <div className="h-80">
                <Line
                  data={monthlyTrendsData}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Branch Stats (Admin Only) */}
            {user?.role?.id === 1 && stats?.branchStats && (
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">Branch Performance</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Branch
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Students
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applications
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Success Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.branchStats.map((branch, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FaBuilding className="text-gray-500 mr-2" />
                              <div className="text-sm font-medium text-gray-900">{branch.branch}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{branch.students}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{branch.applications}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {branch.applications > 0
                                ? `${Math.round((branch.approvals / branch.applications) * 100)}%`
                                : "N/A"}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Applications */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Recent Applications</h2>
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
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats?.recentApplications?.map((app, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{app.student_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FaGlobe className="text-gray-500 mr-2" />
                            <div className="text-sm text-gray-900">{app.country}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{app.university}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${app.application_status === "approved" ? "bg-green-100 text-green-800" : ""}
                            ${app.application_status === "rejected" ? "bg-red-100 text-red-800" : ""}
                            ${app.application_status === "processing" ? "bg-yellow-100 text-yellow-800" : ""}
                            ${app.application_status === "submitted" ? "bg-blue-100 text-blue-800" : ""}
                            ${app.application_status === "draft" ? "bg-gray-100 text-gray-800" : ""}
                            ${app.application_status === "visa_applied" ? "bg-purple-100 text-purple-800" : ""}
                          `}
                          >
                            {app.application_status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : "Not submitted"}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Document Completion */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Document Completion Status</h2>
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
                        Progress
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {documentStats?.map((doc, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{doc.student_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{doc.country}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{doc.university}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${Math.round((doc.total_approved / doc.total_required) * 100)}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {doc.total_approved} of {doc.total_required} documents approved (
                            {Math.round((doc.total_approved / doc.total_required) * 100)}%)
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default Dashboard
