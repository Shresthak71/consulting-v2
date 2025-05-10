import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import checklistService from "./checklistService"

const initialState = {
  checklists: [],
  checklist: null,
  countryChecklists: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
}

// Get all checklists
export const getChecklists = createAsyncThunk("checklists/getAll", async (_, thunkAPI) => {
  try {
    return await checklistService.getChecklists()
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Get checklist by ID
export const getChecklistById = createAsyncThunk("checklists/getById", async (id, thunkAPI) => {
  try {
    return await checklistService.getChecklistById(id)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Create new checklist
export const createChecklist = createAsyncThunk("checklists/create", async (checklistData, thunkAPI) => {
  try {
    return await checklistService.createChecklist(checklistData)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Update checklist
export const updateChecklist = createAsyncThunk("checklists/update", async ({ id, checklistData }, thunkAPI) => {
  try {
    return await checklistService.updateChecklist(id, checklistData)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Delete checklist
export const deleteChecklist = createAsyncThunk("checklists/delete", async (id, thunkAPI) => {
  try {
    return await checklistService.deleteChecklist(id)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Get checklist by country
export const getChecklistByCountry = createAsyncThunk("checklists/getByCountry", async (countryId, thunkAPI) => {
  try {
    return await checklistService.getChecklistByCountry(countryId)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

export const checklistSlice = createSlice({
  name: "checklist",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = false
      state.message = ""
    },
    clearChecklist: (state) => {
      state.checklist = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getChecklists.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getChecklists.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.checklists = action.payload
      })
      .addCase(getChecklists.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(getChecklistById.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getChecklistById.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.checklist = action.payload
      })
      .addCase(getChecklistById.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(createChecklist.pending, (state) => {
        state.isLoading = true
      })
      .addCase(createChecklist.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.checklists.push(action.payload)
      })
      .addCase(createChecklist.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(updateChecklist.pending, (state) => {
        state.isLoading = true
      })
      .addCase(updateChecklist.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.checklist = action.payload
        state.checklists = state.checklists.map((checklist) =>
          checklist.checklist_id === action.payload.checklist_id ? action.payload : checklist,
        )
      })
      .addCase(updateChecklist.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(deleteChecklist.pending, (state) => {
        state.isLoading = true
      })
      .addCase(deleteChecklist.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.checklists = state.checklists.filter((checklist) => checklist.checklist_id !== action.meta.arg)
      })
      .addCase(deleteChecklist.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(getChecklistByCountry.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getChecklistByCountry.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.countryChecklists = action.payload
      })
      .addCase(getChecklistByCountry.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  },
})

export const { reset, clearChecklist } = checklistSlice.actions
export default checklistSlice.reducer
