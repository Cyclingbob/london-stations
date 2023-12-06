const express = require("express")
const app = express()

const config = require("./config")

const path = require("path")
const fs = require("fs")

const accepts = require("accepts")
const serverLanguages = fs.readdirSync(path.join(__dirname, "views")).filter(a => !a.includes("."))

app.use("/public", express.static(path.join(__dirname, "public")))
app.set('view-engine', 'ejs')
app.get('*', (req, res, next) => {
    let clientLanguages = accepts(req).languages()
    let mutual
    let best

    if(req.cookies.language){
        mutual = [ req.cookies.langauge, ...clientLanguages.filter(a => serverLanguages.includes(a)) ]
        best = req.cookies.language
    } else {
        mutual = clientLanguages.filter(a => serverLanguages.includes(a))
        best = mutual[0] || "en"
    }

    req.languages = {
        clientLanguages,
        mutual,
        best
    }

    next()
})
.get("/set-language", (req, res) => {
    var language = req.query.language
    if(!language) res.status(400).json({ success: false, message: "No 2 char language passed in query parameter."})
    if(serverLanguages.includes(req.query.language)){
        res.cookie('language', req.query.language)
        res.json({ success: true })
    } else {
        res.status(501).json({ sucess: false, message: "Language not supported, the server only supports " + serverLanguages.join(', ')})
    }
})

app.get("/", (req, res) => {
    res.render(path.join(__dirname, "views", req.languages.best, "index.ejs"), {
        mutual_languages: req.languages.mutual,
        best_language: req.languages.best
    })
})

app.get("/total", (req, res) => {
    res.render(path.join(__dirname, "views", req.languages.best, "total.ejs"), {
        mutual_languages: req.languages.mutual,
        best_language: req.languages.best
    })
})

app.listen(config.port)