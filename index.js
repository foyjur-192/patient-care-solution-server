const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

 //Api Naming Convention

    //Doctor Data
    app.get('/data',  async (req, res) => {
        const query = {};
        const cursor = dataCollection.find(query);
        const data = await cursor.toArray();
        res.send(data);
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



app.get('/booking',  async (req, res) => {
  const query = {};
  const cursor = bookingCollection.find(query);
  const booking = await cursor.toArray();
  res.send(booking);
});


//Report Delivery
app.post('/report', async( req, res) => {
  const report = req.body;
 const query = {reports: report.reports, date: report.date, patientName: report.patientName}  //cannot take same service several time
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
app.get('/userReport', async(req, res) => {
  const email = req.query.email;
  console.log(email);
    const query = {patientEmail: email};
    const cursor = reportCollection.find(query);
    const userReport  = await cursor.toArray();
   res.send(userReport);
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