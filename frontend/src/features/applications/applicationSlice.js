import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import applicationService from "./applicationService"

const initialState = {
  applications: [],
  application: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
}

// Get all applications
export const getApplications = createAsyncThunk("applications/getAll", async (filters, thunkAPI) => {
  try {
    return await applicationService.getApplications(filters)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Get application by ID
export const getApplicationById = createAsyncThunk("applications/getById", async (id, thunkAPI) => {
  try {
    return await applicationService.getApplicationById(id)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Create new application
export const createApplication = createAsyncThunk("applications/create", async (applicationData, thunkAPI) => {
  try {
    return await applicationService.createApplication(applicationData)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Update application status
export const updateApplicationStatus = createAsyncThunk(
  "applications/updateStatus",
  async ({ id, status }, thunkAPI) => {
    try {
      return await applicationService.updateApplicationStatus(id, status)
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  },
)

// Delete application
export const deleteApplication = createAsyncThunk("applications/delete", async (id, thunkAPI) => {
  try {
    return await applicationService.deleteApplication(id)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

export const applicationSlice = createSlice({
  name: "application",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = false
      state.message = ""
    },
    clearApplication: (state) => {
      state.application = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getApplications.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getApplications.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.applications = action.payload
      })
      .addCase(getApplications.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(getApplicationById.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getApplicationById.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.application = action.payload
      })
      .addCase(getApplicationById.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(createApplication.pending, (state) => {
        state.isLoading = true
      })
      .addCase(createApplication.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.applications.push(action.payload)
      })
      .addCase(createApplication.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(updateApplicationStatus.pending, (state) => {
        state.isLoading = true
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.application = action.payload
        state.applications = state.applications.map((app) =>
          app.application_id === action.payload.application_id ? action.payload : app,
        )
      })
      .addCase(updateApplicationStatus.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(deleteApplication.pending, (state) => {
        state.isLoading = true
      })
      .addCase(deleteApplication.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.applications = state.applications.filter((app) => app.application_id !== action.meta.arg)
      })
      .addCase(deleteApplication.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  },
})

export const { reset, clearApplication } = applicationSlice.actions
export default applicationSlice.reducer
