var schulzeDoodle   =   angular.module('schulzeDoodle',[
                            'ngRoute',
                            'schulzeDoodleControllers'
                        ])
  
schulzeDoodle.config([
    '$routeProvider',
    function($routeProvider) {
        $routeProvider
        .when(
            '/ballot_box',
            {
                templateUrl :   'static/partials/ballot_box.html',
                controller  :   'BallotBoxCtrl'
            }
        )
        .when(
            '/ballot/:ballotId', 
            {
                templateUrl :   'static/partials/ballot.html',
                controller  :   'BallotCtrl'
            }
        )
        .otherwise({
            redirectTo: '/ballot_box'
        })
    }
]);