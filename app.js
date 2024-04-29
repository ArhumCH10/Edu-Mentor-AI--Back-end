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
const paymentRoute = require('./routes/paymentRoute');
const paymentTeacherRoute = require('./routes/paymentTeacherRoute');
const messageRoutes = require('./routes/messageingRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const path = require("path");
const stripe =require('stripe')('sk_test_51Obp44KAlnAzxnFU9PrEBv0K27IsOThelFXmUSTkJk7nhzQ0V20hHm75bDPLsYnPnwWs52TIzmz61rUn1U3uQxH500Ob1C6BIw');
const URL =
  "mongodb+srv://ghous:12345@cluster0.xaycdod.mongodb.net/";

const app = express();
const Payment = require('./models/paymentSchema');


const endpointSecret = "whsec_89ce4dfa257aa3400235803ca071c550eb4111ddf8167f99ab24659cc6e4dcd5";

app.post('/webhook', express.raw({type: 'application/json'}), async(request, response) => {
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
        await Payment.updateOne({  sessionId: sessionID }, { paymentStatus: 'success' });
        console.log('Payment status updated to "success".');
      } catch (error) {
        console.error('Error updating payment status:', error);
      }
      break;
      case 'checkout.session.payment_failed':
      const failedSession = event.data.object;
      console.log("Failed Session object:", failedSession);

      try {
        await Payment.updateOne({ sessionID: sessionID  }, { paymentStatus: 'fail' });
        console.log('Payment status updated to "failed".');
      } catch (error) {
        console.error('Error updating payment status:', error);
      }
      break;

    case 'checkout.session.cancelled':
      const canceledSession = event.data.object;
      console.log("Canceled Session object:", canceledSession);

      try {
        await Payment.updateOne({ sessionID: sessionID  }, { paymentStatus: 'cancel' });
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

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.use( messageRoutes);
app.use( conversationRoutes);
app.use("/teacher", userRoutes);
app.use("/teacher", paymentTeacherRoute);
app.use("/student", paymentRoute);
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

