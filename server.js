const express = require("express");
const Razorpay = require("razorpay");
const nodemailer = require("nodemailer");
const dataRoutes = require("./databse")

require('dotenv').config()
const app = express();
app.use(express.json());
const cors = require('cors');
const corsOptions ={
    origin:[process.env.ORIGIN,process.env.ORIGIN_ADMIN], 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));
app.use('/api',dataRoutes)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID, // Replace with your Razorpay Key ID
    key_secret: process.env.RAZORPAY_KEY_SECRET, // Replace with your Razorpay Key Secret
});

const transporter = nodemailer.createTransport({
    service: "gmail",
    // port: 587,
    // secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.AANGAN_EMAIL,
      pass: process.env.AANGAN_EMAIL_PASSWORD,
    },
  });

app.post("/create-order", async (req, res) => {
    const { amount, currency } = req.body;

    const options = {
        amount: amount * 100, // Convert to smallest currency unit (e.g., paise for INR)
        currency: currency || "INR",
        receipt: `receipt_${Date.now()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/customer-query", async(req, res)=>{
  console.log(req.body)
  const {name, email,message} = req.body;

  try {
      const mailOptions = {
        // from: email,
        to:process.env.AANGAN_EMAIL,
        // subject: 'AANGAN order details',
        // text: `Hi ${custDetails.fullName} you have received this mail because you bought something from AANGAN of amount ${amount}.${paymentDetails.razorpay_order_id}`,
        subject: "Customer Query",
        html: `
        <h3>Query from ${name}</h3>
          <p>${message}</p>
          <p>Email: ${email}</p>
        `,
      };
  
      const info = await transporter.sendMail(mailOptions);
      res.status(200).send({ message: 'Query mail sent successfully', info: info.response });
    } catch (error) {
      res.status(500).send({ message: 'Failed to send query email', error: error.message });
    }
})

app.post("/order-details", async(req, res)=>{
    console.log(req.body)
    const {custDetails, paymentDetails,itemDetails,amount} = req.body;
// console.log(custDetails,paymentDetails)
const itemList = itemDetails.map((item) => `<li>${item.name} (x${item.quantity}) - $${item.price * item.quantity}</li>`).join("");
    try {
        const mailOptions = {
          from: process.env.AANGAN_EMAIL,
          to:custDetails.email,
          // subject: 'AANGAN order details',
          // text: `Hi ${custDetails.fullName} you have received this mail because you bought something from AANGAN of amount ${amount}.${paymentDetails.razorpay_order_id}`,
          subject: `Order Confirmation - Order #${paymentDetails.razorpay_order_id}`,
          html: `
          <h2>Hi ${custDetails.fullName}</h2>
            <h2>Thank you for your order!</h2>
            <p>Your order ID is: <strong>${paymentDetails.razorpay_order_id}</strong></p>
            <h3>Order Details:</h3>
            <ul>${itemList}</ul>
            <p><strong>Total Amount:</strong> $${amount}</p>
            <p>We will notify you once your order is shipped.</p>
            <p>Best regards,</p>
            <p><strong>AANGAN</strong></p>
          `,
        };
    
        const info = await transporter.sendMail(mailOptions);
        res.status(200).send({ message: 'Email sent successfully', info: info.response });
      } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send({ message: 'Failed to send email', error: error.message });
      }
})

app.listen(8080, () => console.log("Server running on port 8080"));
