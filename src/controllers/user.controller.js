import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrorHandler } from '../utils/ApiErrorHandler.js';
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponseHandler } from "../utils/ApiResponseHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  // steps that are involved in registering a user -->
  // get user details from frontend
  // validation if we are getting all the fields from the frontend or not 
  // check if the user already exists - using email or username
  // check for cover image, check for avatar in incoming data
  // if cover image and avatar available - upload them to cloudinary
  // create user object to upload to database
  // upload in database
  // remove password and refresh token field from response that we will get from database
  // check if the user has been created or not
  // return res

  // get user details from frontend
  const { username, fullname, email, password } = req.body
  console.log("email: ", email)

  // validation if we are getting all the fields from the frontend or not -->
  // this line of code will check if the field is present for every field using some() method and agar ek bhi field empty hua to error throw kr dega 
  if (
    [fullname, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiErrorHandler(400, "All the fields are required!! ")
  }

  // check if the user already exists
  // this we can do using the User model that has been created in the database
  const existingUser = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (existingUser) {
    throw new ApiErrorHandler(409, "User with username or email already exists")
  }



  // check for cover image, check for avatar in incoming data
  // now we are going to check if the avatar and cover image are provided by the user or not
  // working of code ---- jaise humko express ki help se req.body milta hai waise hi humein multer ki help se req.files ka access milta hai or wo isliye kyuki multer middleware hai jo req ko extra properties provide krwata hai jaise ki files in our case
  // files me se jab humein avatar milega to wo ek object ke form me milta hai usme se hum 1st element ko access kr rhe hain jo ki khud ek object hai or usme se hum path ko access kr rhe hain or ye path humein location degi avatar ki humare server pe 
  const avatarLocalPath = req.files?.avatar[0]?.path
  console.log("avatar ka local path: ", avatarLocalPath);
  const coverImageLocalPath = req.files?.coverImage[0]?.path
  console.log("cover image ka local path: ", coverImageLocalPath)
  // this will give us the path at which these files are available in the server - these paths will be required when we will upload them to cloudinary
  //  these files available to our server at this point and are yet to get uploaded to cloudinary


  // KYUKI AVATAR COMPULSORY HAI USER SE LENA ISLIYE EK CHECK LAGA DETE HAIN
  if (!avatarLocalPath) {
    throw new ApiErrorHandler(400, "Avatar is required!!!")
  }

  // if cover image and avatar available - upload them to cloudinary
  const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath)
  console.log(uploadedAvatar)
  const uploadedCoverImage = await uploadOnCloudinary(coverImageLocalPath)

  // KYUKI AVATAR KA FIELD DATABASE ME MANDATORY HAI TO EK OR CHECK LAGANA BANTA HAI YAHA PE NHI TO DB FATEGA
  // if (!uploadedAvatar) {
  //   throw new ApiErrorHandler(400, "Avatar is required!!!")
  // }


  // create user object to upload to database
  const user = await User.create({
    fullname,
    email,
    password,
    username: username.toLowerCase(),
    avatar: uploadedAvatar.url,
    coverImage: uploadedCoverImage?.url || ""
  })
  // remove password and refresh token field from response that we will get from database kyuki ham user ko ye dono fields nahi dikhana chahte for obv reasons
  const checkCreatedUser = await User.findById(user._id).select("-password -refreshToken")

  if(!checkCreatedUser){
    throw new ApiErrorHandler(500, "something went wrong while registering the user")
  }


  // return res
  res.status(201).json(
    new ApiResponseHandler(200, checkCreatedUser, "User created successfully!!!")
  )

})


export { registerUser }