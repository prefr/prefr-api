var  ngGitReleases = angular.module('ngGitReleases', []);


ngGitReleases.provider('ngGitReleases',

    function(){

        var apiUrl = '',
            owner  = '',
            repo   = ''

        this.config     =   function(config){                                
                                this.setApiUrl(config.apiUrl)
                                this.setOwner(config.owner)
                                this.setRepo(config.repo)

                                return this
                            }


        this.setApiUrl  =   function(u){                                
                                apiUrl = u
                                return this
                            }


        this.setOwner   =   function(o){                                
                                owner = o
                                return this
                            }


        this.setRepo    =   function(r){
                                repo = r
                                return this
                            }


        this.$get       =   [
                                '$http', 

                                function($http){
                                    return {
                                        getReleases:    function(){
                                                            return  $http.get(apiUrl+'/repos/'+owner+'/'+repo+'/releases')
                                                                    .then(function(result){
                                                                        return result.data
                                                                    })
                                                        }
                                    }
                                }
                            ]
    }
)

ngGitReleases.controller('GitReleasesCtrl', [

    '$scope',
    'ngGitReleases',

    function($scope, ngGitReleases){
        ngGitReleases.getReleases()
        .then(function(data){
            data.push({
                title:  'Nothing here yet'
            })
            $scope.entries = data
        })
    }
])