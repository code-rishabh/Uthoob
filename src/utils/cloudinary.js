import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


cloudinary.config({
  api_key: process.env.CLOUD_API_KEY,
  cloud_name: process.env.CLOUD_CLOUD_NAME,
  api_secret: process.env.CLOUD_API_SECRET,
})

// console.log("cloudinary ke config",{
//   // cloud_name:"dcmknymsl",
//   // api_key:"113326971282418",
//   // api_secret:"lLKmooXVuOBCEY7XtxdhhkWjSWs",
//   api_key: process.env.CLOUD_API_KEY,
//   cloud_name: process.env.CLOUD_CLOUD_NAME,
//   api_secret: process.env.CLOUD_API_SECRET,
// })


const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.log(`${localFilePath} nhi aa rha cloudinary.js ke pas`)
      return null
    }
    // if (!localFilePath) return null
    // uploading file to cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    })
    // file has been updated successfully
    console.log(`file has been uploaded on cloudinary : ${cloudinaryResponse.url}`)
    fs.unlinkSync(localFilePath)
    console.log(`file has been removed from the server`)
    console.log(cloudinaryResponse)
    return cloudinaryResponse;

  } catch (error) {
    fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the operation got failed
    console.log(`ye error cloudinary ke catch me aaya hai`, error.message)
    return null
  }
}

export { uploadOnCloudinary }