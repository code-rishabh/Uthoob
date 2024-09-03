// import dotenv from "dotenv"
// dotenv.config();
import { User } from "../models/user.model.js";
import { ApiErrorHandler } from "../utils/ApiErrorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';


export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    // console.log(req.cookies)
    // console.log(`checkpoint 1`)
    // console.log(token)


    if (!token) {
      // console.log(`checkpoint 2`)

      throw new ApiErrorHandler(401, "Unauthorized request")

    }

    // Now we need to decode this token for 2 reasons - 1st --> because the token that user gets is encrypted and it differs from the token present in the db and 2nd --> so that we can utilize the fields present in the token object which we already passed when we generated the access token in user.model.js file 
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    // console.log(decodedToken)


    // this will return an object containing the details of the user that is signed in on the basis if _id and further we will remove password and refreshToken field using select() method in this object.
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

    if (!user) {
      throw new ApiErrorHandler(401, "invalid access token");
    }

    console.log("req ke andar kya hai yha dekho -------", req)
    // here we will create a new field in the req object( with the name user ) and pass user object in the same so that it can be utilized in the logout user logic which we will define the the user.controller.js file.
    req.user = user
    next();
  } catch (error) {
    console.log(`ye error catch me aagya hai auth file ke`)
    throw new ApiErrorHandler(error?.statusCode || 401, error?.message || `Invalid Access Token`)

  }

})