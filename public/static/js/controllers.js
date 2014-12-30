var prefrControllers = angular.module('prefrControllers', []);


function saveBallotBox(ballot){

}
 
prefrControllers.controller(
	'NewBallotBoxCtrl',
	[
		'$scope',
		'$rootScope',
		'$location',
		'Ballot',
		'api',

		function($scope, $rootScope, $location, Ballot, api){

			$scope.step = $location.search().step || 0

			$scope.ballot =	$scope.ballot
								||
								new Ballot({
									id: 		undefined,
									subject: 	undefined,
									options:	[
													{									
														tag:		"0",
														title:		"Any of the above and none of the below",
														details: 	"This is a special option. You may delete it if you like. It is useful though if you want to allow your participants to reject an option altogether. They can do that by ranking the disliked option lower than this one. If in the end this option ('Any of the above and none of the below') wins the ballot all options have been rejected.",
													},
													{
														tag:		"A",
														title:		"First option",
														details: 	"",
													}
												],
									papers:		[]

								})

			$scope.next = function(){
				$scope.step++
				//$location.search('step', $scope.step)
			}

			$scope.previous = function(){				
				$scope.step == 0 
				?	$scope.step = 0
				:	$scope.step --

				//$location.search('step', $scope.step)
			}
			$scope.gotoBallot = function(){
				console.log($scope.adminPath)
				$location.path($scope.adminPath)
			}

			$scope.saveBallot = function(){
				return 	api.saveBallot($scope.ballot)
						.then(function(data){
							var url = $location.absUrl()

							$scope.participantPath 	= '/ballotBox/'+data.id
							$scope.adminPath		= '/ballotBox/'+data.id+'/'+data.adminSecret

							$scope.participantLink	= url.replace(/#.*/, '#'+ $scope.participantPath)
							$scope.adminLink		= url.replace(/#.*/, '#'+ $scope.adminPath)
							$scope.next()
						})
			}			
		}
	]
) 

prefrControllers.controller(

	'BallotBoxCtrl', 
	[
		'$scope', 
		'$routeParams',
		'$location',
		'$http',
		'$q',
		'$timeout',
		'Ballot',
		'BallotPaper',
		'api',

		function ($scope, $routeParams, $location, $http, $q, $timeout, Ballot, BallotPaper, api){

								
			$scope.adminSecret 		= $routeParams.admin_secret
			$scope.box_id			= $routeParams.box_id
			$scope.isAdmin 			= !!$scope.adminSecret
			$scope.adminLink 		= $location.absUrl()
			$scope.participantLink	= $scope.adminLink.replace('/'+$scope.adminSecret, '')

			$scope.removeBallotPaper = function(paper_id) {
		        if($scope.ballot_box.papers[paper_id]) delete $scope.ballot_box.papers[paper_id]
		    }

		    $scope.getSchulzeRanking = function() {
		        $http.get('/api/ballotBox/'+$scope.box_id+'/result')
		        .then(function(result){
		        	$scope.result =	new BallotPaper({
						        		participant: 'Result',
						        		ranking: result.data.result
						        	})
		        	$scope.result.lock()
		        })
		    } 

		    $scope.lockBallotBox = function(){
		    	$http.post('/api/ballotBox/'+$scope.box_id+'/lock',{
		        	'adminSecret' : $scope.adminSecret
		        })
		        .then(function(result){
		        	$scope.ballot.importData(result.data)
		        	if($scope.ballot.locked)
						$scope.getSchulzeRanking()
					$scope.lockPapers()
		        })
		    }

		    $scope.savePaper = function(paper){
    			if(paper.scheduledSave)
	    			$timeout.cancel(paper.scheduledSave)
	    		
				paper.scheduledSave	=	$timeout(function(){
											var diff = paper.diff()

									    	if(!diff) return $q.reject()

									    	var data = 	paper.id
									    				?	diff
									    				:	paper.exportData()


									    	var api_call = 	paper.id
						    								?	$http.put('/api/ballotBox/'+$scope.ballot.id+'/paper/'+paper.id, data)
		    												:	$http.post('/api/ballotBox/'+$scope.ballot.id+'/paper', data)

					    					return 	api_call
					    							.catch(function(){
									   					console.log('catch')
									   					return  api.getBallot($scope.ballot.id)
									   							.then(function(data){
									   								$scope.ballot
									   								.importSettings(data)		
									   								.importOptions(data.options)

									   								return $scope.savePaper(paper)
									   							})
									   				})    			
						   				}, 2000)
						   									

	    		return	paper.scheduledSave
						.then(function(result){
							paper.importData(result.data)
						})
		    }

		    $scope.removePaper = function(paper){
		    	$scope.ballot.removePaper(paper)
		    	return 	paper.id
    					?	$http.delete('/api/ballotBox/'+$scope.ballot.id+'/paper/'+paper.id)	    	
    					:	$q.when()
		    }

		    $scope.restorePaper = function(paper){
		    	$scope.ballot.restorePaper(paper)

		    	return	paper.id
		    			?	$http.post('/api/ballotBox/'+$scope.ballot.id+'/paper', paper.exportData())
			    			.then(function(result){
			    				paper.importData(result.data)
			    			})
			    		:	$q.when()
		    }

		    $scope.updateBallotBox = function(){
		    	var data = $scope.ballot.exportData()

		    	return	api.updateBallot({
		    				id:				$scope.box_id,
		    				subject:		data.subject,
		    				details:		data.details,
		    				options:		data.options,
		    				adminSecret:	$scope.adminSecret
		    			})
		    			.then(function(data){
		    				$scope.ballot
		    				.importSettings(data)
		    				.importOptions(data.options)

		    				if($scope.ballot.locked)
								$scope.getSchulzeRanking()
		    			})
		    }

		    $scope.lockPapers = function() {
		    	$scope.ballot.papers.forEach(function(paper){ paper.lock()})		    
		    }


			api.getBallot($scope.box_id)
			.then(function(data){
				$scope.ballot	= new Ballot(data)

				$scope.lockPapers()

				if($scope.ballot.papers.length == 0)
					$scope.ballot.newPaper()


				$scope.$watch('ballot', function(){
					$scope.ballot.papers.forEach(function(paper){
						$scope.savePaper(paper)
					})
				}, true)
			})
		}
	]
)


prefrControllers.controller(

	'Test', 
	[
		'$scope', 
		'$routeParams',
		function ($scope, $routeParams) {
			$scope.evaluate = function(ballot_box) {				
				return($.post('api/ballotBox', _l($(ballot_box).val())))
			}
		}
	]
)
