import express from "express";
import cors from "cors";
import mongoose from "mongoose";
<<<<<<< HEAD
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
=======
import crypto from "crypto";
import bcrypt from "bcrypt-nodejs"

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/auth";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const User = mongoose.model('User', {
  name: {
>>>>>>> 856f0e329a8d031a9db4fd3a2ebd1395ad352cd3
    type: String,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
<<<<<<< HEAD
    default: () => crypto.randomBytes(128).toString('hex')
  }
});

userSchema.index({ username: 1 }, { unique: true })

const User = mongoose.model('User', userSchema);
=======
    // this creates a random string of "bytes" (a number or string of characters) that
    // is converted to hex (easier to store in database).
    // it's a unique identifier for the user when they log in.
    default: () => crypto.randomBytes(128).toString('hex')
  }
})

// const request = {name: "Bob", password: "foobar"};

// const dbEntry = {name: "Bob", password: "5abb22314332def"}

// bcrypt.compareSync(request.password, dbEntry.password);

// this saves a user but encrypts its password so that it's not stored in the database
// const user = new User({name:"Bob", password: bcrypt.hashSync("foobar") });
// user.save();


>>>>>>> 856f0e329a8d031a9db4fd3a2ebd1395ad352cd3

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

const authenticateUser = async (req, res, next) => {
const user = await User.findOne({accessToken: req.header('Authorization')});
if(user){
  req.user = user;
  next()
} else {
  res.status(401).json({loggedOut: true});
}
}

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

app.post("/sessions", async (req, res) => {
  const user = await User.findOne({name: req.body.name})
  if (user && bcrypt.compareSync(rec.body.password, user.passowrd)) {
    //Successful login
    res.json({userId: user._id, accessToken: user.accessToken});
  } else {
    //Unsuccessful login
    // a. user does not exist
    // b. encrypted password is incorrect
    res.json({notFound: true})
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
