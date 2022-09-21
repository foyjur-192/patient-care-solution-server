const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;

//Body Parser

// const fileUpload = require('express-fileupload');
// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json());


app.use(cors());
app.use(express.json());


// JWT Function

function verifyJWT (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
   return res.status(401).send({ message: 'UnAuthorized access' });
    }
  const token = authHeader.split(' ')[1];
 jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
       return res.status(403).send({message: 'Forbidden access'})
     }
   req.decoded = decoded;
     next();
   });
}




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8ik9x.mongodb.net/?retryWrites=true&w=majority` ;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 }); 















async function run(){

try{

    await client.connect();
    const dataCollection = client.db('doctor-details').collection('data')
    const bookingCollection = client.db('doctor-details').collection('booking')
    const patientsCollection = client.db('doctor-details').collection('patients')
    const reportCollection = client.db('doctor-details').collection('report')
    const prescriptionCollection = client.db('doctor-details').collection('prescription')
    const pressureDataCollection = client.db('doctor-details').collection('bloodPressure')
    const heartDataCollection = client.db('doctor-details').collection('heartProblem')

 //Api Naming Convention
// Verify Admin
// const verifyAdmin = async (req, res, next) => {
//   const requester = req.decoded.email;
//   const requesterAccount = await patientsCollection.findOne({ email: requester });
//   if (requesterAccount.role === 'admin') {
//     next();
//   }
//   else {
//     res.status(403).send({ message: 'forbidden' });
//   }
// }

//Get Admin
app.get('/admin/:email', verifyJWT, async(req, res) => {
  const email = req.params.email;
  const user = await patientsCollection.findOne({email: email});
  const isAdmin = user.role === 'admin';
  res.send({admin: isAdmin});
})



//Make Admin

  app.put('/users/admin/:email',verifyJWT, async (req, res) => {
    const email = req.params.email;
   const requester = req.decoded.email;
   const requesterAccount = await patientsCollection.findOne({email: requester})
  if(requesterAccount.role === 'admin'){
    const filter = { email: email };
    const updateDoc = {
      $set: { role: 'admin' },
    };
    const result = await patientsCollection.updateOne(filter, updateDoc);
    res.send(result);
  }
  else{
    res.status(403).send({message: 'forbidden access'});
  }
   
  })

  // app.put('/users/admin/:email', verifyJWT, async (req, res) => {
  //   const email = req.params.email;
  //   const filter = { email: email };
  //   const updateDoc = {
  //     $set: { role: 'admin' },
  //   };
  //   const result = await patientsCollection.updateOne(filter, updateDoc);
  //   res.send(result);
  // })




//User Added
app.put('/users/:email', async(req, res) => {
  const email = req.params.email;
  const user = req.body;
  const filter = {email: email};
  const options = { upsert: true};
  const updateDoc = {
    $set: user,
  };
  const result = await patientsCollection.updateOne(filter, updateDoc, options);
  const token = jwt.sign({email:email}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
  res.send({result, token});
  
  
  })



    //Doctor Data
    app.get('/users',verifyJWT, async (req, res) => {
      const users = await patientsCollection.find().toArray();
      res.send(users);
    });

    //Doctors
    app.get('/data', async (req, res) => {
      const users = await dataCollection.find().toArray();
      res.send(users);
    });
    

   

//Appointments objects
   app.post('/booking', async( req, res) => {
   const booking = req.body;
  const query = {appointment: booking.appointment, date:booking.date, patient: booking.patient}  //cannot take same service several time
  const exists = await bookingCollection.findOne(query)
  if(exists){
    return res.send({success: false, booking: exists})
  }
  const result = await bookingCollection.insertOne(booking);
   return res.send({success: true, result});
   })
 

// Appointment Data
app.get('/appointment', async(req, res) => {
  const email = req.query.email;
  console.log(email);
    const query = {patientEmail: email};
    const cursor = bookingCollection.find(query);
    const booking  = await cursor.toArray();
   res.send(booking);
})

//Data for doctor appointment
app.get('/patientAppointment', async(req, res) => {
  const email = req.query.email;
  console.log(email);
    const query = {doctorEmail: email};
    const cursor = bookingCollection.find(query);
    const booking  = await cursor.toArray();
   res.send(booking);
})


app.get('/userData', async(req, res) => {
  const email = req.query.email;
  console.log(email);
    const query = {email: email};
    const cursor = dataCollection.find(query);
    const price  = await cursor.toArray();
   res.send(price);
})

app.get('/priceData/:id', async(req, res) =>{
  const id = req.params.id;
  const query = {_id: ObjectId(id)};
  const priceData = await dataCollection.findOne(query);
  res.send(priceData);
})


app.get('/booking',  async (req, res) => {
  const query = {};
  const cursor = bookingCollection.find(query);
  const booking = await cursor.toArray();
  res.send(booking);
});


//Report Delivery
// const fileUpload = require('express-fileupload')
// app.use(fileUpload({
// useTempFiles: true,
// tempFileDir: 'reportCollection'

// }))






app.post('/report', async( req, res) => {
  const report = req.body;
 const query = {reports: report.reports, time: report.time, patientName: report.patientName}  //cannot take same service several time
 const exists = await reportCollection.findOne(query)
 if(exists){
   return res.send({success: false, report: exists})
 }
 const result = await reportCollection.insertOne(report);
  return res.send({success: true, result});
  })



//Prescription
app.post('/prescriptionData', async( req, res) => {
  const prescriptionData = req.body;
 const query = {prescriptions: prescriptionData.prescriptions, date:prescriptionData.date, patient: prescriptionData.patient}  //cannot take same service several time
 const exists = await prescriptionCollection.findOne(query)
 if(exists){
   return res.send({success: false, report: exists})
 }
 const result = await prescriptionCollection.insertOne(prescriptionData);
  return res.send({success: true, result});
  })

  app.get('/dataForSearch',  async (req, res) => {
    const query = {};
    const cursor = prescriptionCollection.find(query);
    const dataForSearch = await cursor.toArray();
    res.send(dataForSearch);
  });



//Payment get
// app.get('/payment/:id', async(req, res) =>{
// const id = req.params.id;
// const query = {_id: ObjectId(id)};
// const payment = await dataCollection.findOne(query);
// res.send(payment);
// })







//Prescription for patient
app.get('/prescriptionMedicine', async(req, res) => {
  const email = req.query.email;
    const query = {patientEmail: email};
    const cursor = prescriptionCollection.find(query);
    const doctorDetails  = await cursor.toArray();
   res.send(doctorDetails);
})








//Patient Reports for doctors
app.get('/patientReport', async(req, res) => {
  const email = req.query.email;
  console.log(email);
    const query = {doctorEmail: email};
    const cursor = reportCollection.find(query);
    const patientReport  = await cursor.toArray();
   res.send(patientReport);
})


//Patient Reports for patient
app.get('/userReport',verifyJWT, async(req, res) => {
  const email = req.query.email;
   const decodedEmail = req.decoded.email;
   if(email === decodedEmail){
    const query = {patientEmail: email};
    const cursor = reportCollection.find(query);
    const userReport  = await cursor.toArray();
   res.send(userReport);
   }
    
})

//Reports for Diagnostic Center dashboard
app.get('/diagnosticCenter', async(req, res) => {
  const email = req.query.email;
  console.log(email);
    const query = {diagnosticCenter: email};
    const cursor = reportCollection.find(query);
    const diagnosticCenter  = await cursor.toArray();
   res.send(diagnosticCenter);
})

//Doctor Details
app.get('/doctorDetails', async(req, res) => {
  const email = req.query.email;
    const query = {email: email};
    const cursor = dataCollection.find(query);
    const doctorDetails  = await cursor.toArray();
   res.send(doctorDetails);
})


//Patient data get
app.get('/patientData', async(req, res) => {
  const email = req.query.email;
    const query = {email: email};
    const cursor = patientsCollection.find(query);
    const patientData  = await cursor.toArray();
   res.send(patientData);
})


//Blood Pressure Data

//Add data to database
// app.post("/pressureData", async(req, res) => {
//   const pressureData = req.body;
//   const result = await pressureDataCollection.insertOne(pressureData);
//   res.send({success: true,  result});
// })

app.put('/pressureData/:id', async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const updatedQuantity = req.body;
  console.log(updatedQuantity);
  const filter = { _id: ObjectId(id) };
  const options = { upsert: true };
  const updatedValue = {
      "$set": {updatedQuantity}
  };
  console.log(updatedValue);
  const result = await pressureDataCollection.updateOne(filter, updatedValue, options);
  res.send(result);

})













//Add data to database
app.post("/data", async(req, res) => {
  const data = req.body;
  const result = await dataCollection.insertOne(data);
  res.send({success: true,  result});
})



//get Blood Pressure Data
app.get('/pressureData', async(req, res) => {
  const email = req.query.email;
    const query = {email: email};
    const cursor = pressureDataCollection.find(query);
    const pressureData  = await cursor.toArray();
   res.send(pressureData);
})

//Stripe Payment
// app.post('/create-payment-intent', async(req, res) => {
// const service = req.body;
// const price = service.price;
// const amount = price*100;
// const paymentIntent = await stripe.paymentIntents.create({
//   amount: amount,
//   currency: 'usd',
//   payment_method_types:['card']
// });

// res.send({clientSecret: paymentIntent.client_secret,
// });
// });

  //Heart problem update
  app.post("/heartData", async(req, res) => {
    const heartData = req.body;
    const result = await heartDataCollection.insertOne(heartData);
    res.send({success: true,  result});
    })

//get Blood Pressure Data
app.get('/heartData', async(req, res) => {
  const email = req.query.email;
    const query = {email: email};
    const cursor = heartDataCollection.find(query);
    const heartData  = await cursor.toArray();
   res.send(heartData);
})






}

finally{

}

}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Searching-Doctor app listening on port ${port}`)
})