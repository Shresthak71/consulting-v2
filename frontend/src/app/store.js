import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/authSlice"
import branchReducer from "../features/branches/branchSlice"
import studentReducer from "../features/students/studentSlice"
import applicationReducer from "../features/applications/applicationSlice"
import documentReducer from "../features/documents/documentSlice"
import checklistReducer from "../features/checklists/checklistSlice"
import dashboardReducer from "../features/dashboard/dashboardSlice"
import userReducer from "../features/users/userSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    branches: branchReducer,
    students: studentReducer,
    applications: applicationReducer,
    documents: documentReducer,
    checklists: checklistReducer,
    dashboard: dashboardReducer,
    users: userReducer,
  },
})
