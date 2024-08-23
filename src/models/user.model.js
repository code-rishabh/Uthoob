import mongoose, { Schema } from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";


const userSchema = new Schema(
  {
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video"
      }
    ],
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    avatar: {
      type: String, // cloudinary url
      required: true
    },
    coverImage: {
      type: String, // cloudinary url
    },
    password: {
      type: String,
      required: [true, "password is required"]
    },
    refreshToken: {
      type: String,

    },
  },
  {
    timestamps: true
  }
)


// PASSWORD ENCRYPTION
// using pre(hook) provided by mongoose, which allows us to make any sort of change just before the event is being called.
// in our case we want the password to get encrypted just before the user make any changes in the password field
userSchema.pre("save", async function (next) {
  if (!this.isModified("password"))
    return next();
  this.password = bcrypt.hash(this.password, 10);
  next();
})

// NEXT - we need to check if the password provided by the user and the encryped passwords match or they do not
// for this we can use methods provided by mongoose, also we can create our own methods if that kind of method is not present - just like in our case
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password) // bcrypt itself provides a coompare method
}

// CREATING ACCESS AND REFRESH TOKEN USING JWT
userSchema.methods.generateAccessToken = async function () {
  return jwt.sign({
    _id: this._id,
    username: this.username,
    fullName: this.fullName,
    email: this.email
  },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign({
    _id: this._id,

  },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}


export const User = model("User", userSchema)
