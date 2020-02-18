const express = require('express')

const app = express()
const port = 8080

app.get('/', (req, res) => {
    res.send("parking")
})

app.listen(port, () => {
    console.log(`seiwiki api listening on ${port}`)
})