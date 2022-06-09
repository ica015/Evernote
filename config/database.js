const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

mongoose.connect("mongodb://localhost/javascriptNote", {
    useNewUrlParser: true,
    useUniFieldTopology: true,
    useCreateIndex: true 
}).then(() => console.log("Conexão realizada com Sucesso")).catch((err) => console.log(err));
