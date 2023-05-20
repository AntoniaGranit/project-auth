import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt-nodejs"

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/auth";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const User = mongoose.model('User', {
  name: {
    type: String,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
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

// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Hello Technigo!");
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
