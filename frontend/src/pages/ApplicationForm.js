"use client"

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { getStudents } from "../features/students/studentSlice"
import {
  createApplication,
  getApplicationById,
  updateApplicationStatus,
  reset,
} from "../features/applications/applicationSlice"
//import Layout from "../components/Layout"
import { toast } from "react-toastify"
import { FaArrowLeft, FaSave } from "react-icons/fa"
import Spinner from "../components/Spinner"

function ApplicationForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const { students, isLoading: studentsLoading } = useSelector((state) => state.students)
  const { application, isLoading, isError, isSuccess, message } = useSelector((state) => state.applications)
  const { user } = useSelector((state) => state.auth)

  // Get studentId from query params if available
  const queryParams = new URLSearchParams(location.search)
  const studentIdFromQuery = queryParams.get("studentId")

  const [formData, setFormData] = useState({
    studentId: studentIdFromQuery || "",
    courseId: "",
    status: "draft",
  })

  const [availableCourses, setAvailableCourses] = useState([])
  const [availableUniversities, setAvailableUniversities] = useState([])
  const [availableCountries, setAvailableCountries] = useState([])
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedUniversity, setSelectedUniversity] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    dispatch(getStudents())

    // Fetch countries, universities, and courses
    const fetchData = async () => {
      try {
        const countriesResponse = await fetch("/api/countries")
        const countriesData = await countriesResponse.json()
        setAvailableCountries(countriesData)
      } catch (error) {
        console.error("Error fetching countries:", error)
      }
    }

    fetchData()

    if (id) {
      dispatch(getApplicationById(id))
    }

    return () => {
      dispatch(reset())
    }
  }, [dispatch, id])

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }

    if (isSuccess && !isLoading && application && id) {
      // If editing an existing application
      setFormData({
        studentId: application.student_id,
        courseId: application.course_id,
        status: application.application_status,
      })

      // Set selected country and university based on application data
      if (application.country_name) {
        const country = availableCountries.find((c) => c.name === application.country_name)
        if (country) {
          setSelectedCountry(country.country_id)
          fetchUniversities(country.country_id)
        }
      }

      if (application.university_name) {
        const university = availableUniversities.find((u) => u.name === application.university_name)
        if (university) {
          setSelectedUniversity(university.university_id)
          fetchCourses(university.university_id)
        }
      }
    }
  }, [isError, isSuccess, message, application, id, availableCountries, availableUniversities])

  const fetchUniversities = async (countryId) => {
    try {
      const response = await fetch(`/api/universities?countryId=${countryId}`)
      const data = await response.json()
      setAvailableUniversities(data)
    } catch (error) {
      console.error("Error fetching universities:", error)
    }
  }

  const fetchCourses = async (universityId) => {
    try {
      const response = await fetch(`/api/courses?universityId=${universityId}`)
      const data = await response.json()
      setAvailableCourses(data)
    } catch (error) {
      console.error("Error fetching courses:", error)
    }
  }

  const handleCountryChange = (e) => {
    const countryId = e.target.value
    setSelectedCountry(countryId)
    setSelectedUniversity("")
    setFormData({
      ...formData,
      courseId: "",
    })
    setAvailableCourses([])

    if (countryId) {
      fetchUniversities(countryId)
    } else {
      setAvailableUniversities([])
    }
  }

  const handleUniversityChange = (e) => {
    const universityId = e.target.value
    setSelectedUniversity(universityId)
    setFormData({
      ...formData,
      courseId: "",
    })

    if (universityId) {
      fetchCourses(universityId)
    } else {
      setAvailableCourses([])
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!formData.studentId || !formData.courseId) {
      toast.error("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    if (id) {
      // Update application status
      dispatch(updateApplicationStatus({ id, status: formData.status }))
        .unwrap()
        .then(() => {
          toast.success("Application updated successfully")
          navigate(`/applications/${id}`)
        })
        .catch((error) => {
          toast.error(error)
          setIsSubmitting(false)
        })
    } else {
      // Create new application
      dispatch(
        createApplication({
          studentId: formData.studentId,
          courseId: formData.courseId,
        }),
      )
        .unwrap()
        .then((response) => {
          toast.success("Application created successfully")
          navigate(`/applications/${response.application_id}`)
        })
        .catch((error) => {
          toast.error(error)
          setIsSubmitting(false)
        })
    }
  }

  if (studentsLoading || (isLoading && id)) {
    return <Spinner />
  }

  return (
    <>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">{id ? "Edit Application" : "New Application"}</h1>
          <button
            onClick={() => navigate(id ? `/applications/${id}` : "/applications")}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                    Student <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    disabled={id || studentIdFromQuery}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map((student) => (
                      <option key={student.student_id} value={student.student_id}>
                        {student.full_name} - {student.branch_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    disabled={id}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="">Select Country</option>
                    {availableCountries.map((country) => (
                      <option key={country.country_id} value={country.country_id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">
                    University <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="university"
                    name="university"
                    value={selectedUniversity}
                    onChange={handleUniversityChange}
                    disabled={id || !selectedCountry}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="">Select University</option>
                    {availableUniversities.map((university) => (
                      <option key={university.university_id} value={university.university_id}>
                        {university.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="courseId"
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleChange}
                    disabled={id || !selectedUniversity}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="">Select Course</option>
                    {availableCourses.map((course) => (
                      <option key={course.course_id} value={course.course_id}>
                        {course.name} - {course.level}
                      </option>
                    ))}
                  </select>
                </div>

                {id && (
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="draft">Draft</option>
                      <option value="submitted">Submitted</option>
                      <option value="processing">Processing</option>
                      <option value="visa_applied">Visa Applied</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 bg-gray-50 text-right">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <FaSave className="mr-2" /> {id ? "Update Application" : "Create Application"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default ApplicationForm
