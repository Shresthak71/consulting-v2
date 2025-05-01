"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { importStudents, reset } from "../features/bulk/bulkSlice"
import { toast } from "react-toastify"

const BulkOperationsPage = () => {
  const [file, setFile] = useState(null)
  const [selectedBranch, setSelectedBranch] = useState("")
  const [exportType, setExportType] = useState("students")
  const [exportBranch, setExportBranch] = useState("")
  const [exportStatus, setExportStatus] = useState("")

  const dispatch = useDispatch()
  const { importResults, isLoading, isSuccess, isError, message } = useSelector((state) => state.bulk)
  const { user } = useSelector((state) => state.auth)
  const { branches } = useSelector((state) => state.branch)

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }

    if (isSuccess && importResults) {
      toast.success(`Imported ${importResults.inserted} out of ${importResults.total} students`)
    }

    return () => {
      dispatch(reset())
    }
  }, [isError, isSuccess, message, importResults, dispatch])

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleImport = async (e) => {
    e.preventDefault()

    if (!file) {
      toast.error("Please select a file to upload")
      return
    }

    const formData = new FormData()
    formData.append("csv", file)

    if (selectedBranch) {
      formData.append("branchId", selectedBranch)
    }

    dispatch(importStudents(formData))
  }

  const handleExport = (e) => {
    e.preventDefault()

    let url = `${process.env.REACT_APP_API_URL}/api/bulk/export/${exportType}`

    // Add query parameters
    const params = new URLSearchParams()

    if (exportBranch) {
      params.append("branchId", exportBranch)
    }

    if (exportStatus && exportType === "applications") {
      params.append("status", exportStatus)
    }

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    // Open in new tab
    window.open(url, "_blank")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Bulk Operations</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Import Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Import Data</h2>

          <form onSubmit={handleImport}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Import Type</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                defaultValue="students"
              >
                <option value="students">Students</option>
              </select>
            </div>

            {(user.role === "admin" || user.role === "super_admin") && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
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

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !file}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? "Importing..." : "Import"}
            </button>
          </form>

          {importResults && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2">Import Results</h3>
              <p>Total records: {importResults.total}</p>
              <p>Successfully imported: {importResults.inserted}</p>
              <p>Errors: {importResults.errors.length}</p>

              {importResults.errors.length > 0 && (
                <div className="mt-2">
                  <h4 className="font-semibold text-gray-700 mb-1">Error Details:</h4>
                  <ul className="text-sm text-red-600 list-disc list-inside">
                    {importResults.errors.slice(0, 5).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {importResults.errors.length > 5 && <li>...and {importResults.errors.length - 5} more errors</li>}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="mt-4">
            <h3 className="font-semibold text-gray-700 mb-2">CSV Format</h3>
            <p className="text-sm text-gray-600 mb-2">Your CSV file should have the following columns:</p>
            <div className="bg-gray-50 p-2 rounded-md text-xs font-mono">full_name,email,phone</div>
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Export Data</h2>

          <form onSubmit={handleExport}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Export Type</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={exportType}
                onChange={(e) => setExportType(e.target.value)}
              >
                <option value="students">Students</option>
                <option value="applications">Applications</option>
              </select>
            </div>

            {(user.role === "admin" || user.role === "super_admin") && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={exportBranch}
                  onChange={(e) => setExportBranch(e.target.value)}
                >
                  <option value="">All Branches</option>
                  {branches.map((branch) => (
                    <option key={branch.branch_id} value={branch.branch_id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {exportType === "applications" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={exportStatus}
                  onChange={(e) => setExportStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="processing">Processing</option>
                  <option value="visa_applied">Visa Applied</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Export to CSV
            </button>
          </form>

          <div className="mt-8">
            <h3 className="font-semibold text-gray-700 mb-2">Document Checklist Export</h3>
            <p className="text-sm text-gray-600 mb-4">
              To export a document checklist for a specific application, go to the application details page and use the
              export button there.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BulkOperationsPage
