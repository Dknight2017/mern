# React Application with JWT Authentication from Scratch

## Create a NodeJS + Express + React for development AND production on Heroku 

1. Create your NodeJS + Express backend, something like:

   ```bash
   # in the terminal, from your workspace:
   mkdir react-express-jwt
   cd react-express-jwt
   touch server.js
   npm init
   # ... ... ...
   npm install --save express
   ```

2. In your `server.js`, add the basic express app setup code:

   ```javascript
   const
     express = require('express'),
     app = express(),
     PORT = process.env.PORT || 3001

   // when deployed to Heroku, our react app will be automatically be
   // compiled and the static files (html, js, css) will be placed in
   // /client/build for us:
   app.use(express.static(`${__dirname}/client/build`))

   app.get('/api', (req, res) => {
     res.json({message: "api root."})
   })

   // This should be the last route declared in our app. Once deployed to Heroku, any requests to a route NOT declared above will serve the static react application.
   app.get('*', (req, res) => {
   	res.sendFile(`${__dirname}/client/build/index.html`)
   })

   app.listen(PORT, (err) => {
     console.log(err || `Server running on port ${PORT}.`)
   })
   ```

3. In `package.json` located at the root of this express app, add the following `heroku-postbuild` script to the json's `"scripts"` key (don't forget to add a comma to the line just before it!):

   ```json
   "scripts": {
       "test": "echo \"Error: no test specified\" && exit 1",
       "start": "node server.js",
       "heroku-postbuild": "cd client && npm install --only=dev && npm install && npm run build"
   }
   ```

   This will ensure that each time we push to Heroku, when it is done building the express app, it will also make sure to automatically install all of the react app's dependencies, and build the client react app static files too.

4. **Set up the client application within this same directory**:

   ```bash
   # from workspace/react-express-jwt
   create-react-app client
   ```

   This will create and install the react client application within your current node app directory, in a subdirectory called `client`.

5. In `/client/package.json` (this is the react app's dedicated package.json), **add a "proxy" key** to the main JSON object, with a value pointing to the url of the main node app. Remember, our setup above puts the API application on port *3001* while we're in development, so that our client app can concurrently run on port *3000*. Any time a request is made from the client app that it doesn't know how to handle, the request will automatically be passed to the proxy url to be handled there:

   ```JSON
   {
     "name": "client",
     "version": "0.1.0",
     "private": true,
     "dependencies": {
       "react": "^16.0.0",
       "react-dom": "^16.0.0",
       "react-scripts": "1.0.14"
     },
     "scripts": {
       "start": "react-scripts start",
       "build": "react-scripts build",
       "test": "react-scripts test --env=jsdom",
       "eject": "react-scripts eject"
     },
     "proxy": "http://localhost:3001"
   }
   ```

6. From the main node app directory `react-express-jwt`, run `nodemon` to start up the API server. You can test the api by navigating to `localhost:3001/api`. You should see the api response come back as json.

7. From the client app directory `react-express-jwt/client`, **in a new terminal tab** run `npm start` to boot up the client app server.

8. You now have the ability to easily make API calls from your client app. All you need to do is install an http client to make those AJAX requests. `axios` is one such client, so from the client app directory
   `react-express-jwt/client`:

   ```bash
   npm install --save axios
   ```

9. You now have the ability to easily make API calls from your client app. All you need to do is install an http client to make those AJAX requests. `axios` is one such client, so from the client app directory. (We'll also install two more packages that will be used later)
   `react-express-jwt/client`:

   ```bash
   npm install --save axios
   npm install --save milligram
   npm install --save react-router-dom
   ```

10. Then anywhere in your client app, you can import axios and make API calls as needed for example, in 
   `react-express-jwt/client/src/App.js`:

   ```javascript
   import React, { Component } from 'react';
   import './App.css';
   // import the axios module:
   import axios from 'axios'

   // make a test API call:
   axios({method: 'get', url: '/api'})
   	.then((res) => { console.log(res.data) })
   ```

   once the file is saved, you should see `{message: "api root."}` in the browser console, and you're all set to communicate between your client and api server!

## Create a User model and full CRUD access through your API

1. Create a models folder at the root of the express app `react-express-jwt/models` and inside of this directory create
a `User.js` file (`react-express-jwt/models/User.js`).
Inside of this file put following code for the user model. Don't forget to `npm install --save mongoose bcrypt-nodejs`

```Javascript
const
    mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    userSchema = new mongoose.Schema({
        name: { type: String },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true }
    })

// adds a method to a user document object to create a hashed password
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8))
}

// adds a method to a user document object to check if provided password is correct
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password)
}

// middleware: before saving, check if password was changed,
// and if so, encrypt new password before saving:
userSchema.pre('save', function(next) {
    if(this.isModified('password')) {
        this.password = this.generateHash(this.password)
    }
    next()
})

const User = mongoose.model('User', userSchema)
module.exports = User
```

2. Create a users controller file in `react-express-jwt/controllers/users.js` and create all the typical CRUD actions, the following code will do.

```Javascript
const User = require('../models/User.js')

module.exports = {
	// list all users
	index: (req, res) => {
		User.find({}, (err, users) => {
			res.json(users)
		})
	},

	// get one user
	show: (req, res) => {
		console.log("Current User:")
		console.log(req.user)
		User.findById(req.params.id, (err, user) => {
			res.json(user)
		})
	},

	// create a new user
	create: (req, res) => {
		User.create(req.body, (err, user) => {
			if(err) return res.json({success: false, code: err.code})

			res.json({success: true, message: "User created."})
		})
	},

	// update an existing user
	update: (req, res) => {
		User.findById(req.params.id, (err, user) => {
			Object.assign(user, req.body)
			user.save((err, updatedUser) => {
				res.json({success: true, message: "User updated.", user})
			})
		})
	},

	// delete an existing user
	destroy: (req, res) => {
		User.findByIdAndRemove(req.params.id, (err, user) => {
			res.json({success: true, message: "User deleted.", user})
		})
	},

	// the login route
	authenticate: (req, res) => {
		// check if the user exists
		User.findOne({email: req.body.email}, (err, user) => {
			// if there's no user or the password is invalid
			if(!user || !user.validPassword(req.body.password)) {
				// deny access
				return res.json({success: false, message: "Invalid credentials."})
			}

			res.json({success: true, message: "User authenticated."})
		})
	}
}
```

3. Create user routes in `react-express-jwt/routes/users.js` and put the following code
```Javascript
const
	express = require('express'),
	usersRouter = new express.Router(),
	usersCtrl = require('../controllers/users.js'),

usersRouter.route('/')
	.get(usersCtrl.index)
	.post(usersCtrl.create)

usersRouter.post('/authenticate', usersCtrl.authenticate)

usersRouter.route('/:id')
	.get(usersCtrl.show)
	.patch(usersCtrl.update)
	.delete(usersCtrl.destroy)

module.exports = usersRouter
```

4. Update your `server.js` file to use the user routes by importing it along all the other modules you need (i.e. mongoose, logger, bodyParser, etc). Do an npm install for all of the new modules you'll be using `npm install --save dotenv morgan body-parser`. Also connect to mongoose (don't forget to have the `mongod` process running).

Verify that all the routes work, after updating your `server.js` file to look like code that follows.

```Javascript
const
	dotenv = require('dotenv').load(),
	express = require('express'),
	app = express(),
	logger = require('morgan'),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/react-express-jwt',
	PORT = process.env.PORT || 3001,
	usersRoutes = require('./routes/users.js')

mongoose.connect(MONGODB_URI, (err) => {
	console.log(err || `Connected to MongoDB.`)
})

app.use(express.static(`${__dirname}/client/build`))
app.use(logger('dev'))
app.use(bodyParser.json())

app.get('/api', (req, res) => {
	res.json({message: "API root."})
})

app.use('/api/users', usersRoutes)

app.use('*', (req, res) => {
	res.sendFile(`${__dirname}/client/build/index.html`)
})

app.listen(PORT, (err) => {
	console.log(err || `Server running on port ${PORT}.`)
})
```

## JWT authentication

JWT stands for JSON Web Token. A token is a string that contains encoded information that can be verified to come from an authentication server.
Basically once the user is logged in, each subsequent request will include the JWT, allowing the user to access routes, services and resources that are permitted with that token.

Since this is a practical tutorial, we won't dig too much into the details of JWT's but here are more resources if you want 
to read more about JWT tokens [jwt nice writeup](https://medium.com/vandium-software/5-easy-steps-to-understanding-json-web-tokens-jwt-1164c0adfcec) and [jwt official website](https://jwt.io/introduction/). 

1. ### Authenticator service
	The authenticator service will provide two functions `signToken` and `verifyToken`.
	The `signToken(user)` function returns a *signed* basic js object with only the info from the db.
	The `verifyToken` function is used for verifying tokens and it is used as a middleware that continues the flow of the req/res cycle.

	* First install the module: `npm install --save jsonwebtoken`
	* Now create a `react-express-jwt/serverAuth.js` file in the root folder of your express app. And typing the following code

```Javascript
const
	jwt = require('jsonwebtoken'),
	User = require('./models/User.js')

// function for creating tokens
function signToken(user) {
	// toObject() returns a basic js object with only the info from the db
	const userData = user.toObject()
	delete userData.password
	return jwt.sign(userData, process.env.JWT_SECRET)
}

// function for verifying tokens
function verifyToken(req, res, next) {
	// grab token from either headers, req.body, or query string
	const token = req.get('token') || req.body.token || req.query.token
	// if no token present, deny access
	if(!token) return res.json({success: false, message: "No token provided"})
	// otherwise, try to verify token
	jwt.verify(token, process.env.JWT_SECRET, (err, decodedData) => {
		// if problem with token verification, deny access
		if(err) return res.json({success: false, message: "Invalid token."})
		// otherwise, search for user by id that was embedded in token
		User.findById(decodedData._id, (err, user) => {
			// if no user, deny access
			if(!user) return res.json({success: false, message: "Invalid token."})
			// otherwise, add user to req object
			req.user = user
			// go on to process the route:
			next()
		})
	})
}

module.exports = {
	signToken,
	verifyToken
}
   ```

2.	### Verifying access
	* Go ahead and create a user using postman (or any other rest client). Now access this newly created
user through `get /api/users/the-id-of-the-user` you will see that anyone *can* access, update and destroy this user at will. What we will do in this step is allow these actions to be carried only when the request has a verified token.

	* We will import the verifyToken function and use it before any of the actions that will read, update and destroy individual users.
	Update your `react-express-jwt/routes/users.js` file to include the two lines that will accomplish the abovementioned, your file will end up looking like this:
		```Javascript
		const
			express = require('express'),
			usersRouter = new express.Router(),
			usersCtrl = require('../controllers/users.js'),
			verifyToken = require('../serverAuth.js').verifyToken //*new line* import the verifyToken function

		usersRouter.route('/')
			.get(usersCtrl.index)
			.post(usersCtrl.create)

		usersRouter.post('/authenticate', usersCtrl.authenticate)


		usersRouter.use(verifyToken) //*new line* All the routes after this point will need a verified token
		usersRouter.route('/:id')
			.get(usersCtrl.show)
			.patch(usersCtrl.update)
			.delete(usersCtrl.destroy)

		module.exports = usersRouter
		```

	* Now when if you try to access an individual user through `get /api/users/the-id-of-the-user` you will receive a message that says:
	`{"success": false, "message": "No token provided" }`. This means we have successfully protected our individual user routes from unverified access.

3.	### Signing tokens
	Now we will create the code that will create signed tokens when the user create and user authenticate actions in our controller are accessed. We will work on our user controller found under: `react-express-jwt/controllers/users.js` 

	* First we import the signToken function
	```Javascript
		const signToken = require('../serverAuth.js').signToken
	```
	* Then we will create a token and send it in the response for both create and authenticate routes. The code that accomplishes
	this looks like this: 
	```Javascript
		const token = signToken(user)
		res.json({success: true, message: "User created. Token attached.", token})
	```

	Your will `react-express-jwt/controllers/users.js` file should look like this:
	```Javascript
		const User = require('../models/User.js')
		const signToken = require('../serverAuth.js').signToken //**** NEW CODE  *****

		module.exports = {

			// ... other routes code ...

			create: (req, res) => {
				User.create(req.body, (err, user) => {
					if(err) return res.json({success: false, code: err.code})
					// once user is created, generate a token to "log in":                       //**** NEW CODE  *****
					const token = signToken(user) 							 					 //**** NEW CODE  *****
					res.json({success: true, message: "User created. Token attached.", token})   //**** NEW CODE  *****
				})
			},

			// ... more code ...


			authenticate: (req, res) => {
				// check if the user exists
				User.findOne({email: req.body.email}, (err, user) => {
					// if there's no user or the password is invalid
					if(!user || !user.validPassword(req.body.password)) {
						// deny access
						return res.json({success: false, message: "Invalid credentials."})
					}

					const token = signToken(user)								  //**** NEW CODE  *****
					res.json({success: true, message: "Token attached.", token})  //**** NEW CODE  *****
				})
			}
		}
	```

4. ### Setting a secretOrPrivateKey for our tokens
	If you tried to authenticate (by going to the `get /api/users/authenticate` endpoint) you get an error that looks like this: `Error: secretOrPrivateKey must have a value`.

	What this means is that we need to provide a secret for creating our tokens. In the `serverAuth.js` file we used the wrote `process.env.JWT_SECRET` so we need to provide this variable.
	A good way to  create this variable is by adding it to a `.env` file.

	* create a `.env` file at the root of the application, adjacent to `server.js`.

   		*The only environment variable you **have** to declare in development is `JWT_SECRET`*

	* In the `.env` file, you can declare the following environment variables: `JWT_SECRET`,  `MONGODB_URI`, and `PORT`. For example:

		```
		JWT_SECRET=BOOOOOOOOOOOOOM
		MONGODB_URI=mongodb://localhost/react-express-jwt
		PORT=3001
		```
	* Now try to authenticate a user by providing the correct credentials. You will get a response that looks something like the following code. This means that you've successfuly created a way to attach tokens to your authenticate action: 
	```JSON
	{
		"success": true,
		"message": "Token attached.",
		"token": "eysdGciOiJIUzjkjkjkjlajsdfiIUIOUJljTE5Zjc1OTFhMWRlNTA3YTEiLCJuYW1lIjoibWljaGFlbCIsImVtYWlsIjoibWljaGFlbEBnbWFpbC5jb20iLCJfX3YiOjAsImlhdCI6MTUxOTE1OTkwOH0.VMqrXt1QXJba63kjkjkkjaoQDg_HQRTWFb4c4lKNKLDkXg"
	}
	```

	* any subsequent request you can add a token header with the value of the token you received

## Connecting our React app to the backend with authentication 

1. We will create a clientAuth service in a file that will hold all the functions that will do the authentication interaction with the server. This service will also save the token that the user gets when it gets authenticated or created from the server. This token will be saved in the localStorage so any subsequent request can include the stored token.
	* Create a `clientAuth.js` file inside of the `client/src` folder and include the following code.
	```Javascript
	import axios from 'axios'
	import jwtDecode from 'jwt-decode'

	// During initial app load, instantiate axios, and attempt to set
	// a stored token as a default header for all api requests.
	const clientAuth = axios.create()
	clientAuth.defaults.headers.common.token = getToken()

	function getToken() {
		return localStorage.getItem('token')
	}

	function setToken(token) {
		localStorage.setItem('token', token)
		return token
	}

	function getCurrentUser() {
		const token = getToken()
		if(token) return jwtDecode(token)
		return null
	}

	function logIn(credentials) {
		return clientAuth({ method: 'post', url: '/api/users/authenticate', data: credentials })
			.then(res => {
				const token = res.data.token
				if(token) {
					// sets token as an included header for all subsequent api requests
					clientAuth.defaults.headers.common.token = setToken(token)
					return jwtDecode(token)
				} else {
					return false
				}
			})
	}

	// logIn and signUp functions could be combined into one since the only difference is the url we're sending a request to..
	function signUp(userInfo) {
		return clientAuth({ method: 'post', url: '/api/users', data: userInfo})
			.then(res => {
				const token = res.data.token
				if(token) {
					// sets token as an included header for all subsequent api requests
					clientAuth.defaults.headers.common.token = setToken(token)
					return jwtDecode(token)
				} else {
					return false
				}
			})
	}

	function logOut() {
		localStorage.removeItem('token')
		delete clientAuth.defaults.headers.common.token
		return true
	}


	export default {
		getCurrentUser,
		logIn,
		signUp,
		logOut
	}
	```
	* Run `npm install --save jwt-decode` inside of the `client` folder.

2. Now that you have the clientAuth service you can use it to login, logout, authenticate.
In this app you will find usages of this service in the App component and in the components found under the `views` folder.
For example you can see how the service is used in the LogIn component
```Javascript
onFormSubmit(evt) {
		evt.preventDefault()
		clientAuth.logIn(this.state.fields).then(user => {
			this.setState({ fields: { email: '', password: '' } })
			if(user) {
				this.props.onLoginSuccess(user)
				this.props.history.push('/')
			}
		})
	}
``` 