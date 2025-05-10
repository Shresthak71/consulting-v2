import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import branchService from "./branchService"

const initialState = {
  branches: [],
  branch: null,
  branchStaff: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
}

// Get all branches
export const getBranches = createAsyncThunk("branches/getAll", async (_, thunkAPI) => {
  try {
    return await branchService.getBranches()
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Get branch by ID
export const getBranchById = createAsyncThunk("branches/getById", async (id, thunkAPI) => {
  try {
    return await branchService.getBranchById(id)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Create new branch
export const createBranch = createAsyncThunk("branches/create", async (branchData, thunkAPI) => {
  try {
    return await branchService.createBranch(branchData)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Update branch
export const updateBranch = createAsyncThunk("branches/update", async ({ id, branchData }, thunkAPI) => {
  try {
    return await branchService.updateBranch(id, branchData)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Delete branch
export const deleteBranch = createAsyncThunk("branches/delete", async (id, thunkAPI) => {
  try {
    return await branchService.deleteBranch(id)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Get branch staff
export const getBranchStaff = createAsyncThunk("branches/getStaff", async (id, thunkAPI) => {
  try {
    return await branchService.getBranchStaff(id)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

export const branchSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = false
      state.message = ""
    },
    clearBranch: (state) => {
      state.branch = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBranches.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getBranches.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.branches = action.payload
      })
      .addCase(getBranches.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(getBranchById.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getBranchById.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.branch = action.payload
      })
      .addCase(getBranchById.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(createBranch.pending, (state) => {
        state.isLoading = true
      })
      .addCase(createBranch.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.branches.push(action.payload)
      })
      .addCase(createBranch.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(updateBranch.pending, (state) => {
        state.isLoading = true
      })
      .addCase(updateBranch.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.branch = action.payload
        state.branches = state.branches.map((branch) =>
          branch.branch_id === action.payload.branch_id ? action.payload : branch,
        )
      })
      .addCase(updateBranch.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(deleteBranch.pending, (state) => {
        state.isLoading = true
      })
      .addCase(deleteBranch.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.branches = state.branches.filter((branch) => branch.branch_id !== action.meta.arg)
      })
      .addCase(deleteBranch.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(getBranchStaff.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getBranchStaff.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.branchStaff = action.payload
      })
      .addCase(getBranchStaff.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  },
})

export const { reset, clearBranch } = branchSlice.actions
export default branchSlice.reducer
