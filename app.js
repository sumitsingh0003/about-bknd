const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const app = express();

dotenv.config({path: './config.env' }) ;
require('./db/connection');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({credentials: true, origin: 'https://sumit-auth.netlify.app/'}));
app.use(require('./router/authnt'));


app.all('*', (req, res, next) => {
   res.header("Access-Control-Allow-Origin", "*");
   next();
});


const port = process.env.PORT;

app.listen(port, (e) => {
   console.log(`The Server is Running. Port is ${port}`);
})