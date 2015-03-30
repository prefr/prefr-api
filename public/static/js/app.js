var prefr   =   angular.module(
                            'prefr',
                            [
                                'ng',
                                'ngRoute',
                                'ngAnimate',
                                'ngSanitize',
                                'prefrControllers',  
                                'prefrFilters',  
                                'services'                                                             
                            ]
                        )

prefr.run( function($rootScope) {    
    $rootScope.console      = window.console
})


prefr.config([
    '$routeProvider',
    function($routeProvider) {
        $routeProvider
        .when(
            '/ballotBox/new',
            {
                templateUrl :   'static/partials/new_ballot_box.html',
                controller  :   'NewBallotBoxCtrl',
                reloadOnSearch: false
            }
        )
        .when(
            '/ballotBox/:box_id/:admin_secret?',
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
            redirectTo:     '/ballotBox/new'
        })
    }
])



prefr.directive('manageOptions',        [manageOptions])

prefr.directive('singleSelect',         [HTMLsingleSelect])
prefr.directive('extendable',           ['$timeout', HTMLextendable])

prefr.directive('preferenceRanking',    [HTMLpreferenceRanking])
prefr.directive('preferenceRank',       [HTMLpreferenceRank])
prefr.directive('preferenceOption',     [HTMLpreferenceOption])

                
