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

schulzeDoodle.directive('singleSelect',         HTMLsingleSelect)
schulzeDoodle.directive('selectAs',             HTMLselectAs)

schulzeDoodle.directive('preferenceRanking',    HTMLpreferenceRanking)
schulzeDoodle.directive('preferenceRank',       HTMLpreferenceRank)
schulzeDoodle.directive('preferenceOption',     HTMLpreferenceOption)

