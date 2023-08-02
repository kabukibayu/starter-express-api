const express = require('express')
const { createResponse } = require('./utils/response');
const app = express()
app.all('/', (req, res) => {
    console.log("Just got a request!")
    createResponse(res, 200, { message: {
        "Suhu" : "PANAS CUK"
    }})
})
app.listen(process.env.PORT || 3000)