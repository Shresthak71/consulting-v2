import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import userService from "./userService"

const initialState = {
  users: [],
  roles: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
  user: null,
}

// Get all users
export const getUsers = createAsyncThunk("users/getAll", async (_, thunkAPI) => {
  try {
    return await userService.getUsers()
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Get user by ID
export const getUserById = createAsyncThunk("users/getById", async (id, thunkAPI) => {
  try {
    const response = await userService.getUsers()
    return response.data.find((user) => user.user_id === Number(id))
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Create new user
export const createUser = createAsyncThunk("users/create", async (userData, thunkAPI) => {
  try {
    const response = await userService.getUsers()
    return userData // Simulate creation on the backend
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Update user
export const updateUser = createAsyncThunk("users/update", async ({ id, userData }, thunkAPI) => {
  try {
    const response = await userService.getUsers()
    return { user_id: Number(id), ...userData } // Simulate update on the backend
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Delete user
export const deleteUser = createAsyncThunk("users/delete", async (id, thunkAPI) => {
  try {
    return id
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Get all roles
export const getRoles = createAsyncThunk("users/getRoles", async (_, thunkAPI) => {
  try {
    return await userService.getRoles()
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

// Update user role
export const updateUserRole = createAsyncThunk("users/updateRole", async (userData, thunkAPI) => {
  try {
    return await userService.updateUserRole(userData)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
    return thunkAPI.rejectWithValue(message)
  }
})

export const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = false
      state.message = ""
    },
    clearUser: (state) => {
      state.user = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.users = action.payload
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(getUserById.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.user = action.payload
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(createUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.users.push(action.payload)
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.user = action.payload
        state.users = state.users.map((user) => (user.user_id === action.payload.user_id ? action.payload : user))
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.users = state.users.filter((user) => user.user_id !== action.payload)
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(getRoles.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getRoles.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.roles = action.payload
      })
      .addCase(getRoles.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(updateUserRole.pending, (state) => {
        state.isLoading = true
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.users = state.users.map((user) =>
          user.user_id === action.payload.user_id ? { ...user, role_id: action.payload.role_id } : user,
        )
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  },
})

export const { reset, clearUser } = userSlice.actions
export default userSlice.reducer
