import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import { app } from './app.js';

dotenv.config();

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log(`erorr yhaa hai --> `, error);
      process.exit(1)
    })
    app.listen(process.env.PORT || 8000, () => {
      console.log(`server is running at port : ${process.env.PORT}`)
    })
  })
  .catch((error) => {
    console.log(`error connecting to the database: ${error}`)
  })



