const express = require('express')
const path = require('path');
const fs=require('fs');
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const placeRoutes = require('./routes/places-routes');
const userRoutes=require('./routes/users-routes');
const HttpError=require('./models/http-error');

const app=express();
app.use(bodyParser.json());

app.use('/uploads/images',express.static(path.join('uploads','images')));

app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Headers','Origin,X-Requested-With,Content-Type,Accept,Authorization');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE')
    next();
})
app.use('/api/places',placeRoutes);
app.use('/api/user',userRoutes);
app.use((req,res,next)=>{
    next(new HttpError('Could not find this route',404))
});

app.use((error,req,res,next)=>{
    if(req.file)
    {
        fs.unlink(req.file.path,(err)=>{
            console.log(err);
        });
    }
    if(res.headersSent)
    {
        return next(error);
    }
    res.status(error.code || 500)
    res.json(error.message || 'something went wrong');
});
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.x6e7vlw.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`).then(()=>{
    app.listen(process.env.PORT || 5000);
}).catch((err)=>{
    console.log(err);
});