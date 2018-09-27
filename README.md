# gMarcone API

---

gMarcone is a basic micro service, which contains a web service that exposes an API to check the state of a capital's weather belonging to a specific country.

This service consume 3 other APIs.

- *Darksky*: which return the weather for a pair of coords (lat, lng).
- *Geocode*: which return information for a pait of coords or an adress.
- *Restcountries*: which return information of a country.

This 3 APIs are used to expose several weather data.

## Routes

```
GET		/api/forecast?latitude=<int:latitude>&longitude=<int:longitude>&lang=<string:language>
```

This route will reply:

```json
{
	"latitude": -33.4488897,
	"longitude": -70.6692655,
	"name": "Santiago, Región Metropolitana, Chile",
	"timezone": "America/Santiago",
	"currently": {
		"time": 1538075118,
		"summary": "Mayormente Nublado",
		"icon": "partly-cloudy-day",
		"precipIntensity": 0.1016,
		"precipProbability": 0.03,
		"precipType": "rain",
		"temperature": 17.54,
		"apparentTemperature": 17.54,
		"dewPoint": 6.33,
		"humidity": 0.48,
		"pressure": 1014.31,
		"windSpeed": 3.01,
		"windGust": 4.31,
		"windBearing": 149,
		"cloudCover": 0.79,
		"uvIndex": 3,
		"visibility": 11.8,
		"ozone": 304.9
	},
	"daily": {
		"summary": "Lluvia ligera hoy hasta el Domingo, con temperaturas alcanzando un mínimo de 15°C el Sábado.",
		"icon": "rain",
		"data": [
			{
				"time": 1538017200,
				"summary": "Nublado durante el día.",
				"icon": "cloudy",
				"sunriseTime": 1538043969,
				"sunsetTime": 1538088210,
				"moonPhase": 0.58,
				"precipIntensity": 0.1194,
				"precipIntensityMax": 0.3531,
				"precipIntensityMaxTime": 1538096400,
				"precipProbability": 0.35,
				"precipType": "rain",
				"temperatureHigh": 18.25,
				"temperatureHighTime": 1538078400,
				"temperatureLow": 12.5,
				"temperatureLowTime": 1538132400,
				"apparentTemperatureHigh": 18.25,
				"apparentTemperatureHighTime": 1538078400,
				"apparentTemperatureLow": 12.5,
				"apparentTemperatureLowTime": 1538132400,
				"dewPoint": 7.16,
				"humidity": 0.63,
				"pressure": 1015.63,
				"windSpeed": 0.6,
				"windGust": 4.97,
				"windGustTime": 1538071200,
				"windBearing": 143,
				"cloudCover": 0.95,
				"uvIndex": 5,
				"uvIndexTime": 1538067600,
				"visibility": 11.7,
				"ozone": 303.52,
				"temperatureMin": 11.58,
				"temperatureMinTime": 1538024400,
				"temperatureMax": 18.25,
				"temperatureMaxTime": 1538078400,
				"apparentTemperatureMin": 11.58,
				"apparentTemperatureMinTime": 1538024400,
				"apparentTemperatureMax": 18.25,
				"apparentTemperatureMaxTime": 1538078400
			},
			...
		]
	},
	"offset": -3
}
```

### HTTP statuses

The server in every route can reply with one of the following http statuses.

<center>

| Status | Meaning |
|--------|---------|
|200     | Everything OK!|
|404     | Resource not found|
|500     | Internal server error|

</center>
