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

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    format: "email",
    minLength: 6,
    required: true,
    unique: true
  },
  password: {
    type: String,
    minLength: 8,
    required: true
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString('hex')
  }
});

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

// register user:
app.post("/register", async (req, res) => {
  const salt = bcrypt.genSaltSync(10);
  try {
    const { username, email, password } = req.body;
    const newUser = new User({username, email, password: bcrypt.hashSync(password, salt)});
    newUser.save();
    res.status(201).json({
      success: true,
      response: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        accessToken: newUser.accessToken,
      },
      message: "User successfully created!"
    })
  } catch (e) {
    console.log("Error:", e); {
      res.status(400).json({
        success: false,
        response: err.errors,
        message: "Could not create user"
      });
    }
  }
});

// login:
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username: username});
    // if the password that someone sends during login is the same as the password that is created when registering
    if (user && bcrypt.compareSync(password, user.password)) {
      res.status(200).json({
        success: true,
        response: {
          username: user.username,
          id: user._id,
          accessToken: user.accessToken
        }
      })
    } else {
      res.status(400).json({
        success: false,
        response: "Login failed! Please try again"
      })
    }
  } catch (e) {
    res.status(500).json({
      success: false,
      response: e
    })
  }
});

// authentication:
const authenticateUser = async (req, res, next) => {
  const user = await User.findOne({accessToken:req.header('Authorization')});
  if(user) {
    req.user = user;
    next();
  } else {
    res.status(401).json({loggedOut: true});
  }
}

app.get('/secrets', authenticateUser);
app.get('/secrets', (req, res) => {
  res.json({secret: 'This is a super secret message only for registered users!'})
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
