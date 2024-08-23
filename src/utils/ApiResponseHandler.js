// creating a class for handling the api responses so that the api response format is standard all throughout the application

class ApiResponseHandler {
  constructor(
    statusCode,
    data,
    message = "Success"
  ) {
    this.statusCode = statusCode
    this.data = data
    this.message = message
    this.success = statusCode < 400 // we are keeping it less than 400 because this is for API response, if it had been error responses in that case we would have to keep it above 400

  }
}

export {ApiResponseHandler}

// Informational responses (100 – 199)
// Successful responses (200 – 299)
// Redirection messages (300 – 399)
// Client error responses (400 – 499)
// Server error responses (500 – 599)