<!doctype html>
<html>

<head>
    <title>Music Recommendations</title>
    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="/extra.css">
    <script src="//code.jquery.com/jquery-1.10.1.min.js"></script>

</head>

<body class="alt">
    <div class="container top">
        
        <div id="in">
            <div id="user-profile">
            </div>
            <div id="oauth">
            </div>
                <div class="page-title"><p>TechLab 24 at Adobe Summit 2019</p>
                 </div>
                 <div class="page-content"><p>Ready for the best lab at Summit? Search for your favourite artist or song below then select one from the list that comes back. Click on the <i class="glyphicon glyphicon-music"></i> icon for even more fun!</p></div>
            <div class="row">
                <div class="col-md-6">
                    <div id="custom-search-input">
                        <div class="input-group col-md-12">
                            <input type="text" class="form-control input-lg spotSearch" placeholder="Search for your favourite artists or song" />
                            <span class="input-group-btn">
                        <button class="btn btn-info btn-lg spotSearch" type="button">
                            <i class="glyphicon glyphicon-search"></i>
                        </button>
                        </span>
                        </div>
                    </div>
                </div>
            </div>

            <div id="playlists">
            </div>
            <div id="playlistsTracks">
            </div>
            
        </div>
    </div>

   

   

    <script id="playlists-template" type="text/x-handlebars-template">
        <div>
            <h2 class="page-title">You have {{total}} playlists and here they are:</h2>
            <ul class="shots">
                {{#each items}}
                <li class="shot playlist">
                    <div class="shot-meta">
                        <div class="shot-author playlist">{{name}} has {{tracks.total}} tracks</div>
                    </div>
                    <button class="fetchTracks button" value="{{tracks.href}}?limit=50">Fetch</button>
                </li>
                {{/each}}
            </ul>
            {{#if previous}}
            <button class="previousPlaylist button" value="{{previous}}">Previous 50 Playlists</button> {{/if}} {{#if next}}
            <button class="nextPlaylist button" value="{{next}}">Next 50 Playlists</button> {{/if}}


        </div>
    </script>
    <script id="playlistsTracks-template" type="text/x-handlebars-template">
        <div>
            <ul class="shots">
                <li id="recommendationsSourceControls"></li>
                {{#each items}} {{#if is_local}}
                <li>
                    <div class="shot height">
                        <div class="shot-author error">This track is local to your device. You can only use this service on non-local tracks.</div>
                    </div>
                </li>
                {{else}}
                <li>
                    <a class="shot height">
                        <div class="shot-image" style="background-image:url('{{track.album.images.1.url}}');background-size:cover;">
                            <button class="getRecommendations button" id="{{track.id}}">
                <i class="glyphicon glyphicon-music"></i></button>
                        </div>
                        <div class="shot-meta">
                            {{#each track.artists}}
                            <div class="shot-author">{{name}}</div>
                            {{/each}}
                            <div class="shot-date">{{track.name}}</div>
                        </div>
                    </a>
                </li>
                {{/if}} {{/each}} {{#if previous}}
                <button class="previousTracks button" value="{{previous}}">Previous Tracks</button> {{/if}} {{#if next}}
                <button class="nextTracks button" value="{{next}}">Next Tracks</button> {{/if}} {{#each tracks.items}}
                <li>
                    <a class="shot height">
                        <div class="shot-image" style="background-image:url('{{album.images.1.url}}');background-size:cover;">
                            <button class="getRecommendations button" id="{{id}}"><i class="glyphicon glyphicon-music"></i></button>
                        </div>
                        <div class="shot-meta">
                            {{#each artists}}
                            <div class="shot-author">{{name}}</div>
                            {{/each}}
                            <div class="shot-date">{{name}}</div>
                        </div>
                    </a>
                </li>
                {{/each}}

            </ul>
            <button class="sendTracks button">Send all</button>

        </div>
    </script>

    <script id="recommendationsSource-template" type="text/x-handlebars-template">
        <li>
            <div class="shot height">
                <h1 class="page-title recommendations">{</h1>
            </div>
        </li>
        {{#each hits.hits}}
        <li>
            <a class="shot height">
    {{#if _source.image300}}
    <div class="shot-image recommended" style="background-image:url('{{_source.image300}}');background-size:cover;">
    <button class="getRecommendations fromRecommendation button" id="{{_id}}"><i class="glyphicon glyphicon-music"></i></button>                
    </div>
    {{else}}
    <div class="shot-image recommended">
    <button class="getRecommendations fromRecommendation button" id="{{_id}}"><i class="glyphicon glyphicon-music"></i></button>
    </div>
    {{/if}}
    <div class="shot-meta">
    {{#each _source.artists}}
    <div class="shot-author">{{this}}</div>
    {{/each}}
    <div class="shot-date">{{_source.name}}</div>
    </div></a></li>
        {{/each}}
        <li>
            <div class="shot height">
                <h1 class="page-title recommendations">}</h1>
            </div>
        </li>
    </script>

    <script id="recommendationsSourceControls-template" type="text/x-handlebars-template">
        <div class="shot height container">
            <div class="shot settings">Similar Popularity<span class="left">Crucial</span><span class="right">Trivial</span><input id="popularity" type="range" min="0" max="50" step="1" value="{{popularityValue}}">
            </div>
            <div class="shot settings">Same Musical Modality? {{#if modeChecked}}
                <input type="checkbox" id="mode" value="{{mode}}" checked><label for="mode">
    <span></span>Yes</label> {{else}}
                <input type="checkbox" id="mode" value="{{mode}}"><label for="mode">
    <span></span>Yes</label> {{/if}}
            </div>
        </div>
    </script>

    <script src="/handlebars.min.js"></script>
    <script src="/main.js"></script>

</body>

</html>