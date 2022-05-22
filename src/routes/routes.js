const express = require('express');
const router = express.Router();
const { urlShortner, getUrlCode } = require("../controllers/urlController")
router.post("/url/shorten", urlShortner)
router.get("/:urlCode", getUrlCode)
module.exports = router