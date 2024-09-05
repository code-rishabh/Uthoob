import { Router } from "express";
// importing upload middleware which we created using multer so that we can accept file from the frontend
import { upload } from "../middlewares/multer.middleware.js";
import { registerUser, loginUser, logoutUser, updateRefreshToken, changeUserPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getUserWatchHistory } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";



const router = Router();

router.route("/register").post(
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

router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/update-refresh-token").post(updateRefreshToken)
router.route("/change-password").post(verifyJWT, changeUserPassword)
router.route("/user-profile").post(verifyJWT, getCurrentUser)
router.route("/update-profile").patch(verifyJWT, updateAccountDetails)
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/update-cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/channel/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getUserWatchHistory)


export { router }