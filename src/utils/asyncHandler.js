// creating an asyncHandler method 
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(
      requestHandler(req, res, next)
    ).reject((error) => next(error))
  }
}

export { asyncHandler };