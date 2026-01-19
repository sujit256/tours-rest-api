const mongoose = require('mongoose')
const fs = require('fs')
const Tour = require('./models/tourModels')
const dotenv = require('dotenv')
   dotenv.config({path:'./config.env'})


const db = process.env.MONGO_DB



mongoose.connect(db).then(("database connect successfully"))

const tours = JSON.parse(fs.readFileSync('./tours-simple.json' , 'utf-8'))
console.log(tours)

console.log(process.argv)

const importData =  async () => {
     try{
          await Tour.create(tours)
     }
     catch(err) {
         console.log(err)
     }
}


const deleteData = async ()  => {
    try{
        await Tour.deleteMany()
   }
   catch(err) {
       console.log(err)
   }
}

if(process.argv[2] === '--importdata'){
      importData()
}
else if(process.argv[2] === '--deletedata'){
     deleteData()
}