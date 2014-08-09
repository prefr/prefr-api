var prefr   =   angular.module(
                            'prefr',
                            [
                                'ng',
                                'ngRoute',
                                'prefrControllers',  
                                'services'                             
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
            redirectTo: '/ballot_box/new'
        })
    }
])

prefr.directive('manageOptions',        [manageOptions])

prefr.directive('singleSelect',         HTMLsingleSelect)
prefr.directive('tooltip',              [HTMLtooltip])
prefr.directive('extendable',           HTMLextendable)

prefr.directive('preferenceRanking',    ['$compile', HTMLpreferenceRanking])
prefr.directive('preferenceRank',       [HTMLpreferenceRank])
prefr.directive('preferenceOption',     [HTMLpreferenceOption])

