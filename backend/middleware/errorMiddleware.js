// Error handling middleware

/**
 * Custom error handler
 * @param {Error} err - Error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const errorHandler = (err, req, res, next) => {
    // Log the error for server-side debugging
    console.error(`ERROR: ${err.message}`.red)
    console.error(err.stack)
  
    // Get status code from error if available, or default to 500
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  
    // Send error response
    res.status(statusCode).json({
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    })
  }
  
  /**
   * Handle 404 errors - for routes that don't exist
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`)
    res.status(404)
    next(error)
  }
  
  module.exports = { errorHandler, notFound }
  