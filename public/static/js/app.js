var schulzeDoodle   =   angular.module(
                            'schulzeDoodle',
                            [
                                'ng',
                                'ngRoute',
                                'ngAnimate',
                                'schulzeDoodleControllers',                               
                            ]
                        )

schulzeDoodle.run( function($rootScope) {    
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


schulzeDoodle.config([
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
        .otherwise({
            redirectTo: '/ballot_box/1'
        })
    }
])

schulzeDoodle.directive('singleSelect',         HTMLsingleSelect)
schulzeDoodle.directive('selectAs',             HTMLselectAs)

schulzeDoodle.directive('preferenceRanking',    ['$parse', '$animate', HTMLpreferenceRanking])
schulzeDoodle.directive('preferenceRank',       ['$animate', HTMLpreferenceRank])
schulzeDoodle.directive('preferenceOption',     ['$animate', HTMLpreferenceOption])

