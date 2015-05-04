var prefrControllers = angular.module('prefrControllers', []);

prefrControllers.controller(
	'HeaderCtrl',
	[
		'$scope',
		'Storage',
		
		function($scope, Storage){
			$scope.Storage = Storage

			$scope.removeItem = function(id){
				delete Storage[id]
			}
		}
	]
)

prefrControllers.controller(
	'NewBallotBoxCtrl',
	[
		'$scope',
		'$rootScope',
		'$location',
		'$window',
		'Storage',
		'Ballot',
		'BallotOption',
		'api',

		function($scope, $rootScope, $location, $window, Storage, Ballot, BallotOption, api){


			$scope.setup = function(){				
				$rootScope.ballot 		=	$rootScope.ballot
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

				$rootScope.status_quo 	= 	$rootScope.status_quo 
											|| new BallotOption({									
												tag:		"0",
												title:		"Status Quo / do nothing.",
												details: 	"This options represents the status quo. Anything ranked above this option is considered acceptable. Everything ranked lower than this option is considered rejected.",
											})
			}

			$scope.clear = function(){
				delete $rootScope.ballot
				delete $rootScope.status_quo
				delete $rootScope.use_status_quo
			}


			$scope.next = function(){
				$location.search('step', ($location.search().step || 0)+1)
			}

			$scope.previous = function(){				
				$window.history.back()				
			}

			$scope.gotoBallot = function(){
				$location.search('step', null)
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

							$rootScope.participantLink	= url.replace(/#.*$/, '#'+ $rootScope.participantPath)
							$rootScope.adminLink		= url.replace(/#.*$/, '#'+ $rootScope.adminPath)


							Storage[data.id] = Storage[data.id] || {}

							angular.extend(Storage[data.id], {
						   		id:				data.id,
						   		subject:		data.subject,
						   		link:			$rootScope.adminLink
							})


							$scope.next()
						})
			}	

			$scope.update = function(){
				if($location.search().step == undefined)
					$scope.clear()

				$scope.step = $location.search().step || 0
				$scope.setup()	
			}


			$scope.$on('$locationChangeStart', function(){
				$scope.update()
			})

			$scope.update()
		}
	]
) 

prefrControllers.controller(

	'BallotBoxCtrl', 
	[
		'$config',
		'$scope', 
		'$routeParams',
		'$location',
		'$http',
		'$interval',
		'$q',
		'$window',
		'$location',
		'$timeout',
		'Storage',
		'Ballot',
		'BallotPaper',
		'api',

		function ($config, $scope, $routeParams, $location, $http, $interval, $q, $window, $location, $timeout, Storage, Ballot, BallotPaper, api){

								
			$scope.adminSecret 		= $routeParams.admin_secret
			$scope.box_id			= $routeParams.box_id
			$scope.isAdmin 			= !!$scope.adminSecret
			$scope.adminLink 		= $location.absUrl().replace(/\?.*$/,'')
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

									    	if(!diff || paper.removed) return $q.reject()

					    					return 	api.savePaper($scope.ballot, paper)  			
						   				}, 2000)
						   									

	    		return	paper.scheduledSave
						.then(function(data){
							paper.importData(data)
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
		    	return 	api.updateBallot($scope.ballot, $scope.adminSecret)
                        .then(function(data){
                            $scope.ballot
                            .importSettings(data)
                			.importOptions(data.options || [])

                            $scope.correctPapers()

                            if($scope.ballot.locked)
                                $scope.getSchulzeRanking()
                        })
		    }

		    $scope.checkForRemoteUpdates = function(){
		    	return 	api.getBallot($scope.ballot.id)
		    			.then(function(data){
		    				console.log('check')

		    				//Dont overwrite Ballot if changes have been made
		    				console.log($scope.ballot.diff())
		    				if(!$scope.ballot.diff())
			    				$scope.ballot
			    				.importSettings(data)
			    				.importOptions(data.options)

			    			$scope.ballot
			    			.importPapers(data.papers)
		    			})
		    }

		    $scope.lockPapers = function() {
		    	$scope.ballot.papers.forEach(function(paper){ 
		    			!Storage[$scope.ballot.id]
		    		||	!Storage[$scope.ballot.id].unlocked 
		    		|| Storage[$scope.ballot.id].unlocked.indexOf(paper.id) == -1
		    		?	paper.lock()
		    		:	paper.unlock()
		    	})

		    	$scope.ballot.papers.sort(function(p1, p2){
		    		return p1.locked
		    	})


		    }

		    $scope.getUnrankedOptions = function(paper){
		    	var ranked_options 		= paper.getRankedOptions(),
		    		available_options 	= $scope.ballot.options.map(function(option){ return option.tag })

		    	return available_options.filter(function(tag){ return ranked_options.indexOf(tag) == -1 })
		    }

		    $scope.getSurplusOptions = function(paper){
		    	var ranked_options 		= paper.getRankedOptions(),
		    		available_options 	= $scope.ballot.options.map(function(option){ return option.tag })

		    	return ranked_options.filter(function(tag){ return available_options.indexOf(tag) == -1 })
		    }

		    $scope.correctPapers = function(){
		    	$scope.ballot.papers.forEach(function(paper){
                	var unranked_options 	= $scope.getUnrankedOptions(paper),
                		surplus_options		= $scope.getSurplusOptions(paper)


                	unranked_options.forEach(function(tag){
                		paper.addOption(tag)
                	})

                	surplus_options.forEach(function(tag){
                		paper.removeOption(tag)
                	})

                })
		    }

		    $scope.setupBallotBox = function(data){
				$scope.ballot	= new Ballot(data)

				var url 		= $location.absUrl().replace(/\?.*$/, '')


				Storage[data.id] = Storage[data.id] || {}

				angular.extend(Storage[data.id], {
			   		id:			data.id,
			   		subject:	data.subject,
			   		link:		url
				})

				$scope.lockPapers()
		


				if($scope.ballot.papers.length == 0) {
					$scope.ballot.newPaper().unlock()
				}


				//watch for paper changes:
				$scope.$watch('ballot.papers', function(){

					$scope.correctPapers()

					$scope.ballot.papers.forEach(function(paper){
						if(!paper.removed)
							$scope.savePaper(paper)
					})

					angular.extend(Storage[data.id], {
				   		id:				data.id,
				   		subject:		data.subject,
				   		link:			url,
				   		unlocked:		$scope.ballot.papers
				   						.filter(function(paper){ return !paper.locked})
				   						.map(function(paper){ return paper.id })
					})

				}, true)

				//regulary check for remote changes to the ballot:
				var remoteCheck = null

				function startCheckingRemote(){
					if(!remoteCheck){
						$scope.checkForRemoteUpdates()
						remoteCheck = $interval($scope.checkForRemoteUpdates, $config.checkRemoteInterval*1000)
					}
				}

				function stopCheckingRemote(){
					if(!!remoteCheck){
						$interval.cancel(remoteCheck)
						remoteCheck = null
					}
				}

				angular.element($window).on('focus',	startCheckingRemote)
				angular.element($window).on('blur', 	stopCheckingRemote)

				$scope.$on('$destroy', function(){
					stopCheckingRemote()
					angular.element($window).off('focus', 	startCheckingRemote)
					angular.element($window).off('blur', 	stopCheckingRemote)
				})

				startCheckingRemote()

		    }


			api.getBallot($scope.box_id)
			.then($scope.setupBallotBox)
		}
	]
)
