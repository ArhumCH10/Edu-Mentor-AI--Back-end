const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const loginRoutes = require("./routes/loginRoutes");
const userRoutes = require("./routes/signUpRoutes");
const teacherData = require("./routes/teacherRoutes");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");
const uploadPhoto = require('./routes/uploadPhoto');
const studentData = require('./routes/studentData');
const studentProfile = require('./routes/studentProfile');
const messageRoutes = require('./routes/messageingRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const sendMessageUploadsRouter = require('./routes/sendMessageFile');
const path = require("path");
const io = require("socket.io")(8000, {
  cors: {
    origin: "http://localhost:5173",
  }
});
const stripe = require('stripe')('sk_test_51Obp44KAlnAzxnFU9PrEBv0K27IsOThelFXmUSTkJk7nhzQ0V20hHm75bDPLsYnPnwWs52TIzmz61rUn1U3uQxH500Ob1C6BIw');
const URL =
  "mongodb+srv://Edu-Mentor-AI:12345@edu-mentor-ai.rz8ecva.mongodb.net/";

const app = express();

const Payment = require('./models/paymentSchema');
const endpointSecret = "whsec_89ce4dfa257aa3400235803ca071c550eb4111ddf8167f99ab24659cc6e4dcd5";

app.post('/webhook', express.raw({ type: 'application/json' }), async (request, response) => {
  const sig = request.headers['stripe-signature'];
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
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log("Session object:", session);
      const sessionID = session.id;

      try {
        await Payment.updateOne({ sessionId: sessionID }, { paymentStatus: 'success' });
        console.log('Payment status updated to "success".');
      } catch (error) {
        console.error('Error updating payment status:', error);
      }
      break;
    case 'checkout.session.payment_failed':
      const failedSession = event.data.object;
      console.log("Failed Session object:", failedSession);

      try {
        await Payment.updateOne({ sessionID: sessionID }, { paymentStatus: 'fail' });
        console.log('Payment status updated to "failed".');
      } catch (error) {
        console.error('Error updating payment status:', error);
      }
      break;

    case 'checkout.session.cancelled':
      const canceledSession = event.data.object;
      console.log("Canceled Session object:", canceledSession);

      try {
        await Payment.updateOne({ sessionID: sessionID }, { paymentStatus: 'cancel' });
        console.log('Payment status updated to "canceled".');
      } catch (error) {
        console.error('Error updating payment status:', error);
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

app.use(express.json());
app.use(cors());
const Student = require("./models/studentSchema");
const Teacher = require("./models/teacherSchema");
app.get("/student/payments", async (req, res) => {
  try {
    const userEmail = req.query.email; 
    console.log(userEmail);
    const student = await Student.findOne({ email: userEmail }).exec();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const payments = await Payment.find({ studentId: student.username, paymentStatus: 'success' }).exec();

    if (payments.length === 0) {
      return res.status(404).json({ message: "No successful payments found for this student." });
    }

    const results = [];

    for (const payment of payments) {
        const teacher = await Teacher.findOne({ email: payment.teacherId }).exec();
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
                paymentDate : payment.paymentDate,
               profilePhoto: teacher.profilePhoto, 
               introduceYourself: teacher.profileDescription.introduceYourself,
                subjectsTaught: teacher.subjectsTaught,
                    countryOrigin: teacher.countryOrigin,
                    languagesSpoken: teacher.LanguageSpoken.join(', '),
                    subjectsTaught: teacher.subjectsTaught,
                    hourlyRate: teacher.hourlyPriceUSD
            });
        }
    }

    res.json(results);
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
});

app.get("/teacher/payment", async (req, res) => {
  try {
    const token = req.query.token; 
    const decodedToken = jwt.verify(token, "teacherSecretKey");
    const userId = decodedToken.userId;
    console.log(userId);
    const teacher = await Teacher.findOne({ _id: userId }).exec();

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const payments = await Payment.find({ teacherId: teacher.email, paymentStatus: 'success' }).exec();

    if (payments.length === 0) {
      return res.status(404).json({ message: "No successful payments found for this student." });
    }

    const results = [];

    for (const payment of payments) {
        const student = await Student.findOne({ username: payment.studentId }).exec();
        console.log(student);
        if (student) {
            results.push({
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

const  Message  = require('./models/message');

let connectedClients = [];

io.on("connection", (socket) => {

  // Store user information when a client connects
  socket.on("addUser", (userId) => {
    const isUserExist = connectedClients.find((user) => user.userId === userId);
    if (!isUserExist) {
      console.log("New client connected:", socket.id);

      const user = { userId: userId, socketId: socket.id };
      connectedClients.push(user);
      io.emit('getUser', connectedClients);
    }else{
      console.log('user Exists alredy');
    }
  });
  socket.on('disconnect', () => {
    //connectedClients = connectedClients.filter((user) => user.socketId !== socket?.id);  crashed
    const index = connectedClients.findIndex((user) => user.socketId === socket?.id);
    if (index !== -1) {
      connectedClients.splice(index, 1);
      io.emit('getUser', connectedClients);
    }
    io.emit('getUser', connectedClients);
    
  });

  socket.on('sendMessage', async (msgdata) => {
    const reciever = connectedClients.find((user) => user.userId === msgdata.recieverId);
    console.log('data',msgdata);
    console.log('reciever find in connected clients: ',reciever);
    if(reciever){
      io.to(reciever.socketId).emit('getMessage', msgdata);
    }
    io.to(socket.id).emit('sendItself', msgdata);
    const { conversationId, senderId, text,type ,date, data } = msgdata;
    const newMessage = new Message({ conversationId, senderId, message:text, type,date,data});
    await newMessage.save();
  })
  
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.use(messageRoutes);
app.use(conversationRoutes);
app.use(sendMessageUploadsRouter);
app.use("/teacher", userRoutes);
app.use("/student", studentRoutes);
app.use("/student", studentData);
app.use("/student", studentProfile);
app.use(loginRoutes);
app.use(teacherData);
app.use(uploadPhoto);
app.use("/admin", adminRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/sendMessageUploads", express.static(path.join(__dirname, "sendMessageUploads")));
mongoose
  .connect(URL)
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });

