const urlModel = require('../models/urlModel')
const redis = require('redis')
const { promisify } = require("util")

const connectRedis = redis.createClient(
    15198,
    "redis-15198.c212.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true })
connectRedis.auth("gRmuJaqLnTwKyB4VSZwhhUBTPnSfNbdy", function (err) {
    if (err) throw err;
});

connectRedis.on("connect", async function () {
    console.log("Connected to Redis..");
})

const SET_ASYNC = promisify(connectRedis.SET).bind(connectRedis);
const GET_ASYNC = promisify(connectRedis.GET).bind(connectRedis);



function randomSt(length) {
    let result = '';
    let characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

const createUrl = async (req, res) => {

    const { longUrl } = req.body
    if (!longUrl)
        return res.status(400).send({ status: false, message: "Please provide longUrl, it is mandatory" })

    const reg = /^(http(s)?:\/\/.)(www\.)?[-a-zA-Z0-9@:%.\+#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%\+.#?&//=_]*$)/g
    if ((typeof longUrl !== "string")  || !reg.test(longUrl.trim()))
        return res.status(400).send({ status: false, message: "Please provide valid Url" })
        let cahcedUrlData = await GET_ASYNC(longUrl)
        console.log(cahcedUrlData)
        if (cahcedUrlData) {
            console.log("data from cache")
            return res.status(201).send({status:true,data:JSON.parse(cahcedUrlData)}) 
            
        }
        // else {
        //     const isAlready = await urlModel.findOne({ longUrl }).lean()
        //     if (isAlready)
        //         return res.status(201).send({ status: true, data:{ longUrl,shortUrl:isAlready.shortUrl,urlCode:isAlready.urlCode} })
        // } 
       
    
    let endPoint;
    let condition = true;
    while (condition == true) {
        endPoint = randomSt(8)
        let UrlData = await GET_ASYNC(endPoint)
        // console.log(UrlData)
        if (!UrlData) {
            condition = false;
        }
        // const isPresent = await urlModel.findOne({ urlCode: endPoint }).count()
        // if (isPresent == 0)
        //     condition = false;
    }

    const savedData = await urlModel.create({ longUrl, urlCode: endPoint, shortUrl: "http://localhost:3000/" + endPoint })
    // console.log(savedData.longUrl)
    await SET_ASYNC(`${endPoint}`, longUrl)
    
    await SET_ASYNC(`${longUrl}`, JSON.stringify({longUrl,urlCode:endPoint,shortUrl:savedData.shortUrl}))
    return res.status(201).send({ status: true, data: { longUrl: savedData.longUrl, shortUrl: savedData.shortUrl, urlCode: savedData.urlCode } })
}

const getUrl = async function (req, res) {
    let params=req.params.urlCode
    let url = await GET_ASYNC(params)
    // let url = await urlModel.findOne({ urlCode: req.params.urlCode }).select({ longUrl: 1, _id: 0 })
    console.log(url)
    if (url) {
        return res.redirect(url)
    } else {
        return res.status(404).send({ status: false, Message: "No URL found" })
    }
}

module.exports = { createUrl, getUrl}


