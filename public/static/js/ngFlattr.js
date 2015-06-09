var  ngFlattr = angular.module('ngFlattr', []);


ngFlattr.service('ngFlattr',[

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