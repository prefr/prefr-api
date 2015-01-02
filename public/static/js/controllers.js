var prefrControllers = angular.module('prefrControllers', []);


function saveBallotBox(ballot){

}
 
prefrControllers.controller(
	'NewBallotBoxCtrl',
	[
		'$scope',
		'$rootScope',
		'$location',
		'$window',
		'Ballot',
		'BallotOption',
		'api',

		function($scope, $rootScope, $location, $window, Ballot, BallotOption, api){


			$scope.setup = function(){				
				$rootScope.step = $location.search().step || 0

				$rootScope.ballot =		$rootScope.ballot
										||
										new Ballot({
											id: 		undefined,
											subject: 	undefined,
											options:	[
															{
																tag:		"A",
																title:		"",
																details: 	"",
															}
														],
											papers:		[]

										})

				$rootScope.status_quo = $rootScope.status_quo 
										|| new BallotOption({									
											tag:		"0",
											title:		"Status Quo / do nothing.",
											details: 	"This options represents the status quo. Anything ranked above this option is considered acceptable. Everything ranked lower than this option is considered rejected.",
										})
			}

			$scope.clear = function(){
				delete $rootScope.step
				delete $rootScope.ballot
				delete $rootScope.status_quo
				delete $rootScope.use_status_quo
			}


			$scope.next = function(){
				$rootScope.step++
				$location.search('step', $rootScope.step)
			}

			$scope.previous = function(){				
				$window.history.back()
				// $rootScope.step == 0 
				// ?	$rootScope.step = 0
				// :	$rootScope.step --

				// $location.search('step', $rootScope.step)
			}
			$scope.gotoBallot = function(){
				$location.path($rootScope.adminPath)
			}

			$scope.saveBallot = function(use_status_quo){

				if(use_status_quo)
					$rootScope.ballot.options.push($rootScope.status_quo)

				return 	api.saveBallot($rootScope.ballot)
						.then(function(data){
							var url = $location.absUrl()

							$rootScope.participantPath 	= '/ballotBox/'+data.id
							$rootScope.adminPath		= '/ballotBox/'+data.id+'/'+data.adminSecret

							$rootScope.participantLink	= url.replace(/#.*/, '#'+ $rootScope.participantPath)
							$rootScope.adminLink		= url.replace(/#.*/, '#'+ $rootScope.adminPath)
							$scope.next()

							$scope.clear()
						})
			}		


			if($location.search().step == undefined){
				$scope.clear()
				$location.search('step', 0)
			}else {
				$scope.setup()	
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
									   					console.log('catch!')

									   					var ranked_options = paper.getRankedOptions()

									   					console.log(ranked_options)
									   					
									   					ranked_options
									   					.forEach(function(tag){
									   						if($scope.ballot.options.every(function(option){ return option.tag != tag }))
									   							paper.removeOption(tag)
									   					})

									   					$scope.ballot.options
									   					.forEach(function(option){
									   						if(ranked_options.indexOf(options.tag) == -1)
									   							paper.addOptions(options.tag)
									   					})

									   					return $q.when(paper.exportData())
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
		    				.importData(data)

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
