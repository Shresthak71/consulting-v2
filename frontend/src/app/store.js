import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/authSlice"
import studentReducer from "../features/students/studentSlice"
import branchReducer from "../features/branches/branchSlice"
import dashboardReducer from "../features/dashboard/dashboardSlice"
import userReducer from "../features/users/userSlice"
import checklistReducer from "../features/checklists/checklistSlice"
import applicationReducer from "../features/applications/applicationSlice"
import documentReducer from "../features/documents/documentSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentReducer,
    branches: branchReducer,
    dashboard: dashboardReducer,
    users: userReducer,
    checklist: checklistReducer,
    applications: applicationReducer,
    document: documentReducer,
  },
})
