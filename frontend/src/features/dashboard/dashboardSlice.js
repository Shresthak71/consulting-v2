import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import dashboardService from "./dashboardService"

const initialState = {
  stats: null,
  branchComparison: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
}

// Get dashboard stats
export const getDashboardStats = createAsyncThunk("dashboard/getStats", async (branchId, thunkAPI) => {
  try {
    return await dashboardService.getDashboardStats(branchId)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Get branch comparison
export const getBranchComparison = createAsyncThunk("dashboard/getBranchComparison", async (_, thunkAPI) => {
  try {
    return await dashboardService.getBranchComparison()
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = false
      state.message = ""
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardStats.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.stats = action.payload
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(getBranchComparison.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getBranchComparison.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.branchComparison = action.payload
      })
      .addCase(getBranchComparison.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  },
})

export const { reset } = dashboardSlice.actions
export default dashboardSlice.reducer
