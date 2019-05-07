  (function() {

            

            var playlistsTracksSource = document.getElementById('playlistsTracks-template').innerHTML,
                playlistsTracksTemplate = Handlebars.compile(playlistsTracksSource),
                playlistsTracksPlaceholder = document.getElementById('playlistsTracks');

            var recommendationsSource = document.getElementById('recommendationsSource-template').innerHTML,
                recommendationsTemplate = Handlebars.compile(recommendationsSource);

            var recommendationsSourceControls = document.getElementById('recommendationsSourceControls-template').innerHTML,
                recommendationsSourceControlsTemplate = Handlebars.compile(recommendationsSourceControls);
                




                function moreRecommendations() {
                    var getRecommendationsKeyElementId = ".recommendedItems." + $(this).attr("id");
                    if ($(getRecommendationsKeyElementId).length == 0) {
                        // if this is the first time recommendations are coming for this track then we need to set up a div holder for the template
                        $(this).closest("li").after('<div class="recommendedItems ' + $(this).attr("id") + '">');
                    }
                    var recommendationsPlaceholder = $(getRecommendationsKeyElementId);

                    $.ajax({
                        url: '/recommended?id=' + this.id,
                        method: 'GET',
                        success: function(response) {
                            console.log(response);
                            $(recommendationsPlaceholder).html(recommendationsTemplate(response));
                            $('.getRecommendations.fromRecommendation').click(moreRecommendations);
                        }
                    })

                }

                function getRecommendations() {
                    var getRecommendationsKeyElementId = ".recommendedItems." + $(this).attr("id");
                    if ($(getRecommendationsKeyElementId).length == 0) {
                        // if this is the first time recommendations are coming for this track then we need to set up a div holder for the template
                        $(this).closest("li").after('<div class="recommendedItems ' + $(this).attr("id") + '">');
                    }
                    var recommendationsPlaceholder = $(getRecommendationsKeyElementId);

                    $.ajax({
                        url: "/recommendations?id=" + this.id + "&put=" + encodeURIComponent(JSON.stringify(playlistKibanaTracks[playlistOutput.indexOf(this.id)])),
                        method: "GET",
                        success: function(response) {
                            console.log(response);
                            $(recommendationsPlaceholder).html(recommendationsTemplate(response));
                            $('.getRecommendations.fromRecommendation').click(moreRecommendations);

                            // $("#recommendationsSourceControls").html(recommendationsSourceControlsTemplate(inputData));
                            // $("#popularity").change(function(){inputData.popularityValue = Number(this.value);  queryJSON.query.function_score.filter.bool.must[0].range.popularity.gte = queryData.popularity - inputData.popularityValue;queryJSON.query.function_score.filter.bool.must[0].range.popularity.lte = queryData.popularity + inputData.popularityValue;queryKibana();});

                            // $("#mode").change(function(){ if (inputData.modeChecked) {queryJSON.query.function_score.filter.bool.must.pop();inputData.modeChecked = false;               }else {inputData.modeChecked = true;queryJSON.query.function_score.filter.bool.must.push({"match":{"mode":queryData.mode}});}queryKibana();});

                            // $.ajax(kibanaSettings);
                        }
                    });
                }

                // setting up the track's DOM elements from the response from playlist fetch or search
                function paintTracks(response) {
                    console.log(response);
                    // set the fetch track function
                    function fetchMoreTracks(tracklistUrl) {
                        tracklistUrl = this.value;
                        $.ajax({
                            url: tracklistUrl,
                            headers: {
                                "Authorization": "Bearer " + access_token
                            },
                            success: function(response) {
                                paintTracks(response);
                            }
                        });
                    }

                    playlistsTracksPlaceholder.innerHTML = playlistsTracksTemplate(response);

                    $('.getRecommendations').click(getRecommendations);
                    // next and previous click track functions were here
                    $('.previousTracks').click(fetchMoreTracks);
                    $('.nextTracks').click(fetchMoreTracks);

                    // if tracks are from a users playlist iterate over the items array and fill
                    if (response.items != undefined) {
                        var playlistData = response.items;
                        playlistOutput = [];
                        playlistKibanaTracks = [];
                        for (var i = 0; i < playlistData.length; i++) {
                            if (playlistData[i].track.id == null) {
                                continue;
                            }
                            playlistOutput.push(playlistData[i].track.id);
                            artistsArray = [];
                            artistsArrayIds = [];
                            for (var j = 0; j < playlistData[i].track.artists.length; j++) {
                                artistsArray.push(playlistData[i].track.artists[j].name);
                                artistsArrayIds.push(playlistData[i].track.artists[j].id);
                            }
                            playlistKibanaTracks.push({
                                "name": playlistData[i].track.name,
                                "popularity": playlistData[i].track.popularity,
                                "album": playlistData[i].track.album.name,
                                "isrc": playlistData[i].track.external_ids.isrc,
                                "image300": playlistData[i].track.album.images[1].url,
                                "artists": artistsArray,
                                "artistsIds": artistsArrayIds
                            });

                        }
                    }
                    // else if tracks are from search iterate over the tracks.items array and fill 
                    else if (response.tracks != undefined) {
                        var playlistData = response.tracks.items;
                        playlistOutput = [];
                        playlistKibanaTracks = [];
                        for (var i = 0; i < playlistData.length; i++) {
                            playlistOutput.push(playlistData[i].id);
                            artistsArray = [];
                            artistsArrayIds = [];
                            for (var j = 0; j < playlistData[i].artists.length; j++) {
                                artistsArray.push(playlistData[i].artists[j].name);
                                artistsArrayIds.push(playlistData[i].artists[j].id);
                            }
                            playlistKibanaTracks.push({
                                "name": playlistData[i].name,
                                "popularity": playlistData[i].popularity,
                                "album": playlistData[i].album.name,
                                "isrc": playlistData[i].external_ids.isrc,
                                "image300": playlistData[i].album.images[1].url,
                                "artists": artistsArray,
                                "artistsIds": artistsArrayIds
                            });

                        }
                    }
                    // make a string of track IDs to send to Spotify API
                    var playlistString = playlistOutput.toString();
                    $.ajax({
                        url: "playlist?ids=" + playlistString,
                        success: function(response) {
                            console.log(response);
                            var trackData = response.audio_features;
                            // some stuff around circle of fifths for v2...
                            chromatic = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
                            chromaticMap = ["Cmaj", "C#", "Dmaj", "D#", "Emaj", "Fmaj", "F#", "Gmaj", "G#", "Amaj", "A#", "Bmaj"];
                            fourthMap = ["Fmaj", "F#", "Gmaj", "G#", "Amaj", "A#", "Bmaj", "Cmaj", "C#", "Dmaj", "D#", "Emaj"];
                            fifthMap = ["Gmaj", "G#", "Amaj", "A#", "Bmaj", "Cmaj", "C#", "Dmaj", "D#", "Emaj", "Fmaj", "F#"];

                            for (var i = 0; i < trackData.length; i++) {
                                playlistKibanaTracks[i]["acousticness"] = trackData[i].acousticness;
                                playlistKibanaTracks[i]["danceability"] = trackData[i].danceability;
                                playlistKibanaTracks[i]["duration_ms"] = trackData[i].duration_ms;
                                playlistKibanaTracks[i]["energy"] = trackData[i].energy;
                                playlistKibanaTracks[i]["instrumentalness"] = trackData[i].instrumentalness;
                                playlistKibanaTracks[i]["key"] = trackData[i].key;
                                playlistKibanaTracks[i]["liveness"] = trackData[i].liveness;
                                playlistKibanaTracks[i]["loudness"] = trackData[i].loudness;
                                playlistKibanaTracks[i]["mode"] = trackData[i].mode;
                                playlistKibanaTracks[i]["speechiness"] = trackData[i].speechiness;
                                playlistKibanaTracks[i]["tempo"] = trackData[i].tempo;
                                playlistKibanaTracks[i]["time_signature"] = trackData[i].time_signature;
                                playlistKibanaTracks[i]["track_href"] = trackData[i].track_href;
                                playlistKibanaTracks[i]["uri"] = trackData[i].uri;
                                playlistKibanaTracks[i]["valence"] = trackData[i].valence;
                                playlistKibanaTracks[i]["id"] = trackData[i].id;
                            }


                        }
                    });

                    $(".sendTracks").click(function() {

                        for (var i = 0; i < playlistKibanaTracks.length; i++) {
                            $.ajax({
                                url: "https://search-spotify-dev-fvkzg4s56ax24sosxjlfxn3vk4.us-west-2.es.amazonaws.com/spotify-dev/_doc/" + playlistKibanaTracks[i].id,
                                method: "PUT",
                                contentType: "application/json",
                                data: JSON.stringify(playlistKibanaTracks[i])
                            });
                        }
                    });

                }

                // a function to fetch a group of tracks based on the value of the element clicked
                function fetchTracks(tracklistUrl) {
                    tracklistUrl = this.value;
                    $.ajax({
                        url: tracklistUrl,
                        headers: {
                            "Authorization": "Bearer " + access_token
                        },
                        success: function(response) {
                            paintTracks(response);
                            $('html,body').animate({
                                    scrollTop: $("#playlistsTracks").offset().top
                                },
                                'slow');
                        }
                    });
                }

              

                // handling the spotify search function
                function searchSpotify(value) {
                    $.ajax({
                        url: "/search?q=" + value,
                        success: function(response) {
                            if (response.tracks.items.length > 0) {
                                paintTracks(response);
                            }
                            else if (response.tracks.items.length == 0) {
                                console.log('Bad Search: Try Again');
                            }
                            $('html,body').animate({
                                    scrollTop: $("#playlistsTracks").offset().top
                                },
                                'slow');
                        }
                    });
                }
                    
                    $("span .btn.btn-info.btn-lg.spotSearch").click(function(){
                        var searchTerm = $("input.form-control.input-lg.spotSearch").val();
                        searchSpotify(searchTerm);
                        
                            }
                                );

            
        })
        ();