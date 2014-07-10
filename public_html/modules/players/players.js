// Module Route(s)
DevAAC.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/players/online', {
    	// When a module contains multiple routes, use 'moduleName/viewName' in PageUrl function.
        templateUrl: PageUrl('players/online'),
        controller: 'OnlineController',
        resolve: {
            vocations: function(Server) {
                return Server.vocations().$promise;
            }
        }
    });

	$routeProvider.when('/players/:id', {
		templateUrl: PageUrl('players/player'),
		controller: 'PlayerController',
        resolve: {
            vocations: function(Server) {
                return Server.vocations().$promise;
            },
            player: function(Player, $route) {
                return Player.get({id: $route.current.params.id}).$promise;
            }
        }
	});
}]);

// Module Controller(s)
DevAAC.controller('PlayerController', ['$scope', '$location', '$route', 'Account', 'Player', 'Server', 'vocations', 'player',
    function($scope, $location, $route, Account, Player, Server, vocations, player) {
        $scope.player = {
            name: player.name,
            sex: player.sex ? 'male' : 'female',
            profession: _.findWhere(vocations, {id: player.vocation}),
            level: player.level,
            residence: player.town_id,
            balance: player.balance,
            seen: moment.unix(player.lastlogin).format('LLL') + " → " + moment.unix(player.lastlogout).format('LLL'),
            onlineTime: moment.duration(player.onlinetime, 'seconds').humanize()
        };

        $scope.account = Account.factory.get({id: player.account_id}, function(account) {
            $scope.account = {
                id: account.id,
                type: account.type,
                premdays: account.premdays,
                lastday: account.lastday,
                creation: moment(account.creation).format('LLL'),
                status: account.premdays > 0 ? 'Premium account' : 'Free account'
            };
        });

        $scope.players = Player.query({account_id: player.account_id}, function(players) {
            $scope.players = players;
        });
    }
]);

DevAAC.controller('OnlineController', ['$scope', 'Player', 'Server', 'vocations',
    function($scope, Player, Server, vocations) {
        $scope.players = Player.queryOnline();
        $scope.loadingView = true;

        $scope.vocation = function(id) {
            return _.findWhere(vocations, {id: id});
        };
    }
]);

// Module Factories(s)
DevAAC.factory('Player', ['$resource',
    function($resource) {
        return $resource(ApiUrl('players/:id'), {}, {
            get: { cache: true },
            queryOnline: { params: {id: 'online', embed: 'player'}, isArray: true, cache: true },
            highExperience: { params: {sort: '-experience', limit: 5}, isArray: true, cache: true },
            my: { url: ApiUrl('accounts/my/players'), isArray: true, cache: true }
        });
    }
]);