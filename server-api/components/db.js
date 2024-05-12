const { MongoClient } = require('mongodb')

require('dotenv').config()

const url = process.env.DATABASE_URL
const options = { useNewUrlParser: true, useUnifiedTopology: true, connectTimeoutMS: 5000, serverSelectionTimeoutMS: 5000 }

let _db

exports.connect = async () => {
    try {
        const client = await MongoClient.connect(url, options)
        _db = client.db(process.env.DATABASE_NAME)

        console.log("Connected to Mongodb!")
    } catch (err) {
        console.log(err)
        console.log("Error in Mongodb connection!")
    }
}

exports.configs = {
    CHATS_PER_PAGE: 10,
    MESSAGES_PER_PAGE: 10,
    USERS_PER_PAGE: 10
}

exports.collections = {
    chat: "chat",
    message: "message",
    user: "user"
}

exports.getChatCollection = () => _db.collection('chat')
exports.getMessageCollection = () => _db.collection('message')
exports.getUserCollection = () => _db.collection('user')
