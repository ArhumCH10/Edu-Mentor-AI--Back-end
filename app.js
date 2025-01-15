const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const Student = require("./models/studentSchema");
const Teacher = require("./models/teacherSchema");
const loginRoutes = require("./routes/loginRoutes");
const userRoutes = require("./routes/signUpRoutes");
const teacherData = require("./routes/teacherRoutes");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");
const uploadPhoto = require("./routes/uploadPhoto");
const studentData = require("./routes/studentData");
const studentProfile = require("./routes/studentProfile");
const messageRoutes = require("./routes/messageingRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const sendMessageUploadsRouter = require("./routes/sendMessageFile");
const trialClassRoutes = require("./routes/trialClassRoute");
const ConfirmLessonRoute = require("./routes/ConfirmLessonRoute");
const updateAvailabilityRoute = require("./routes/updateAvailabilityRoute");
const CustomOfferRoute = require('./routes/CustomOffer');

const reviewSchema = new mongoose.Schema({
  review: { type: String, required: true },
  date: { type: Date, default: Date.now },
  rating: { type: Number, required: true, min: 1, max: 5 },
});
const Review = mongoose.model("Review", reviewSchema);

const path = require("path");
// Update Socket.IO server configuration
const httpServer = require('http').createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["my-custom-header"],
  },
  allowEIO3: true,
  transports: ['websocket', 'polling'], // Allow both transports
  pingTimeout: 60000,
  pingInterval: 25000,
});
const stripe = require("stripe")(
  "sk_test_51Obp44KAlnAzxnFU9PrEBv0K27IsOThelFXmUSTkJk7nhzQ0V20hHm75bDPLsYnPnwWs52TIzmz61rUn1U3uQxH500Ob1C6BIw"
);
const URL =
  "mongodb+srv://Edu-Mentor-AI:12345@edu-mentor-ai.rz8ecva.mongodb.net/";

const app = express();

const Payment = require("./models/paymentSchema");
const endpointSecret =
  "whsec_89ce4dfa257aa3400235803ca071c550eb4111ddf8167f99ab24659cc6e4dcd5";

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    const sig = request.headers["stripe-signature"];
    console.log("webhook welcome....");
    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        console.log("Session object:", session);
        const sessionID = session.id;

        try {
          await Payment.updateOne(
            { sessionId: sessionID },
            { paymentStatus: "success" }
          );
          console.log('Payment status updated to "success".');
        } catch (error) {
          console.error("Error updating payment status:", error);
        }
        break;
      case "checkout.session.payment_failed":
        const failedSession = event.data.object;
        console.log("Failed Session object:", failedSession);

        try {
          await Payment.updateOne(
            { sessionID: sessionID },
            { paymentStatus: "fail" }
          );
          console.log('Payment status updated to "failed".');
        } catch (error) {
          console.error("Error updating payment status:", error);
        }
        break;

      case "checkout.session.cancelled":
        const canceledSession = event.data.object;
        console.log("Canceled Session object:", canceledSession);

        try {
          await Payment.updateOne(
            { sessionID: sessionID },
            { paymentStatus: "cancel" }
          );
          console.log('Payment status updated to "canceled".');
        } catch (error) {
          console.error("Error updating payment status:", error);
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

app.use(express.json());
app.use(cors());

app.get("/students/payments", async (req, res) => {
  try {
    const userEmail = req.query.email;
    console.log(userEmail);
    const student = await Student.findOne({ email: userEmail }).exec();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const payments = await Payment.find({
      studentId: student.username,
      paymentStatus: "success",
    }).exec();

    if (payments.length === 0) {
      return res
        .status(404)
        .json({ message: "No successful payments found for this student." });
    }

    const results = [];

    for (const payment of payments) {
      const teacher = await Teacher.findOne({
        email: payment.teacherId,
      }).exec();
      if (teacher) {
        results.push({
          teacherName: teacher.firstName + " " + teacher.lastName,
          amountPaid: payment.paymentAmount,
          lessonTimeDuration: payment.lessonTimeDuration,
          lessonDay: payment.lessonDay,
          lessonType: payment.lessonType,
          lessonDate: payment.trialLessonDate,
          paymentStatus: payment.paymentStatus,
          lessonTime: payment.lessonTime,
          paymentDate: payment.paymentDate,
          profilePhoto: teacher.profilePhoto,
          introduceYourself: teacher.profileDescription.introduceYourself,
          subjectsTaught: teacher.subjectsTaught,
          countryOrigin: teacher.countryOrigin,
          languagesSpoken: teacher.LanguageSpoken.join(", "),
          subjectsTaught: teacher.subjectsTaught,
          hourlyRate: teacher.hourlyPriceUSD,
        });
      }
    }

    res.json(results);
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
});

app.get("/teachers/payments", async (req, res) => {
  try {
    const token = req.query.token;
    const decodedToken = jwt.verify(token, "teacherSecretKey");
    const userId = decodedToken.userId;
    const teacher = await Teacher.findOne({ _id: userId }).exec();

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const payments = await Payment.find({
      teacherId: teacher.email,
      paymentStatus: "success",
    }).exec();

    if (payments.length === 0) {
      return res
        .status(404)
        .json({ message: "No successful payments found for this teacher." });
    }

    const results = [];

    for (const payment of payments) {
      const student = await Student.findOne({
        username: payment.studentId,
      }).exec();
      if (student) {
        results.push({
          teacherName: teacher.firstName + " " + teacher.lastName,
          studentName: student.name,
          amountPaid: payment.paymentAmount,
          lessonTimeDuration: payment.lessonTimeDuration,
          lessonDay: payment.lessonDay,
          lessonType: payment.lessonType,
          lessonDate: payment.trialLessonDate,
          lessonTime: payment.lessonTime,
          profilePhoto: student.profilePhoto,
          introduceYourself: student.description,
          subjectsTaught: teacher.subjectsTaught,
        });
      }
    }

    res.json(results);
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
});

const Message = require("./models/message");

let connectedClients = [];

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('🟢 New socket connection:', socket.id);

  socket.on("addUser", (userId) => {
    console.log('👤 addUser attempt:', { userId, socketId: socket.id });
    const isUserExist = connectedClients.find((user) => user.userId === userId);
    if (!isUserExist) {
      console.log("✅ New client connected:", socket.id);
      const user = { userId: userId, socketId: socket.id };
      connectedClients.push(user);
      console.log('📊 Current connected clients:', connectedClients);
      io.emit("getUser", connectedClients);
    }
  });

  socket.on('joinRoom', ({ roomId, userId, userRole, userName }) => {
    // Leave all other rooms first
    socket.rooms.forEach(room => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });

    socket.join(roomId);
    console.log(`🚪 ${userRole} ${userName} joined room: ${roomId}`);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        teacherPresent: false,
        teacherInCall: false,
        students: new Set(),
        teacherSocketId: null
      });
    }

    const room = rooms.get(roomId);
    
    if (userRole === 'teacher') {
      room.teacherPresent = true;
      room.teacherSocketId = socket.id;
      io.to(roomId).emit('teacherPresent', true);
      console.log(`👨‍🏫 Teacher ${userName} joined room: ${roomId}`);
    } else {
      room.students.add(socket.id);
      socket.emit('teacherPresent', room.teacherPresent);
      console.log(`👨‍🎓 Student ${userName} joined room: ${roomId}`);
    }
  });

  // WebRTC signaling events
  socket.on("offer", ({ offer, roomId, from }) => {
    console.log(`📤 Received offer from ${from} in room ${roomId}`);
    io.in(roomId).emit("offer", { offer, from });
  });
  
  socket.on('answer', ({ answer, roomId, from }) => {
    console.log(`📤 Received answer from ${from} in room ${roomId}`);
    io.in(roomId).emit('answer', { answer, from });
  });
  
  socket.on("ice-candidate", ({ candidate, roomId, from }) => {
    console.log(`📤 Received ICE candidate from ${from} in room ${roomId}`);
    io.in(roomId).emit("ice-candidate", { candidate, from });
  });

  socket.on("studentJoining", ({ roomId }) => {
    console.log(`👨‍🎓 Student joining call in room ${roomId}`);
    socket.to(roomId).emit("studentJoining", { roomId });
  });

  socket.on('teacherJoining', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.teacherPresent = true;
      io.to(roomId).emit('teacherPresent', true);
      console.log(`👨‍🏫 Teacher joining status updated for room: ${roomId}`);
    }
  });

  socket.on('teacherStartedCall', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.teacherInCall = true;
      room.teacherPresent = true;
      io.to(roomId).emit('teacherStartedCall');
      io.to(roomId).emit('teacherPresent', true);
      console.log(`👨‍🏫 Teacher started call in room: ${roomId}`);
    }
  });

  socket.on('checkTeacherPresence', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (room) {
      socket.emit('teacherPresent', room.teacherPresent);
      console.log(`ℹ️ Teacher presence check for room ${roomId}: ${room.teacherPresent}`);
    }
  });

  // Message handling
  socket.on("sendMessage", async (msgdata) => {
    console.log('💬 Message send attempt:', msgdata);
    const reciever = connectedClients.find(
      (user) => user.userId === msgdata.recieverId
    );
    if (reciever) {
      io.to(reciever.socketId).emit("getMessage", msgdata);
    }
    io.to(socket.id).emit("sendItself", msgdata);
  });

  socket.on("disconnect", () => {
    console.log('🔴 Socket disconnected:', socket.id);
    
    // Handle messaging clients
    const index = connectedClients.findIndex((user) => user.socketId === socket?.id);
    if (index !== -1) {
      connectedClients.splice(index, 1);
      io.emit("getUser", connectedClients);
    }

    // Handle room cleanup
    rooms.forEach((room, roomId) => {
      if (room.teacherSocketId === socket.id) {
        room.teacherPresent = false;
        room.teacherInCall = false;
        io.to(roomId).emit('teacherPresent', false);
        console.log(`👋 Teacher left room: ${roomId}`);
      }
      if (room.students.has(socket.id)) {
        room.students.delete(socket.id);
        console.log(`👋 Student left room: ${roomId}`);
      }
    });
  });
});

app.post("/api/reviews", async (req, res) => {
  const { review, rating } = req.query;

  console.log(`Received review: ${review}, rating: ${rating}`);

  if (!review || !rating) {
    return res.status(400).send("Review and rating are required.");
  }

  try {
    const newReview = new Review({ review, rating });
    console.log("New review object:", newReview);
    await newReview.save();
    res.status(201).json({ message: "Review submitted successfully!" });
  } catch (error) {
    console.error("Error saving review:", error);
    res.status(500).json({ error: "Error saving review" });
  }
});

app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await Review.find();
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Error fetching reviews" });
  }
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.use(messageRoutes);
app.use(CustomOfferRoute);
app.use(conversationRoutes);
app.use(trialClassRoutes);
app.use(sendMessageUploadsRouter);
app.use(ConfirmLessonRoute);
app.use(updateAvailabilityRoute);
app.use("/teacher", userRoutes);
app.use("/student", studentRoutes);
app.use(studentData);
app.use("/student", studentProfile);
app.use(loginRoutes);
app.use(teacherData);
app.use(uploadPhoto);
app.use("/admin", adminRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  "/sendMessageUploads",
  express.static(path.join(__dirname, "sendMessageUploads"))
);

const notifyStudent = (studentName, classDetails) => {
  io.emit("notifyStudent", { studentName, classDetails });
};

// Make notifyStudent function available globally
app.locals.notifyStudent = notifyStudent;
mongoose
  .connect(URL)
  .then(() => {
    // Start Express server
    app.listen(8080, () => {
      console.log('Express server running on port 8080');
    });
    
    // Start Socket.IO server
    httpServer.listen(8000, () => {
      console.log('Socket.IO server running on port 8000');
    });
  })
  .catch((err) => {
    console.log(err);
  });
