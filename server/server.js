const express = require('express')
var multer = require('multer');
var bodyParser = require('body-parser');
const cors = require('cors')
const ffmpeg = require('ffmpeg');
const fs = require('fs')
const path = require('path')


//CREATE EXPRESS APP
const app = express();
app.use(express.json());
app.use(cors())
app.use(express.static('trimVideo'))
// app.use("/public", express.static(path.resolve(__dirname + "/uploads")))

// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
        // cb(null, file.fieldname + '-' + Date.now())

    }
})

var upload = multer({ storage: storage })

app.post('/uploadfile', upload.single('myFile'), async (req, res, next) => {
    const file = req.file
    if (!file) {
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        return next(error)
    }
    const videoMetaData = await getMetaData(file)
    videoMetaData.filename = file.filename
    res.json(videoMetaData)
})

app.post("/trim", async (req, res) => {
    try {
        console.log(req.body)
        const { fileName, startTime, duration } = req.body
        const inputFile = path.resolve(__dirname + `/uploads/${fileName}`);
        const process = new ffmpeg(inputFile)
        process.then(video => {
            video.setVideoStartTime(startTime)
            video.setVideoDuration(duration)
            video.save(path.resolve(__dirname + `/trimVideo/${fileName}`))
        })
        const url = `http://localhost:5000/${fileName}`
        res.json({ url: url })
    } catch (error) {
        console.log(error)
    }
})

const getMetaData = async (file) => {
    try {
        const inputFile = path.resolve(__dirname + `/uploads/${file.filename}`);
        const process = new ffmpeg(inputFile)

        const data = await process.then(video => {
            return video.metadata
        }).catch(err => {
            return err
        })
        return data
    } catch (error) {

    }
}


const PORT = 5000
app.listen(PORT, () => {
    console.log("server is running on port", PORT)
})