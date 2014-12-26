var prefr   =   angular.module(
                            'prefr',
                            [
                                'ng',
                                'ngRoute',
                                'ngAnimate',
                                'ngSanitize',
                                'prefrControllers',  
                                'services'                                                             
                            ]
                        )

prefr.run( function($rootScope) {    
    $rootScope.isAdmin      = true
    $rootScope.help         = {}
    $rootScope.console      = window.console
    $rootScope.help.open    = function(){}
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
            '/ballotBox/new',
            {
                templateUrl :   'static/partials/new_ballot_box.html',
                controller  :   'NewBallotBoxCtrl'
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

prefr.directive('singleSelect',         [HTMLsingleSelect])
prefr.directive('extendable',           ['$timeout', HTMLextendable])

prefr.directive('preferenceRanking',    ['$compile', HTMLpreferenceRanking])
prefr.directive('preferenceRank',       [HTMLpreferenceRank])
prefr.directive('preferenceOption',     [HTMLpreferenceOption])

                
