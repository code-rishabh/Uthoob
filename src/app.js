import express from 'express'
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();


// CONFIGURING MIDDLEWARES
// to resolve the CORS error so that the frontend can connect to backend smoothly
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))

// HANDLING THE DIFFERENT TYPE OF INCOMING DATA TO THE BACKEND
// handling json data 
app.use(express.json());

// handling the data from the url params
app.use(express.urlencoded({extended:true}));

// handling cookies directly and only from the server and manipulate those cookies
app.use(cookieParser());

// handling the static data like images, documents, etc.
app.use(express.static("public"));






export { app };