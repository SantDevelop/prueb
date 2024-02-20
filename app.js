const express = require('express')
const dotenv = require('dotenv').config()
const path = require('path')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const session = require('express-session')
const bcrypt = require('bcryptjs')
const mysql = require('mysql2/promise')
const jwt = require('jsonwebtoken')

const homeRouter = require('./routes/home.js')
// const usersRouter = require('./routes/users.js')

const app = express()

app.set('appName', 'Juegos')
app.set('port', process.env.PUERTO)
app.set('case sensitive routing', true)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// app.use(session({
//     secret: process.env.SECRET,
//     resave: false,
//     saveUninitialized: false
// }))

// app.use(cookieParser());
app.use(session({
  secret: process.env.SECRETO,
  resave: false,
  saveUninitialized: true
}));

app.use(homeRouter)
// app.use(usersRouter)


const servidor = async () => {
    app.listen(app.get('port'))
    await console.log(`Server ${app.get('appName')} on port ${app.get('port')}`)
}

servidor()