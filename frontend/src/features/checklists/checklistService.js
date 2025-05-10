import axios from "../../api/axiosConfig"

// Get all checklists
const getChecklists = async () => {
  const response = await axios.get("/checklists")
  return response.data
}

// Get checklist by ID
const getChecklistById = async (checklistId) => {
  const response = await axios.get(`/checklists/${checklistId}`)
  return response.data
}

// Create new checklist
const createChecklist = async (checklistData) => {
  const response = await axios.post("/checklists", checklistData)
  return response.data
}

// Update checklist
const updateChecklist = async (checklistId, checklistData) => {
  const response = await axios.put(`/checklists/${checklistId}`, checklistData)
  return response.data
}

// Delete checklist
const deleteChecklist = async (checklistId) => {
  const response = await axios.delete(`/checklists/${checklistId}`)
  return response.data
}

// Get checklist by country
const getChecklistByCountry = async (countryId) => {
  const response = await axios.get(`/checklists/country/${countryId}`)
  return response.data
}

const checklistService = {
  getChecklists,
  getChecklistById,
  createChecklist,
  updateChecklist,
  deleteChecklist,
  getChecklistByCountry,
}

export default checklistService
