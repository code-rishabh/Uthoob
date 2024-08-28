import { User } from "../models/user.model";
import { ApiErrorHandler } from "../utils/ApiErrorHandler";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from 'jsonwebtoken'


export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
  
    if (!token) {
      throw new ApiErrorHandler(401, "Unauthorized request")
    }
  
    // Now we need to decode this token so that we can utilize the options present in the token object which we already passed when we generated the access token 
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
  
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
  
    if (!user) {
      throw new ApiErrorHandler(401, "invalid access token");
    }
  
    console.log("req ke andar kya hai yha dekho -------",req)
    req.user = user
    next();
  } catch (error) {
    throw new ApiErrorHandler(401, error?.message || `Invalid Access Token`)
    
  }

})