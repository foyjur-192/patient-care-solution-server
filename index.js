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



app.get('/booking',  async (req, res) => {
  const query = {};
  const cursor = bookingCollection.find(query);
  const booking = await cursor.toArray();
  res.send(booking);
});


//Report Delivery
app.post('/report', async( req, res) => {
  const report = req.body;
 const query = {reports: report.reports, date:report.date, patientName: report.patient}  //cannot take same service several time
 const exists = await reportCollection.findOne(query)
 if(exists){
   return res.send({success: false, report: exists})
 }
 const result = await reportCollection.insertOne(report);
  return res.send({success: true, result});
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