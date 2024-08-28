import { Router } from "express";
// importing upload middleware which we created using multer so that we can accept file from the frontend
import { upload } from "../middlewares/multer.middleware.js";
import { registerUser, loginUser, logoutUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";



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

userRouter.route("/login").post(loginUser)

userRouter.route("logout").post(verifyJWT, logoutUser)

export { userRouter }