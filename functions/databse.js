// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
const express = require('express');
const router = express.Router();
const {initializeApp} = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { getAuth,onAuthStateChanged,signInWithEmailAndPassword } = require("firebase/auth");
const { collection, addDoc, getDocs } = require("firebase/firestore");

require('dotenv').config()

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const dbs = getFirestore(app);
const auth = getAuth()
async function signIn(email, password) {
  try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User signed in:", userCredential.user);
      onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User signed in:", user.uid);
        } else {
            console.log("No user is signed in");
        }
      });
  } catch (error) {
      console.error("Sign-in error:", error.message);
  }
}

// Example usage:
signIn(process.env.EMAIL, process.env.PASSWORD);

// onAuthStateChanged(auth, (user) => {
//   if (user) {
//       console.log("User signed in:", user.uid);
      
//   } else {
//       console.log("No user is signed in");
//   }
// });
router.post("/customer-data", async (req, res) => {
    
    const {custDetails, paymentDetails,itemDetails, amount} = req.body;
    
    custDetails.timestamp=new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    paymentDetails.totalamount=amount
    console.log(custDetails, paymentDetails,itemDetails)
   
  try {
    const docRef = await addDoc(collection(dbs, "customers"), 
    {uid: auth.currentUser.uid, custDetails:custDetails,paymentDetails:paymentDetails,itemDetails:itemDetails});
    console.log("Customer added with ID: ", docRef.id);
  } catch (e) {
    res.status(500).json({ error: e.message });
    console.error("Error adding customer: ", e);
  }
})

router.get("/fetch-data", async(req, res)=>{
  try{
    const querySnapshot = await getDocs(collection(dbs,"customers"))
    // querySnapshot.forEach((doc) => {
    //   console.log(`${doc.id} =>`, doc.data());
    // });
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
     console.log("Data",data)
    res.json(data);
    // docRef.forEach(element => {
      
    // });
  }catch(e){
    res.status(500).json({ error: e.message });
    console.error("Error getting customer: ", e);
  }
})

module.exports = router;


// Example usage
// addCustomer(db, { name: "John Doe", email: "john.doe@example.com", age: 30 });
// custDetails:custDetails,paymentDetails:paymentDetails,itemDetails:itemDetails