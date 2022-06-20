const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

require('dotenv').config();
const MONGO_URL = process.env.MONGO_URL

mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUniFieldTopology: true,
    useCreateIndex: true 
}).then(() => console.log("Conexão realizada com Sucesso")).catch((err) => console.log(err));
