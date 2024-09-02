import { Router } from "express";
// importing upload middleware which we created using multer so that we can accept file from the frontend
import { upload } from "../middlewares/multer.middleware.js";
import { registerUser, loginUser, logoutUser, updateRefreshToken } from "../controllers/user.controller.js";
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

// secured routes
userRouter.route("/logout").post(verifyJWT, logoutUser)
userRouter.route("/update-refresh-token").post(updateRefreshToken)

export { userRouter }