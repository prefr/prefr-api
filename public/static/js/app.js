var prefr   =   angular.module(
                            'prefr',
                            [
                                'ng',
                                'ngRoute',
                                'ngAnimate',
                                'prefrControllers',                               
                            ]
                        )

prefr.run( function($rootScope) {    
    $rootScope.isAdmin = true
})


prefr.config([
    '$routeProvider',
    function($routeProvider) {
        $routeProvider
        .when(
            '/',
            {
                templateUrl :   'static/partials/root.html'
            }
        )
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
        .when(
            'import',
            {
                templateURL :   'static/partials/import.html',
                controller  :   'ImportCtrl'
            }
        )
        .when(
            '/test',
            {
                templateUrl :   'static/partials/test.html',
                controller  :   'Test'
            }
        )
        .otherwise({
            redirectTo: '/ballot_box/1'
        })
    }
])

prefr.directive('singleSelect',         HTMLsingleSelect)
prefr.directive('tooltip',              ['$animate', HTMLtooltip])
prefr.directive('extendable',           HTMLextendable)

prefr.directive('rankingSource',        HTMLrankingSource)

prefr.directive('preferenceRanking',    ['$parse', '$animate', HTMLpreferenceRanking])
prefr.directive('preferenceRank',       ['$animate', HTMLpreferenceRank])
prefr.directive('preferenceOption',     ['$animate', HTMLpreferenceOption])

