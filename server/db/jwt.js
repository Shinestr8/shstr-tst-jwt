const info = require('./dbconfig');
let MongoClient  = require('mongodb').MongoClient;

const username = info.username;
const password = info.password;



async function connectToCluster(uri) {
    let mongoClient;
 
    try {
        mongoClient = new MongoClient(uri);
        console.log('Connecting to MongoDB Atlas cluster...');
        await mongoClient.connect();
        console.log('Successfully connected to MongoDB Atlas!');
 
        return mongoClient;
    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        process.exit();
    }
 }

 async function executeStudentCrudOperations() {
    let mongoClient;
    let uri = `mongodb://${username}:${password}@192.168.1.35:27017/?authSource=admin`;
    try {
        mongoClient = await connectToCluster(uri);
        const db = mongoClient.db('jwt');
        const collection = db.collection('credentials');
        const data = await collection.find().toArray();
        console.log(data);  
    } finally {
        await mongoClient.close();
    }
 }

 executeStudentCrudOperations();