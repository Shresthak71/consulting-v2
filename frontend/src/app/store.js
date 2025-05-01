import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/authSlice"
import branchReducer from "../features/branch/branchSlice"
import studentReducer from "../features/student/studentSlice"
import applicationReducer from "../features/application/applicationSlice"
import documentReducer from "../features/document/documentSlice"
import dashboardReducer from "../features/dashboard/dashboardSlice"
import messageReducer from "../features/message/messageSlice"
import notificationReducer from "../features/notification/notificationSlice"
import bulkReducer from "../features/bulk/bulkSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    branch: branchReducer,
    student: studentReducer,
    application: applicationReducer,
    document: documentReducer,
    dashboard: dashboardReducer,
    message: messageReducer,
    notification: notificationReducer,
    bulk: bulkReducer,
  },
})
