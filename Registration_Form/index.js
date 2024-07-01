
var express=require("express");
var bodyParser=require("body-parser");
var mongoose=require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const app=express();
app.use(express.static('assets'));
app.set('view engine', 'ejs');
app.use(bodyParser.json())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
    extended:true
}))


//create nodemailer transport
const transporter = nodemailer.createTransport({
    service:"Gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "josephinesalomy.t.2018.cse@ritchennai.edu.in",
    pass: "fqal rybb bgug ubcx",
  },
});


//connecting with mongodb
mongoose.connect('mongodb://localhost:27017/Login')
var db=mongoose.connection
db.on('error',()=> console.log("Error in Connecting to Database"))
db.once('open',()=> console.log("Connected to Database"))




//when form is submitted, form action-/sign_up does the post method using this
app.post("/sign_up", (req, res) => {
    var name = req.body.name;
    var subject = req.body.subject;
    var email = req.body.email;
    var phno = req.body.phno;
    var priority = req.body.priority;
    var password = req.body.password;
    var description = req.body.description;
    let uuid = crypto.randomUUID();//random id
    

    //encrypt password
    const saltRounds = 10;
    bcrypt.genSalt(saltRounds, function (saltError, salt) {
        if (saltError) {
            throw saltError;
        } else {
            bcrypt.hash(password, salt, function(hashError, hash) {
                if (hashError) {
                    throw hashError;
                } else {
                    // Replace the plain password with the hashed password
                    password = hash;

                    
                    var data = {
                        _id:uuid,
                        name: name,
                        subject: subject,
                        email: email,
                        phno: phno,
                        priority: priority,
                        password: password, 
                        description: description
                    };

                    //insert data to database
                    db.collection('loginData').insertOne(data, (err, collection) => {
                        if (err) {
                            throw err;
                        }
                        console.log("Record Inserted Successfully");

        //mail to client
        const info = transporter.sendMail({
            from: '"Sandeza Support 👻" <josephinesalomy.t.2018.cse@ritchennai.edu.in>',
            to: `${name} <${email}>`, // Use the email from the form data
            subject: subject,
            text: "",
            html: `<div style="font-family: Arial, sans-serif; font-size: 16px;max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7f7f7;line-height: 2.6; border-radius: 10px;">
            <div style="margin-bottom:60px;">Hi <strong>${name},</strong><br> 
            Your ticket is received. An agent will be assigned to look into your ticket soon<br></div>
            
            <div>
            <hr style="width:90%;border-bottom: 1px solid white; float:left; margin-right">
            <small><p>Thanks & Regards,</p><p>Sandeza Support Team</small></p></div>
            </div>`
        });

        //mail to admin
        const infoAdmin = transporter.sendMail({
            from: '"New Ticket 👻"<josephinesalomy.t.2018.cse@ritchennai.edu.in>',
            to: '"Sandeza Support 👻" <josephinesalomy.t.2018.cse@ritchennai.edu.in>', 
            subject: subject,
            text: "",
            html: `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7f7f7; border-radius: 10px;">
            <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6;">
                <p>Hello Admin,</p>
                <p>A new ticket has been raised. The details of the ticket are attached below. Please resolve it.</p>
                <ul style="list-style-type: none; padding: 0;">
                    <li style="margin-bottom: 15px;"><strong>Name:</strong> ${name}</li>
                    <li style="margin-bottom: 15px;"><strong>Contact:</strong> ${phno}</li>
                    <li style="margin-bottom: 15px;"><strong>Email:</strong> ${email}</li>
                    <li style="margin-bottom: 15px;"><strong>Description:</strong> ${description}</li>
                    <li style="margin-bottom: 15px;"><strong>Priority:</strong> ${priority}</li>
                </ul>
            </div>
        </div>
        `
        
        });
        res.redirect('signup_successful.html');
        });
        }
    });
    }
    });
});




//gets data and shows in fetchData.ejs
app.get("/fetchData", async (req, res) => {
    try {
        //connect with the collection in your database
        const collection = db.collection("loginData");

        //find all the data from ur collection and store in data variable
        const data = await collection.find({}).toArray();

        //send data got from mongodb to fetchData.ejs
        res.render('fetchData',{data:data});
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Internal Server Error");
    }
     
});


app.get("/",(req,res) => {
    res.set({
        //for CORS
        "Allow-acces-Allow-Origin":'*'
    })
    return res.redirect('index.html')
}).listen(3000);

console.log("Listening on port 3000")