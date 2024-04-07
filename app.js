const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const loginRoutes = require("./routes/loginRoutes");
const userRoutes = require("./routes/signUpRoutes");
const teacherData = require("./routes/teacherRoutes");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");
const uploadPhoto = require('./routes/uploadPhoto');
const studentData = require('./routes/studentData');
const studentProfile = require('./routes/studentProfile');
const path = require("path");
const URL =
  "mongodb+srv://supremebilal78:t5OxJKSK26h9q9YU@test-db.v6p1fbj.mongodb.net/";

const app = express();

app.use(express.json());

app.use(cors());

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.use("/teacher", userRoutes);
app.use("/student", studentRoutes);
app.use("/student", studentData);
app.use("/student", studentProfile);
app.use(loginRoutes);
app.use(teacherData);
app.use(uploadPhoto);
app.use("/admin", adminRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
mongoose
  .connect(URL)
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });
