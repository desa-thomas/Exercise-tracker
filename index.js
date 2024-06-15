const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const mongoose = require("mongoose");
const dbfunc = require("./dbFunctions");
const bodyParser = require("body-parser");

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  userUnifiedTopology: true,
});

let userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
});

let exerciseSchema = new mongoose.Schema({
  user_id: { required: true, type: String },
  description: { required: true, type: String },
  duration: { required: true, type: Number },
  dateObj: { type: Date, default: Date.now },
  date: {type: String, default: new Date().toDateString()}
});

//Creating User and Exercise models
let User = new mongoose.model("User", userSchema, "User");
let Exercise = new mongoose.model("Exercise", exerciseSchema, "Exercise");

//Route handler for /api/users
app
  .route("/api/users")
  .post(function (req, res) {
    dbfunc.createUser(User, req.body.username, function (err, document) {
      if (err) return console.error(err);

      res.json({ username: document.username, _id: document._id });
    });
  })
  .get(function (req, res) {
    dbfunc.getAllUsers(User, function (err, userList) {
      if (err) return console.error(err);

      res.send(userList);
    });
  });

app.route("/api/users/:_id/exercises").post(function (req, res) {
  dbfunc.createExercise(
    User,
    Exercise,
    req.params._id,
    req.body.description,
    req.body.duration,
    req.body.date,

    function (err, user, exercise) {
      if (err) {
        res.status(400).send(err)

      } else {
        res.json({
          _id: user._id,
          username: user.username,
          date: exercise.date,
          duration: exercise.duration,
          description: exercise.description,
        });
      }
    }
  );
});

//?[from][&to][&limit]
app.get("/api/users/:_id/logs", function (req, res) {
  let query;
  if (Object.keys(req.query).length != 0) {
    query = req.query;
  } else {
    query = null;
  }
  dbfunc.getLog(
    User,
    Exercise,
    req.params._id,
    query,
    function (err, user, log) {
      if (err) {
        res.send(err);
      } else {
        let count = log.length;
        res.json({
          username: user.username,
          count: count,
          _id: user._id,
          log: log,
        });
      }
    }
  );
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
