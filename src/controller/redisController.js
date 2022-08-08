const redis = require('redis')

const redisClient = redis.createClient ({
    url:"redis://default:mJsrV4ebvRJIpn0ffI1NV0rzOPulQ2qS@redis-16938.c74.us-east-1-4.ec2.cloud.redislabs.com:16938"
})


redisClient.connect()
.then(()=> console.log("redis connected Successfully"))
.catch((error)=> console.log(error))

module.exports = redisClient