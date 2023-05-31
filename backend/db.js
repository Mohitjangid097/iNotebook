const mongoose = require('mongoose');
// const mongoURI = "mongodb://localhost:27017/inotebook?directConnection=true"
const mongoURI = "mongodb+srv://root:root1@cluster0.fuef4me.mongodb.net/inotebook"

const connectToMongo = ()=>{
    mongoose.connect(mongoURI, ()=> {
        console.log("connection to mongo successfully");
    })
}

module.exports = connectToMongo; 

