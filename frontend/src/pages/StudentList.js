"use client"

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Link } from "react-router-dom"
import { getStudents, deleteStudent, reset } from "../features/students/studentSlice"
//import Layout from "../components/Layout"
import { toast } from "react-toastify"
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye } from "react-icons/fa"
import Spinner from "../components/Spinner"
import Modal from "../components/Modal"

function StudentList() {
  const dispatch = useDispatch()
  const { students, isLoading, isError, isSuccess, message } = useSelector((state) => state.students)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState(null)

  useEffect(() => {
    dispatch(getStudents())

    return () => {
      dispatch(reset())
    }
  }, [dispatch])

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }
  }, [isError, message])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const confirmDelete = (student) => {
    setStudentToDelete(student)
    setShowDeleteModal(true)
  }

  const handleDelete = () => {
    dispatch(deleteStudent(studentToDelete.student_id))
      .unwrap()
      .then(() => {
        toast.success("Student deleted successfully")
        setShowDeleteModal(false)
      })
      .catch((error) => {
        toast.error(error)
      })
  }

  const filteredStudents = students.filter(
    (student) =>
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.phone && student.phone.includes(searchTerm)),
  )

  if (isLoading) {
    return <Spinner />
  }

  return (
    <>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Students</h1>
          <Link
            to="/students/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
          >
            <FaPlus className="mr-2" /> Add Student
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search students..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.student_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.full_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.email}</div>
                        <div className="text-sm text-gray-500">{student.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.branch_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.registered_by_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{new Date(student.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/students/${student.student_id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View"
                          >
                            <FaEye />
                          </Link>
                          <Link
                            to={`/students/${student.student_id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() => confirmDelete(student)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        footer={
          <>
            <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={handleDelete}
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-500">
          Are you sure you want to delete {studentToDelete?.full_name}? This action cannot be undone.
        </p>
      </Modal>
    </>
  )
}

export default StudentList
