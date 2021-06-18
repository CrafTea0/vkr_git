const express = require('express')
const path = require('path')
const passport = require('passport')
const bodyParser = require('body-parser')
const sequelize = require('./utils/database')
const routerTasks = require('./routes/tasks')
const routerUsers = require('./routes/users')
const app = express()
const PORT = process.env.PORT || 3000

require('./middleware/passportBasicAuth')(passport)
require('./middleware/passportJWT')(passport)
app.use(passport.initialize())

app.use(express.static(path.join(__dirname,'public')))
//app.use(express.urlencoded({extended:true}))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/api/v1/tasks', routerTasks)
app.use('/api/v1/users', routerUsers)

//обработка ошибок, связанных с отсутствующим url
app.use(function(req, res, next){
    res.status(404);
    console.log('Not found URL: ' + req.url);
    res.json({ error: 'Not found URL:' + req.url});
    return;
});

//обработка ошибки 500
app.use(function(err, req, res, next){
    res.status(err.status || 500);
    console.log(`Internal error ${res.statusCode}: ${err.message}`);
    res.send({ error: `Internal error ${res.statusCode}: ${err.message}` });
    return;
});

//обработка внутренних ошибок сервера
app.get('/ErrorExample', function(req, res, next){
    next(new Error('Random error!'));
});

app.use((req,res,next) => {
    res.sendFile('/index.html')
})

async function start() {
    try {
        await sequelize.sync() //{force: true}
        app.listen(PORT)
    } catch(e) {
        console.log(e)
    }
}

start()
