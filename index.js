const express = require('express');
const path = require('path');
const webRouter = require('./routes/webRouter');
const apiRouter = require('./routes/apiRouter');
// const route = require('./routes');

const bodyParser = require('body-parser'); 
const methodOverride = require('method-override');
const app = express();
const db = require('./db');

const port = 3000;

//COnnect DB
db.connect(); 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set("views", "./view");
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

app.use(methodOverride('_method'));

app.use('/', webRouter);
app.use('/api', apiRouter);
// route(app);


// app.listen(port, () => {
//     console.log(`Example app listening on port http://localhost:${port}`);
// })
const server = app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
})


console.log(`Example app liste`);
const io = require('socket.io')(server);

let socketsConected = new Set();

io.on('connection', onConnected);

function onConnected(socket) {
    console.log('Socket connected', socket.id);
    socketsConected.add(socket.id);
    io.emit('clients-total', socketsConected.size);

    socket.on('disconnect', () => {
        console.log('Socket disconnected', socket.id)
        socketsConected.delete(socket.id)
        io.emit('clients-total', socketsConected.size)
    })

    socket.on('message', (data) => {
        console.log("data",data)
        socket.broadcast.emit('chat-message', data)
    })
    
    
    // socket.on('feedback', (data) => {
    //     socket.broadcast.emit('feedback', data)
    // })
}