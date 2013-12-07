var schulzeDoodle   =   angular.module(
                            'schulzeDoodle',
                            [
                                'ngRoute',
                                'schulzeDoodleControllers'
                            ]
                        )

schulzeDoodle.config([
    '$routeProvider',
    function($routeProvider) {
        $routeProvider
        .when(
            '/ballot_box/:box_id',
            {
                templateUrl :   'static/partials/ballot_box.html',
                controller  :   'BallotBoxCtrl'
            }
        )
        .when(
            '/polling_booth/:paper_id', 
            {
                templateUrl :   'static/partials/polling_booth.html',
                controller  :   'BallotPaperCtrl'
            }
        )
        .when(
            '/evaluate/:box_id',
            {
                templateUrl :   'static/partials/evalation.html',
                controller  :   'EvaluationCtrl'
            }
        )
        .otherwise({
            redirectTo: '/ballot_box/1'
        })
    }
])


schulzeDoodle.service('Ballot', ['$http', '$q', '$rootScope', Ballot])

schulzeDoodle.directive('Ballot', 'ballotbox',     HTMLballotbox)
schulzeDoodle.directive('Ballot', 'ballotpaper',   HTMLballotpaper)

schulzeDoodle.directive('ranking',          HTMLranking)
schulzeDoodle.directive('rank',             HTMLrank)
schulzeDoodle.directive('ballotoption',     HTMLballotoption)

