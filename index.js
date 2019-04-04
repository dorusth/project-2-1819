const express = require('express')
const app = express()
const port = process.env.PORT || 3030;
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const request = require('request')
const compression = require('compression')
const fs = require('fs')
require('dotenv').config()
const webpush = require('web-push')
const chalk = require('chalk')

const publicVapidKey = process.env.PUBLIC_KEY
const privateVapidKey = process.env.PRIVATE_KEY

webpush.setVapidDetails(
  'mailto:test@gmail.com',
  publicVapidKey,
  privateVapidKey
)

app.use(compression())
app.engine('handlebars', exphbs({
	defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
	function callback(error, response, body){
		var data = JSON.parse(body).data;
		res.render('home', {
			data: data,
			helpers:{
				temp: function(param){// temperatuur en humidity
					return Math.floor(param/100)/10;
				},
				co2: function(param){
					if(param < 1000){
						return "Normal"
					}
					else if(param>1000 && param<2000){{
						return "High"
					}}
					else if(param>2000 && param<5000){{
						return "Dangerous"
					}}
				},
				volume: function(param){
					return Math.floor(param/10)/10
				},
				volumeSafe: function(param){
					let volume = param/100
					if (volume<80) {
						return "Normal"
					} else if(volume>80 && volume<120){
						return "High"
					}else{
						return "Dangerous"
					}
				},
				occupancy: function(param){
					if (param === true) {
						return "Bezet"
					}else {
						return "Vrij"
					}
				}
			}
		})
	}
	request({url: 'http://mirabeau.denniswegereef.nl/api/v1/rooms'}, callback);
})

app.post('/subscribe', (req, res) => {
  const subscription = JSON.parse(req.body.subscription)
  console.log(subscription)

  // Send 201 status
  res.status(201).json({})

  //Create payload
  const payload = JSON.stringify({ title: ` ${req.body.name}` })

  // Pass object in send notification function
  webpush.sendNotification(subscription, payload).catch(err => {
    console.log(chalk.red(err))
  })
})

app.get('*', (req, res) => {
	res.render('error', {
		error: "Deze pagina lijkt (nog) niet niet te bestaan"
	})
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
