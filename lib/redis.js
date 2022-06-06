const redis = require('redis')

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1'

const client = redis.createClient({host: REDIS_HOST, port:6379})

client.on("connect", (err)=> console.log("Redis connected"))
client.on("error", (err)=> console.log("Error encountered: ", err))

const connect = async ()=> await client.connect()

connect()

module.exports = client