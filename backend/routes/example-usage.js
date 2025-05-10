// Example usage of asyncHandler (not an actual file to create)
const express = require("express")
const router = express.Router()
const asyncHandler = require("../utils/asyncHandler")

// Example async function (replace with your actual function)
async function someAsyncFunction() {
  return { message: "Hello from async function!" }
}

// Example route with asyncHandler
router.get(
  "/example",
  asyncHandler(async (req, res) => {
    // No need for try/catch here
    const data = await someAsyncFunction()
    res.json(data)
  }),
)

module.exports = router
