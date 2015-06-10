var  ngFlattr = angular.module('ngFlattr', []);


ngFlattr

.service('ngFlattr',[

    '$http',

    function($http){
        return  {

            getThing :  function(thingId){
                            var thing = {id: thingId}

                            thing.update = function(){
                                return $http.get('https://api.flattr.com/rest/v2/users/prefr/things/'+thingId)
                                        .then(function(result){
                                            thing.data = result.data[0]
                                        })
                            }

                            thing.update()

                            return thing
                        }

        }
    }
])



.directive('ngFlattrButton', [

    'ngFlattr',

    function(ngFlattr) {
        return  {
                    restrict:   'AE',
                    scope:      {
                                    thingId : "@",
                                    alt     : "@",
                                },

                    template:   '<img src="https://api.flattr.com/button/flattr-badge-large.png" alt="{{$alt}}"/>'+
                                '<span class ="flatters">{{thing.data.flattrs}}</span>',

                    link:       function(scope, element, attrs){
                                    scope.thing = ngFlattr.getThing(scope.thingId)

                                    scope.$watch('thing.data', function(data){
                                        if(!data) return null

                                        var  params =   "user_id="+data.owner.username+
                                                        "&url="+data.url

                                        element.attr('href', 'https://flattr.com/submit/auto?'+params)
                                    })
                                   
                                }

                }
    }
])