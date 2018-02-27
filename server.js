const
	dotenv = require('dotenv').load(),
	express = require('express'),
	app = express(),
	logger = require('morgan'),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/react-express-jwt',
	PORT = process.env.PORT || 3001,
	usersRoutes = require('./routes/users.js'),
	exercisesRoutes = require('./routes/exercises.js')
	session = require('express-session')

mongoose.connect(MONGODB_URI, (err) => {
	console.log(err || `Connected to MongoDB.`)
})

app.use(express.static(`${__dirname}/client/build`))
app.use(logger('dev'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(session({
	secret: "hello",
	resave: true,
	saveUninitialized: true
}))

app.get('/api', (req, res) => {
	res.json({message: "API root."})
})

// Mount the routes
app.use('/api/users', usersRoutes)
app.use('/api/exercises', exercisesRoutes)
// app.get('/api/exercises', (req, res) => {
// 	console.log(req.user)
// })


// app.use('*', (req, res) => {
// 	res.sendFile(`${__dirname}/client/build/index.html`)
// })

app.listen(PORT, (err) => {
	console.log(err || `Server running on port ${PORT}.`)
})