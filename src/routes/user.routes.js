import { Router } from "express";
// importing upload middleware which we created using multer so that we can accept file from the frontend
import { upload } from "../middlewares/multer.middleware.js";
import { registerUser } from "../controllers/user.controller.js";


const userRouter = Router();

userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1
    },
    {
      name: "coverImage",
      maxCount: 1
    }
  ])
  , registerUser);

export { userRouter }