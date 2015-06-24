"use strict";

var prefr   =   angular.module(
                            'prefr',
                            [
                                'ng',
                                'ngRoute',
                                'ngAnimate',
                                'ngSanitize',
                                'prefrControllers',  
                                'prefrFilters',  
                                'services',
                                'ngGitReleases',
                                'ngFlattr'                                                             
                            ]
                        )

prefr.constant('$config', {
    'flattrThingId'         :   '4251245',
    'checkRemoteInterval'   :   60,
    'gitReleases'           :   {
                                    apiUrl: 'https://api.github.com',
                                    owner:  'prefr',
                                    repo:   'prefr'
                                }
})

prefr.run( function($rootScope, $config) {    
    $rootScope.console      = window.console
    $rootScope.$config      = $config
})


prefr.config([
    '$config',
    '$routeProvider',
    '$locationProvider',
    'apiProvider',
    'ngGitReleasesProvider',

    function($config, $routeProvider, $locationProvider, apiProvider, ngGitReleasesProvider) {

        apiProvider.setApiUrl('http://api.prefr.org/api')

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
        .when(
            '/releases',
            {
                templateUrl :   'static/partials/releases.html',
                controller  :   'GitReleasesCtrl'
            }
        )
        .otherwise({
            redirectTo:     '/ballotBox/new'
        })

        // use the HTML5 History API
        $locationProvider.html5Mode(true);

        ngGitReleasesProvider
        .config($config)
    }
])



prefr.directive('manageOptions',        [manageOptions])

prefr.directive('singleSelect',         [HTMLsingleSelect])
prefr.directive('extendable',           ['$timeout', HTMLextendable])

prefr.directive('preferenceRanking',    ['$timeout', '$window', HTMLpreferenceRanking])
prefr.directive('preferenceRank',       [HTMLpreferenceRank])
prefr.directive('preferenceOption',     [HTMLpreferenceOption])

                
