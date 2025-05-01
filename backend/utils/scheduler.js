const cron = require("node-cron")
const axios = require("axios")
const { createLogger, format, transports } = require("winston")

// Configure logger
const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  defaultMeta: { service: "scheduler" },
  transports: [
    new transports.File({ filename: "logs/scheduler-error.log", level: "error" }),
    new transports.File({ filename: "logs/scheduler.log" }),
  ],
})

// Add console transport in development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  )
}

// Initialize scheduler
const initScheduler = () => {
  logger.info("Initializing scheduler")

  // Schedule document expiry reminders to run daily at 1:00 AM
  cron.schedule("0 1 * * *", async () => {
    try {
      logger.info("Running scheduled task: document expiry reminders")

      const response = await axios.post(
        `${process.env.API_BASE_URL}/api/notifications/cron/send-expiry-reminders`,
        {},
        {
          headers: {
            "x-api-key": process.env.CRON_API_KEY,
          },
        },
      )

      logger.info(`Document expiry reminders sent: ${response.data.data.documentCount} documents`)
    } catch (error) {
      logger.error("Error running document expiry reminders:", error)
    }
  })

  logger.info("Scheduler initialized")
}

module.exports = { initScheduler }
