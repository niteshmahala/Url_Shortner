const urlModel = require("../models/urLmodel")
const validator = require("validator");
const { nanoid } = require("nanoid")
const redis = require("redis")
const BASE_URL = "http://localhost:3000/"
const { promisify } = require("util");

const redisClient = redis.createClient(
    13846,
    "redis-13846.c212.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("FFip71zvmhw0R4MKvYrrpnGYbxQcriPC", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


function isValid(data) {
    if (data == null || data == undefined) return false
    if (data === "string" && data.trim().length == 0) return false
    return true
}

const urlShortner = async function (req, res) {
    try {
        if (Object.keys(req.body).length == 0) return res.status(400).send({ status: false, msg: "Empty body" })
        if (!isValid(req.body.longUrl)) return res.status(400).send({ status: false, msg: "Invalid Data" })

        if (!validator.isURL(req.body.longUrl)) return res.status(400).send({ status: false, msg: "Invalid URL" })

        let cachedShort = await GET_ASYNC(req.body.longUrl)
        if(cachedShort){
            cachedShort = JSON.parse(cachedShort)
            let longUrl = req.body.longUrl
            let shortUrl = cachedShort
            let urlCode = shortUrl.slice(shortUrl.lastIndexOf('/')+1)
            return res.status(200).send({status :true , data : { urlCode, longUrl, shortUrl }})
        }else{

            const shortIdgen = nanoid()
            req.body.urlCode = shortIdgen
            req.body.shortUrl = BASE_URL + shortIdgen

            const dbEntry = req.body

            let result = await urlModel.create(dbEntry)

            let { urlCode, longUrl, shortUrl } = result
            await SET_ASYNC(longUrl, JSON.stringify(shortUrl))
            res.status(201).send({ status: true, data: { urlCode, longUrl, shortUrl } })
        }

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

const getUrlCode = async function (req, res) {
    try {
        let urlCode = req.params.urlCode
        if (!isValid(urlCode)) return res.status(400).send({ status: false, msg: "Bad or Missing UrlCode" })

        let result = await urlModel.findOne({ urlCode: urlCode }).select({ _id: 0, longUrl: 1 })
        if (!result) return res.status(404).send({ status: false, message: "No URL present with that urlCode" })

        
        let urlData = await GET_ASYNC(`${req.params.urlCode}`)
        if(urlData){
            return res.redirect(302, JSON.parse(urlData))
        }else{
            await SET_ASYNC(`${urlCode}`, JSON.stringify(result.longUrl))
            res.redirect(302, result.longUrl)
        }

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports = { urlShortner, getUrlCode }