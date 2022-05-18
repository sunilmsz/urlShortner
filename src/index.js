 const express = require("express")
 const bodyParser = require("body-parser")
 const mongoose = require("mongoose")
 const route = require("./routes/route.js")
 const app =  express();

 app.use(bodyParser.json())
 app.use(bodyParser.urlencoded({extended:true}))

 mongoose.connect("mongodb+srv://sunil:project4@project4.fnzqp.mongodb.net/group25Database?retryWrites=true&w=majority", {
        useNewUrlParser: true
    })
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))

app.use("/",route)

app.listen (3000)