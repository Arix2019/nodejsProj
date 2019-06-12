/**
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://Arix:<password>@cluster0-vritr.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});

*/
if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb+srv://Arix:arix1983@cluster0-vritr.mongodb.net/test?retryWrites=true&w=majority"}
}else {
    module.exports = {mongoURI: "mongodb://localhost/blogAppDB"}
}