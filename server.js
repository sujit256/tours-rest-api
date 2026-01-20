const mongoose = require('mongoose')
const dotenv = require('dotenv');
    dotenv.config({path:'./.env'})
  

    
    const db  = process.env.MONGO_DB
    
    
    mongoose.connect(db).then(() => {
        console.log('database connected')
    }).catch((err) => {
        console.log('database connection failed' , err)
    })
    
 const app = require('./app')




const port = process.env.PORT || 8000;

app.listen( port , () => {
    console.log(`listening at port 8000`);
})