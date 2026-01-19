
const express = require('express');
const morgan = require('morgan')

//importing router
const tourRoutes = require('./routes/tourRoutes')
const userRoutes = require('./routes/userRoutes')
const authRoutes = require('./routes/authRoutes')

const appError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorControllers')


const app = express()

//middleware 

// parse json come from request body

app.use(express.json())

// serving static file from 'public' folder

app.use(express.static('public'))


//creating own middleware

// app.use((req , res , next) => {
//     console.log('hello from middleware');
//     next()
// })

// third party middleware 

app.use(morgan('dev'))



// handling routes

app.use('/api/v1/tours' ,  tourRoutes)
app.use('/api/v1/users' ,  userRoutes)

app.use('/api/v1/auth' , authRoutes)

// error handling of undefined route
app.use((req , res  , next) => {
 
      next(new appError(`cannot find ${req.originalUrl} on this server` , 404))
})

// global  error handler 
// console.log(globalErrorHandler)

app.use(globalErrorHandler)







module.exports = app;