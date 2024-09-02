import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrorHandler } from '../utils/ApiErrorHandler.js';
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponseHandler } from "../utils/ApiResponseHandler.js";


// METHOD FOR GENERATING ACCESS AND REFRESH TOKEN
const generateAccessTokenAndRefreshToken = async (userId) => {
  const user = await User.findById(userId)
  const accessToken = user.generateAccessToken()
  const refreshToken = user.generateRefreshToken()

  // adding refresh token to the database
  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })
  return { accessToken, refreshToken }

}

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

  if (!checkCreatedUser) {
    throw new ApiErrorHandler(500, "something went wrong while registering the user")
  }


  // return res
  res.status(201).json(
    new ApiResponseHandler(200, checkCreatedUser, "User created successfully!!!")
  )

})



// CODE FOR USER LOGIN  --> 
const loginUser = asyncHandler(async (req, res) => {
  //  get details from the user - username, email, password
  // vlidating that we are getting all the above details from the user or not
  // validating if this user is already present in the database
  // if present - then validate the password and redirect him to homepage in the frontend
  // if not present - redirect him to register page in the frontend
  // if password correct then - generate refresh token and access token for the user
  // send these token using secure cookies



  const { username, email, password } = req.body

  if (!username && !email) {
    throw new ApiErrorHandler(400, `username or email is required!!!`)
  }

  const findUserFromDB = await User.findOne({
    $or: [{ username }, { email }]
  }) // THIS WILL RETURN THE USER OBJECT WHICH WILL MATCH THE USER ENTERED USERNAME OR EMAIL FROM THE DATABASE

  if (!findUserFromDB) {
    throw new ApiErrorHandler(404, `User does not exist or not registered, please register first!!!`)
  }

  // now we need to check if the user entered password matches the password present in the database or not - this we can do by using the method isPasswordCorrect which we created in the user.model.js file
  // this method will take user entered password as a parameter and will compare it with the password present in the database
  const isPasswordValid = findUserFromDB.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiErrorHandler(401, `Incorrect Password!!!`)
  }


  // once the user is validated we need to generate access token and refresh token - for this we have already created a method
  const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(findUserFromDB._id)

  // since we created the access and refresh token after the user was found in the DB so to return the final data to the user/frontend we need to update findUserInDB, along with this we will select out the fields which we don not want to send to the frontend from the user object

  const loggedInUser = await User.findById(findUserFromDB._id).select("-password -refreshToken")


  // SENDING TOKEN USING SECURE COOKIES --> 
  // creating options to secure the cookies so that they can only be modified from the server and not from the frontend
  const options = {
    httpOnly: true,
    secure: true
  }

  // here we have created a cookie in the form of key-value pair whose key is "accessToken" and value is accessToken
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponseHandler(200,
        {
          user: loggedInUser, accessToken, refreshToken
        },
        "User logged in successfully!!!"
      )
    )
})


// CODE FOR USER LOGOUT -->
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined
    },

  },
    {
      new: true
    })

  const options = {
    httpOnly: true,
    secure: true
  }

 return res.
    status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponseHandler(200, {}, `User logged Out Successfully!!!`)
    )
})



export { registerUser, loginUser, logoutUser }