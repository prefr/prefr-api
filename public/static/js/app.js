var prefr   =   angular.module(
                            'prefr',
                            [
                                'ng',
                                'ngRoute',
                                'ngAnimate',
                                'ui.bootstrap',
                                'prefrControllers',                               
                            ]
                        )

prefr.run( function($rootScope) {    
    //$reflect broadcast an emitted event right back to its child scopes
    $rootScope.constructor.prototype.$reflect    =   function(eventName, callback) {
                                                        var self            =   this,
                                                            stopListening   =   this.$on(eventName, function(event) {               
                                                                                    if(event.targetScope != event.currentScope) {
                                                                                        event.stopPropagation()  

                                                                                        callback = callback || function(){} 
                                                                                        callback.call(event.targetScope, arguments)                                                                                   

                                                                                        var args = [].slice.call(arguments)
                                                                                            args.splice(0,1, eventName)
                                                                                        
                                                                                        self.$broadcast.apply(self, args)
                                                                                    }
                                                                                })
                                                        return(stopListening)
                                                    }  
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
            '/new_group_decision',
            {
                controller:     'NewGroupDecisionCtrl',
                templateUrl:    'static/partials/new_group_decision.html'
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

prefr.directive('rankingSource',        HTMLrankingSource)

prefr.directive('preferenceRanking',    ['$parse', '$animate', HTMLpreferenceRanking])
prefr.directive('preferenceRank',       ['$animate', HTMLpreferenceRank])
prefr.directive('preferenceOption',     ['$animate', HTMLpreferenceOption])

