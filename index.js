const express = require('express')
const app = express()
const port = process.env.PORT || 3030;
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const request = require('request')
const compression = require('compression')
const fs = require('fs');

app.use(compression())
app.engine('handlebars', exphbs({
	defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
app.use(express.static('public'))

app.get('/', (req, res) => {
	// request.get('http://mirabeau.denniswegereef.nl/api/v1/rooms')
	// 	.on('response', function(response) {
	// 		console.log(body);
	//     console.log(response.statusCode) // 200
	//     console.log(response.headers['content-type']) // 'image/png'
	// })
	function callback(error, response, body){
		var data = JSON.parse(body).data;
		res.render('home', {
			data: data,
			helpers:{
				temp: function(param){
					return Math.floor(param/100)/10;
				},
				co2: function(param){
					if(param < 1000){
						return "co2_safe"
					}
					else if(param>1000 && param<2000){{
						return "co2_warning"
					}}
					else if(param>2000 && param<5000){{
						return "co2_unsafe"
					}}
				},
				humidity: function(param){
					return param/1000
				},
				volume: function(param){
					return param/100
				},
				volumeSafe: function(param){
					let volume = param/100
					if (volume<80) {
						return "volume_safe"
					} else if(volume>80 && volume<120){
						return "volume_warning"
					}else{
						return "volume_unsafe"
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

	request({
  		url: 'http://mirabeau.denniswegereef.nl/api/v1/rooms',
  		headers: {
  			'User-Agent': 'request'
  		}
  	}, callback);
})


app.get('*', (req, res) => {
	res.render('error', {
		error: "Deze pagina lijkt (nog) niet niet te bestaan"
	})
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
