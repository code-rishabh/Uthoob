import { v2 as cloudinary } from "cloudinary"
import { response } from "express";
import fs from "fs"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null
    // uploading file to cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    })
    // file has been updated successfully
    console.log(`file has been updated on cloudinary : ${cloudinaryResponse.url}`)
    console.log(cloudinaryResponse)
    return cloudinaryResponse;

  } catch (error) {
    fs.unlinkSync(localFilePath) // remove the locallyb saved temporary file as the operation got failed
    return null
  }
}

export { uploadOnCloudinary }