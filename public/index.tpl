<!doctype html>
<html>

<head>
    <title>Music Recommendations</title>
    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="/extra.css">
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
    <script src="//code.jquery.com/jquery-1.10.1.min.js"></script>

</head>

<body>
    <div class="container top">
        

        <div id="in">
            <div class="row">
                <div class="col-md-6">
                    <div id="custom-search-input">
                        <div class="input-group col-md-12">
                            <input type="text" class="form-control input-lg spotSearch" placeholder="Search for an artist or song" />
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

  
    <script src="/handlebars.min.js"></script>
    <script src="/main.js"></script>

</body>

</html>