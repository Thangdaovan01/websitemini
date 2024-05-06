const path = require('path');
const express = require('express');
const morgan = require('morgan');
const handlebars = require('express-handlebars');
const db = require('./config/db');
const methodOverride = require('method-override')
//import { handlebars } from 'express-handlebars';
const route = require('./routes');
const app = express();
const port = 3000;

//COnnect DB
db.connect();

app.use(express.static(path.join(__dirname, 'public')))
// app.use(morgan('combined'));
app.use(express.urlencoded({
    extended: true
})); //middleware xu li form
app.use(express.json());

app.use(methodOverride('_method'))

//Tempalte engine
app.engine('hbs', handlebars.engine({
    extname: '.hbs', //Thay đổi định dạng đuôi .handlebars
    helpers: {
        sum: (a, b) => a + b,
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));


route(app);

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
})