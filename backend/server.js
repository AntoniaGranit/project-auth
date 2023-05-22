import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

mongoose.set('strictQuery', false);
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-auth";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString('hex')
  }
});

userSchema.index({ username: 1 }, { unique: true })

const User = mongoose.model('User', userSchema);

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());
const listEndpoints = require('express-list-endpoints')

// Start defining your routes here
app.get("/", (req, res) => {
  res.send(listEndpoints(app));
});

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const salt = bcrypt.genSaltSync();
  try {
    const newUser = await new User({username, password: bcrypt.hashSync(password, salt)}).save();
    res.status(201).json({
      success: true,
      response: {
        username: newUser.username,
        email: newUser.email,
        accessToken: newUser.accessToken,
      },
      message: "User successfully created!"
    })
  } catch (error) {
    console.log("Error:", error);
    if (error.code === 11000) {
      // Duplicate key error
      const key = Object.keys(error.keyValue)[0];
      const value = error.keyValue[key];
      const message = `A user with ${key}: ${value} already exists.`;
      res.status(400).json({
        success: false,
        response: error,
        message
      });
    } else {
      // Other error
      res.status(500).json({
        success: false,
        response: error,
        message: "Could not create user"
      });
    }
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
