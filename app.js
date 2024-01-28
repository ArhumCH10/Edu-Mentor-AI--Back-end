const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const loginRoutes = require("./routes/loginRoutes");
const userRoutes = require("./routes/signUpRoutes");
const teacherData = require("./routes/teacherRoutes");
const adminRoutes = require("./routes/adminRoutes");
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
app.use(loginRoutes);
app.use(teacherData);
app.use("/admin", adminRoutes);

mongoose
  .connect(URL)
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });
