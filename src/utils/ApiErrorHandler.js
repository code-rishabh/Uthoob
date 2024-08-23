// creating a class fkor handling errors so that the format for getting errors is same throughout the application and things are standardized
class ApiErrorHandler extends Error {
  constructor(
    statusCode,
    message = "this is default error message",
    errors = [],
    stack = ""
  ) {
    super(message)
    this.stack = stack
    this.message = message
    this.statusCode = statusCode
    this.errors = errors
    this.data = null
    this.success = false

    // condition for gettiing specific errors from the error stack - useful when the api error codes are very long and we want specific error locations
    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export { ApiErrorHandler }