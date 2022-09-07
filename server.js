const { Console } = require('console')
require('dotenv').config()

const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const bodyParser = require('body-parser')
const configDB = require('./config/database.js')
const fetch = require('node-fetch');
const url = configDB.url

const mongoose = require('mongoose')
const Destination = require("./models/Destination")

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

// Check Mongoose Connection
const db = mongoose.connection
db.once('open', _ => {
    console.log('Database connected:', url)
    app.listen(port, _ => {
        console.log('Find your dream trip at port: ' + port)
    })
})
db.on('error', err => {
    console.error('connection error:', err)
})

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/', async (req, res) => {
    const allTrips = await Destination.find()
    res.render('index.ejs', { vacay: allTrips })
})

// TODO: Make into a mongoose function
app.post('/destinations', (req, res) => {
    const accessKey = process.env.UNSPLASH_KEY
    const url = encodeURI(`https://api.unsplash.com/photos/random/?client_id=${accessKey}&query=${req.body.destinationName}&query=${req.body.location}`)

    fetch(url)
        .then(res => res.json())
        .then(data => {
            console.log(data)
            console.log(data.urls.thumb)
            let source = data.urls.thumb
            return source
        })
        .then(source => {
            vacayCollection.insertOne({
                destinationName: req.body.destinationName,
                location: req.body.location,
                description: req.body.description,
                imgSRC: source

                //TODO add edited indicator (boolean) to show that card has been edited (Optional)
            })
            console.log('Saved to database')
            res.redirect('/')
        })
        .catch(err => {
            console.log(`error ${err}`)
        })
})