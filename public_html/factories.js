/*
	FACTORIES
	Static classes you import and use in controllers and other factories.
*/

// This will cache players to avoid unnecessary HTTP requests
// Cache object
DevAAC.factory("Cache", function($http, $location) {
	var players = false;

	return {
		// Returns player from cache or false.
		findPlayerId: function(player_id) {
			if (players != false) {
				for (var i = 0; i < players.length; i++) {
					if (players[i].id == player_id) return players[i];
				}
			}
			return false;
		},
		findPlayerName: function(player_name) {
			if (players != false) {
				for (var i = 0; i < players.length; i++) {
					if (players[i].name.toLowerCase() == player_name.toLowerCase()) return players[i];
				}
			}
			return false;
		},
		// Set cache with array of players
		setPlayers: function(data) {
			if (players == false) {
                players = data;
			} else {
				// Add any player in this array that is not in cache
				for (var i = 0; i < data.length; i++) {
					var result = false;
					for (var x = 0; x < players.length; x++) {
						if (players[x].id == data[i].id) result = players[x];
					}
					if (result == false) {
						players.push(data[i]);
					}
				}
			}
			return true;
		},
		setPlayer: function(playerdata) {
			console.log("Set player data to cache:", playerdata);
			if (players == false) {
				players = new Array();
			}
			players.push(playerdata);
			return true;
		}
	}
});

// Highscore API (etc fetch top players)
DevAAC.factory("Highscores", function($http, $location) {
	return {
		experience: function() {
			return $http({
				url: ApiUrl('players'),
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
                params: {'sort': '-experience', 'limit': 5}
			})
			.success(function (data, status) {
				//console.log(data, status);
			})
			.error(function (data, status) {
				console.log(data, status);
			});
		}
	}
});

// Player API
DevAAC.factory("Player", function($http, $location) {
	return {
		get: function(player_id) {
			return $http({
				url: ApiUrl('players/'+player_id),
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
				//data: JSON.stringify({year: yearString})
			})
			.success(function (data, status) {
				console.log(data, status);
			})
			.error(function (data, status) {
				console.log(data, status);
			});
		}
	}
});

// Account API
DevAAC.factory("Account", function($http, $location) {
	var accToken = false;
	var accData = false;
	return {
		register: function(name, password, email) {
			console.log("Name: "+name+". Email: "+email+". Password: "+password);
			return $http({
				url: ApiUrl('accounts'),
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				data: JSON.stringify({'name': name, 'password': password, 'email': email})
			})
			.success(function (data, status) {
				accData = data;
				console.log(data, status);
			})
			.error(function (data, status) {
				console.log(data, status);
			});
		},
		authenticate: function(token) {
			accToken = token;
			return $http({
				url: ApiUrl('accounts/my'),
				method: 'GET',
				headers: { 'Authorization': "Basic " + token },
			})
			.success(function (data, status) {
				console.log(data, status);
			})
			.error(function (data, status) {
				console.log(data, status);
			});
		},
		getToken: function() {
			return accToken;
		},
		getAccount: function() {
			return accData;
		}
	}
});


/*
 $http.get(ApiUrl('api/command')).success(function (data, status, headers, config) {
    // success handle
 }).error(function (data, status, headers, config) {
    // error handle
 });
 */
// Add auth header to all $http request (example above)
DevAAC.factory('authInterceptor', function ($rootScope, $q, $window) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            if ($window.sessionStorage.token) {
                config.headers.Authorization = 'Basic ' + $window.sessionStorage.token;
            }
            return config;
        },
        response: function (response) {
            if (response.status === 401) {
                console.log('User is not logged in');
                // TODO: Add $rootscope.isAuthenticated globally.
            }
            return response || $q.when(response);
        }
    };
});

DevAAC.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
});

DevAAC.factory('News', ['$resource',
    function($resource){
        return $resource('/api/news', {}, {
            query: {method:'GET', isArray:true}
        });
    }
]);