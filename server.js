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

app.post('/destinations', (req, res) => {
    const accessKey = process.env.UNSPLASH_KEY
    const url = encodeURI(`https://api.unsplash.com/search/photos/?client_id=${accessKey}&query=${req.body.destinationName, req.body.location}`)

    fetch(url)
        .then(res => res.json())
        .then(data => {
            let source = data.results[0].urls.thumb
            return source
        })
        .then(async source => {
            const newDestination = new Destination({
                destinationName: req.body.destinationName,
                location: req.body.location,
                description: req.body.description,
                imgSRC: source
            })
            const saveNewDestination = await newDestination.save()
            console.log('Saved to database')
            res.redirect('/')
        })
        .catch(err => {
            console.log(`error ${err}`)
        })
})

app.put('/changePlace', (req, res) => {
    const accessKey = process.env.UNSPLASH_KEY
    const url = encodeURI(`https://api.unsplash.com/search/photos/?client_id=${accessKey}&query=${req.body.newDestinationName, req.body.newLocation}`)

    fetch(url)
        .then(res => res.json())
        .then(data => {
            let source = data.results[0].urls.thumb
            return source
        })
        .then(async source => {
            await Destination.findOneAndUpdate(
                {destinationName: req.body.oldDestinationName}, {
                        destinationName: req.body.newDestinationName,
                        location: req.body.newLocation,
                        description: req.body.newDescription,
                        imgSRC: source
                })
            console.log('Document Updated!')
            res.redirect('/')
        })
        .catch(err => {
            console.log(`error ${err}`)
        })
})

app.delete('/deletePlace', async (req, res) => {
    const deleteDestination = await Destination.findOneAndDelete({destinationName: req.body.destinationName})
    console.log('Document deleted!')
    res.redirect('/')
})