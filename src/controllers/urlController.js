const urlModel = require("../models/urLmodel")
const validator = require("validator")
const shortUrl = require("node-url-shortener");

function isValid(data) {
    if (data == null || data == undefined) return false
    if (data === "string" && data.trim().length == 0) return false
    return true
}

const urlShortner = async function (req, res) {
    try {
        if (Object.keys(req.body).length == 0) return res.status(400).send({status :false, msg: "Empty body" })
        if (!isValid(req.body.longUrl)) return res.status(400).send({status :false, msg: "Invalid Data" })

        if (!validator.isURL(req.body.longUrl)) return res.status(400).send({status: false, msg: "Invalid URL" })

        shortUrl.short(req.body.longUrl, async function (err, url) {
            if(err){
                return res.status(500).send({status : false, msg : "error while shortening"})
            }
            if(url){
                try{
                    let code = url.slice(url.lastIndexOf('/')+1)
                    let createdData = await urlModel.create({longUrl : req.body.longUrl, shortUrl : url, urlCode : code})
                    res.status(201).send({status : true, msg : createdData})
                }catch(err){
                    return res.status(500).send({status :false, msg : err.message})
                }
            }
        });

    } catch (error) {
        res.status(500).send({status: false, msg: error.message })
    }
}

const getUrlCode = async function(req, res){
    try{
        let urlCode = req.params.urlCode
        if(!isValid(urlCode)) return res.status(400).send({status: false, msg : "Bad or Missing UrlCode"})

        let result = await urlModel.findOne({urlCode : urlCode}).select({_id : 0, longUrl : 1})
        
        if(!result) return res.status(404).send({status : false, message : "No URL present with that urlCode"})

        return res.status(200).send({status : true, data : result})


    }catch(error){
        res.status(500).send({status : false, msg : error.message})
    }
}

module.exports = { urlShortner, getUrlCode }