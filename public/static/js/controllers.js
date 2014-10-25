var prefrControllers = angular.module('prefrControllers', []);
 

prefrControllers.controller(

	'BallotBoxCtrl', 
	[
		'$scope', 
		'$routeParams',
		'$location',
		'$http',
		'$q',
		'Ballot',
		'BallotPaper',

		function ($scope, $routeParams, $location, $http, $q, Ballot, BallotPaper){

								
			$scope.adminSecret 		= $routeParams.admin_secret
			$scope.box_id			= $routeParams.box_id
			$scope.isAdmin 			= $scope.box_id == 'new' || !!$scope.adminSecret
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

		    $scope.saveBallotBox = function() {
		    	$http.post('/api/ballotBox', $scope.ballot.exportData())
		    	.then(function(result){
		    		var ballot_data = result.data
		    		$location
		    		.path('/ballot_box/'+ballot_data.id+'/'+ballot_data.adminSecret)
		    		.replace()
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
		    	var diff 		=	paper.diff()
		    		api_call	=	paper.id
    								?	$http.put('/api/ballotBox/'+$scope.ballot.id+'/paper/'+paper.id, diff)
    								:	$http.post('/api/ballotBox/'+$scope.ballot.id+'/paper', paper.exportData())

	    		return	api_call
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

		    	return	$http.put('/api/ballotBox/'+data.id, {
		    				subject:		data.subject,
		    				details:		data.details,
		    				options:		data.options,
		    				adminSecret:	$scope.adminSecret
		    			})
		    			.then(function(result){
		    				console.dir(result)
		    				$scope.ballot
		    				.importSettings(result.data)
		    				.importOptions(result.data.options)

		    				if($scope.ballot.locked)
								$scope.getSchulzeRanking()
		    			})
		    }

		    $scope.lockPapers = function() {
		    	$scope.ballot.papers.forEach(function(paper){ paper.lock()})		    
		    }



			if($scope.box_id != 'new'){
				$http.get('/api/ballotBox/'+$scope.box_id)
				.then(
					function(result){
						$scope.ballot	= new Ballot(result.data)

						$scope.lockPapers()

						if($scope.ballot.papers.length == 0)
							$scope.ballot.newPaper()
					}
			    )
			} else {
				$scope.ballot =	new Ballot({
									id: 		undefined,
									subject: 	undefined,
									options:	[
													{									
														tag:		"0",
														title:		"All of the above and none of the below",
														details: 	"This is a special option. You may delete it if you like. It is useful though if you want to allow your participants to reject an option altogether. They can do that by ranking the disliked option lower than this one. If in the end this option ('All of the above and none of the below') wins the ballot all options have been rejected.",
													},
													{
														tag:		"A",
														title:		"First option",
														details: 	"",
													}
												],
									papers:		[]

								})
				$scope.saveBallotBox()
			}


			$scope.original_ballot 	= angular.extend({}, $scope.ballot)

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
