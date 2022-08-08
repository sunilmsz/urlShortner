const urlModel = require('../models/urlModel')
const redis = require("./redisController")




//...................Generating random UrlCode for shortUrl........................................
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

    try {
        const { longUrl } = req.body
        if (!longUrl)
            return res.status(400).send({ status: false, message: "Please provide longUrl" })

        const reg = /^([hH][tT][tT][pP]([sS])?:\/\/.)(www\.)?[-a-zA-Z0-9@:%.\+#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%\+.#?&//=_]*$)/g
        if ((typeof longUrl !== "string") || !reg.test(longUrl.trim()))
            return res.status(400).send({ status: false, message: "Please provide valid Url" })

        const isAlready = await urlModel.findOne({ longUrl }).lean()
        if (isAlready)
            return res.status(200).send({ status: true, data: { longUrl, shortUrl: isAlready.shortUrl, urlCode: isAlready.urlCode } })

        let endPoint;
        // let condition = true;
        // while (condition == true) {
            endPoint = randomSt(8)
        //     let UrlData = await redis.get(endPoint)
        //     // console.log(UrlData)
        //     if (!UrlData) {
        //         const isPresent = await urlModel.findOne({ urlCode: endPoint }).count()
        //         if (isPresent == 0)
        //             condition = false;
        //     }

        // }

        const savedData = await urlModel.create({ longUrl, shortUrl: "http://localhost:3000/" + endPoint, urlCode: endPoint })

        return res.status(201).send({ status: true, data: { longUrl: savedData.longUrl, shortUrl: savedData.shortUrl, urlCode: savedData.urlCode } })

    } catch (err) {
        console.log("This is the error :", err.message)
        return res.status(500).send({ status: false, msg: err.message })
    }
}



const getUrl = async function (req, res) {
    try {
        let params = req.params.urlCode
        let url = await redis.get(`${params}`)
        if (url) {
            //console.log("comming from cache")
            return res.status(302).redirect(url)
        }

        let DBurl = await urlModel.findOne({ urlCode: req.params.urlCode }).lean()
        if (!DBurl)
            return res.status(404).send({ status: false, Message: "No URL found" })

            await redis.setEx(`${params}`, 4 * 60 * 60, DBurl.longUrl)

        return res.status(302).redirect(DBurl.longUrl);

    } catch (err) {
        console.log("This is the error :", err.message)
        return res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports = { createUrl, getUrl }


