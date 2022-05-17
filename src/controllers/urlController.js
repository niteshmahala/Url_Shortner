const urlModel = require("../models/urLmodel")
const validator = require("validator")
const shortUrl = require("node-url-shortener");

function isValid(data) {
    if (data == null || data == undefined) return false
    if (typeof data === "string" && data.trim().length == 0) return false
    return true
}

const urlShortner = async function (req, res) {
    try {
        if (Object.keys(req.body).length == 0) return res.status(400).send({ msg: "Empty body" })
        if (!isValid(req.body.longUrl)) return res.status(400).send({ msg: "Invalid Data" })

        if (!validator.isURL(req.body.longUrl)) return res.status(400).send({ msg: "Invalid URL" })

        shortUrl.short(req.body.longUrl, async function (err, url) {
            if(err){
                return res.status(500).send({msg : "error while shortening"})
            }
            if(url){
                try{
                    let code = url.slice(url.lastIndexOf('/')+1)
                    let createdData = await urlModel.create({longUrl : req.body.longUrl, shortUrl : url, urlCode : code})
                    res.status(201).send({msg : createdData})
                }catch(err){
                    return res.status(500).send({msg : err.message})
                }
            }
        });

    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
}

module.exports = { urlShortner }