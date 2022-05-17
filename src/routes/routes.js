const express = require('express');
const router = express.Router();
const { urlShortner } = require("../controllers/urlController")

router.post("/url/shorten", urlShortner)




module.exports = router