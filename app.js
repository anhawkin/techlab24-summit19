var express = require('express');
var request = require('request');
var querystring = require('querystring');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

const fs = require("fs");
const TargetNodeClient = require("@adobe/target-node-client");
const client = TargetNodeClient.create({
    config: {
        client: "adobedemogreg",
        organizationId: "D439123F524454E10A490D45@AdobeOrg",
        timeout: 3000
    }
});
var mboxId = "";
var visitorID = ""; // for use later in Analytics Data Insertion
var TEMPLATE = fs.readFileSync(__dirname + "/public/index.tpl").toString();
var searchAlgo = "A";
var client_id = '3ae35048c1334a9c9efd33b6f331ce37'; // S client id
var client_secret = 'f026282107254a82964f81240453e442'; // S secret
var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
        grant_type: 'client_credentials'
    },
    json: true
};

var port = process.env.PORT || 8888;

var accessToken = '';
var app = express();

app.use(express.static(__dirname + '/public'));
app.use(cookieParser());

// Adobe Target functions related to cookie and visitor ID
function saveCookie(res, cookie) {
    if (!cookie) {
        return;
    }

    res.cookie(cookie.name, cookie.value, {
        maxAge: cookie.maxAge * 1000
    });
}

function sendSuccessResponse(res, response) {
    res.set({
        "Content-Type": "text/html",
        "Expires": new Date().toUTCString()
    });
    const result = TEMPLATE;
    saveCookie(res, response.targetCookie);

    res.status(200).send(result);
}

function sendErrorResponse(res, error) {
    res.set({
        "Content-Type": "text/html",
        "Expires": new Date().toUTCString()
    });

    res.status(500).send(error);
}

app.get('/', function(req, res) {
    const targetCookieName = encodeURIComponent(TargetNodeClient.getTargetCookieName());
    const targetCookie = req.cookies[targetCookieName];
    const payload = {
        mboxes: [{
            mbox: "server-side-recos-ux",
            indexId: 0
        },{
            mbox:"server-side-recos-algo",
            indexId: 1
        }],
        contentAsJson:true

    };
    const requestTarget = Object.assign({
        payload
    }, {
        targetCookie
    });

    client.getOffers(requestTarget)
        .then((response) => {
            if (response.content.mboxResponses) {
                console.log(response);
                console.log(response.content.mboxResponses)
                const contentArray = response.content.mboxResponses;
                const optionsArray = [];
                contentArray.forEach(function(element) {
                    if (element.content) {
                        optionsArray.push(element.content);                            
                    }     
                });
                // make to decision to serve the default template or the alternative
                TEMPLATE = (optionsArray[0].option == "B") ? fs.readFileSync(__dirname + "/public/index-alt.tpl").toString() : fs.readFileSync(__dirname + "/public/index.tpl").toString();
                if (optionsArray[1]) {
                    searchAlgo = (optionsArray[1].option == "B") ? "B" : "A";
                }
            }
            else if (!response.content.mboxResponses) {
                // if Target has no live activity we need to return the template to the default state and reset the search algo
                TEMPLATE = fs.readFileSync(__dirname + "/public/index.tpl").toString();
                searchAlgo = "A";
            }
            // grabbing the ID from the Target Visitor ID to use for Analytics in this example 
            // sending a successful response message to the browser
            mboxId = response.targetCookie.value.split('PC#'), visitorID = mboxId[1].split('.'), sendSuccessResponse(res, response)
        })
        .catch(error => {
            console.error('Error', error), sendErrorResponse(res, error)
        })

});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.get('/recommendations', function(req, res) {
    var inputData = {};
    inputData["popularityValue"] = 25;
    var queryData = JSON.parse(decodeURIComponent(req.query.put));
    // console.log(queryData);
    var putOptions = {
        url: 'https://search-spotify-dev-fvkzg4s56ax24sosxjlfxn3vk4.us-west-2.es.amazonaws.com/spotify-dev/_doc/' + req.query.id,
        body: queryData,
        json: true
    }
    // make a request to Spotify to get the genres for the first artist
    var artistsIds = queryData.artistsIds[0];
    var genres = '';
    // request an access token
    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            // use the access token to access the Spotify Web API
            var token = body.access_token;
            var genreOptions = {
                url: 'https://api.spotify.com/v1/artists/' + artistsIds,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                json: true
            }
            request.get(genreOptions, function(error, response, body) {
                if (!error) {
                    genres = body.genres.toString();
                    console.log(genres);
                        // constructing a request to Target to send the genres
    const targetCookieName = encodeURIComponent(TargetNodeClient.getTargetCookieName());
    const targetCookie = req.cookies[targetCookieName];
    const payload = {
        mboxes: [{
            mbox: "server-side-genres",
            parameters: {
                "user.categoryId": genres
            },
            indexId: 0
        }]

    };
    const requestTarget = Object.assign({
        payload
    }, {
        targetCookie
    });
    
    client.getOffers(requestTarget)
        .then(response => {
            console.log(response.content.mboxResponses[0]);
        })
        .catch(error => {
            console.log(error);
        });


                }
                else if (error) {
                    console.log(error);
                }
            });
        }
    });


    // the body of the main search query
    var queryJSON = { 
        "sort": { "_score": "asc" }, "query": { "function_score": { "query": { "bool": { "must_not": { "match_phrase": { "name": queryData.name } }, "must": [{ "range": { "popularity": { "gte": queryData.popularity - inputData.popularityValue, "lte": queryData.popularity + inputData.popularityValue } } }, { "range": { "duration_ms": { "gte": 30000 } } }] } }, "script_score": { "script": { "lang": "expression", "inline": "pow(acousticness - doc['acousticness'], 2) + pow(danceability - doc['danceability'], 2) + pow(energy - doc['energy'], 2) + pow(valence - doc['valence'], 2) + pow(instrumentalness - doc['instrumentalness'], 2) + pow(liveness - doc['liveness'], 2)", "params": { "acousticness": queryData.acousticness, "danceability": queryData.danceability, "energy": queryData.energy, "valence": queryData.valence, "instrumentalness": queryData.instrumentalness, "liveness": queryData.liveness } } } } }
    }
    var queryJSONalt = { "sort": { "_score": "asc"}, "query": { "term":{ "key": queryData.key}  }
    }
    // setting up the POST request for the search query
    var postOptions = {
        url: 'https://search-spotify-dev-fvkzg4s56ax24sosxjlfxn3vk4.us-west-2.es.amazonaws.com/spotify-dev/_search',
        body: queryJSON,
        json: true
    }
    if (searchAlgo == "B") {
        postOptions.body = queryJSONalt
    }
    console.log(postOptions.body);
    request.put(putOptions, function(error, response, body) {
        if (!error && response.body) {
            console.log(body);
            request.post(postOptions, function(error, response, body) {
                if (!error && response.body) {
                    console.log(body);
                    res.send(body);
                }
            });
        } else if (error) {
            console.log(error.root_cause);
        }
    });
});

app.get('/recommended', function(req, res) {
    var inputData = {};
    inputData["popularityValue"] = 25;
    var postOptions = {
        url: 'https://search-spotify-dev-fvkzg4s56ax24sosxjlfxn3vk4.us-west-2.es.amazonaws.com/spotify-dev/_search?q=' + req.query.id,
        json: true
    }
    request.post(postOptions, function(error, response, body) {
        if (!error && response.body) {
            console.log(body.hits.hits[0]._source);
            var queryData = body.hits.hits[0]._source;
            var queryJSON = {  "sort": { "_score": "asc" }, "query": { "function_score": { "query": { "bool": { "must_not": { "match_phrase": { "name": queryData.name } }, "must": [{ "range": { "popularity": { "gte": queryData.popularity - inputData.popularityValue, "lte": queryData.popularity + inputData.popularityValue } } }, { "range": { "duration_ms": { "gte": 30000 } } }] } }, "script_score": { "script": { "lang": "expression", "inline": "pow(acousticness - doc['acousticness'], 2) + pow(danceability - doc['danceability'], 2) + pow(energy - doc['energy'], 2) + pow(valence - doc['valence'], 2) + pow(instrumentalness - doc['instrumentalness'], 2) + pow(liveness - doc['liveness'], 2)", "params": { "acousticness": queryData.acousticness, "danceability": queryData.danceability, "energy": queryData.energy, "valence": queryData.valence, "instrumentalness": queryData.instrumentalness, "liveness": queryData.liveness } } } } }
            }
            var postOptions = {
                url: 'https://search-spotify-dev-fvkzg4s56ax24sosxjlfxn3vk4.us-west-2.es.amazonaws.com/spotify-dev/_search',
                body: queryJSON,
                json: true
            }
            request.post(postOptions, function(error, response, body) {
                if (!error && response.body) {
                    console.log(body);
                    res.send(body);
                }
            });
        }
    });
});

// running the core search functionality from the server side
app.get('/search', function(req, res) {
    if (req.query.q.length > 0) {
        var uA = req.headers['user-agent'];
        var referer = req.headers.referer;
        var searchQuery = req.query.q;

        request.post(authOptions, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                var token = body.access_token;
                var searchOptions = {
                    url: 'https://api.spotify.com/v1/search?q="' + searchQuery + '"&type=track&limit=10',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    json: true
                }
                request.get(searchOptions, function(error, response, body) {
                    if (!error) {
                        res.send(body);
                        
                    } else if (error) {
                        res.send(error);
                    }
                });

            }
        })

        // setting up the Analytics Data Insertion API data 
        var analyticsBlob = {
            url: "http://andrewhawkinsinc.d3.sc.omtrdc.net/b/ss//6",
            headers: {
                'User-Agent': uA,
                'Content-Type': 'text/xml'
            },
            body: '<?xml version=1.0 encoding=UTF-8?><request><sc_xml_ver>1.0</sc_xml_ver><pageURL>' + referer + '</pageURL><pageName>TechLab24</pageName><events>event11</events><prop11>' + searchQuery + '</prop11><visitorID>' + visitorID[0] + '</visitorID><reportSuiteID>ajhbc</reportSuiteID></request>'

        }

        // sending the Data to Insertion API
        request.post(analyticsBlob, function(error, response, body) {
            if (!error) {
                console.log(body);
            } else if (error) {
                console.log(error);
            }
        });


        
    }

});


app.get('/playlist', function(req, res) {
  if (req.query.ids.length > 0) {
    var playlistQuery = req.query.ids;
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var token = body.access_token;
        var playlistOptions = {
      url: "https://api.spotify.com/v1/audio-features/?ids=" + playlistQuery,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      json:true
    }
    request.get(playlistOptions, function(error, response, body) {
      if (!error) {
        res.send(body);
      }
      else if (error) {
        res.send(error);
      }
    });

      }
    });
  }
});

app.listen(port, function() {
    console.log('Listening on ' + port);
});