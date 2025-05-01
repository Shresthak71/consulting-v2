"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getExpiringDocuments, updateExpiryDate } from "../features/document/documentSlice"
import { toast } from "react-toastify"

const ExpiringDocumentsPage = () => {
  const [daysFilter, setDaysFilter] = useState(30)
  const [selectedBranch, setSelectedBranch] = useState("all")
  const [newExpiryDate, setNewExpiryDate] = useState({})

  const dispatch = useDispatch()
  const { expiringDocuments, isLoading, isError, message } = useSelector((state) => state.document)
  const { user } = useSelector((state) => state.auth)
  const { branches } = useSelector((state) => state.branch)

  useEffect(() => {
    const params = {
      days: daysFilter,
      branchId: selectedBranch === "all" ? null : selectedBranch,
    }

    dispatch(getExpiringDocuments(params))
  }, [dispatch, daysFilter, selectedBranch])

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }
  }, [isError, message])

  const handleExpiryDateChange = (appDocId, date) => {
    setNewExpiryDate({
      ...newExpiryDate,
      [appDocId]: date,
    })
  }

  const handleUpdateExpiryDate = async (appDocId) => {
    if (!newExpiryDate[appDocId]) {
      toast.error("Please select a new expiry date")
      return
    }

    try {
      await dispatch(
        updateExpiryDate({
          appDocId,
          expiryDate: newExpiryDate[appDocId],
        }),
      ).unwrap()

      toast.success("Expiry date updated successfully")

      // Refresh the list
      dispatch(
        getExpiringDocuments({
          days: daysFilter,
          branchId: selectedBranch === "all" ? null : selectedBranch,
        }),
      )

      // Clear the input
      setNewExpiryDate({
        ...newExpiryDate,
        [appDocId]: "",
      })
    } catch (error) {
      toast.error(error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Expiring Documents</h1>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <label htmlFor="daysFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Expiring within (days)
            </label>
            <select
              id="daysFilter"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={daysFilter}
              onChange={(e) => setDaysFilter(e.target.value)}
            >
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
            </select>
          </div>

          {(user.role === "admin" || user.role === "super_admin") && (
            <div>
              <label htmlFor="branchFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Branch
              </label>
              <select
                id="branchFilter"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                <option value="all">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch.branch_id} value={branch.branch_id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button
          onClick={() =>
            dispatch(
              getExpiringDocuments({
                days: daysFilter,
                branchId: selectedBranch === "all" ? null : selectedBranch,
              }),
            )
          }
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Documents Expiring Soon</h2>

          {expiringDocuments.length === 0 ? (
            <p className="text-gray-500">No documents expiring within the selected timeframe.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Branch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expiringDocuments.map((doc) => (
                    <tr key={doc.app_doc_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {doc.document_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.student_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.branch_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            doc.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : doc.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(doc.expiry_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-2">
                          <a
                            href={`${process.env.REACT_APP_API_URL}/${doc.file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Document
                          </a>

                          <div className="flex space-x-2">
                            <input
                              type="date"
                              value={newExpiryDate[doc.app_doc_id] || ""}
                              onChange={(e) => handleExpiryDateChange(doc.app_doc_id, e.target.value)}
                              className="p-1 border border-gray-300 rounded-md text-sm"
                            />
                            <button
                              onClick={() => handleUpdateExpiryDate(doc.app_doc_id)}
                              className="bg-indigo-600 text-white px-2 py-1 rounded-md text-sm hover:bg-indigo-700"
                            >
                              Update
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExpiringDocumentsPage
