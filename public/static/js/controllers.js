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
		        $http.get('/api/ballotBox/'+$scope.box_id+'/result  ')
		        .then(function(result){
		        	$scope.result =	new BallotPaper({
						        		participant: 'Result',
						        		ranking: result.data.result
						        	})
		        	$scope.result.locked = true

		        	console.dir($scope.result)
		        })
		    } 

		    $scope.saveBallotBox = function() {
		    	$http.post('/api/ballotBox', $scope.ballot.exportData())
		    	.then(function(result){
		    		var ballot_data = result.data
		    		$location.path('/ballot_box/'+ballot_data.id+'/'+ballot_data.adminSecret)
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
		    				options:			data.options,
		    				adminSecret:	$scope.adminSecret
		    			})
		    }

		    $scope.lockPapers = function() {
		    	$scope.ballot.papers.forEach(function(paper){ paper.locked = true })		    
		    }



			if($scope.box_id != 'new'){
				$http.get('/api/ballotBox/'+$scope.box_id)
				.then(
					function(result){
						$scope.ballot	= new Ballot(result.data)
						$scope.lockPapers()
					}
			    )
			} else {
				$scope.ballot =	new Ballot({
									id: 		undefined,
									subject: 	undefined,
									options:	[
													{
														tag:		"A",
														title:		undefined,
														details: 	undefined,
													}
												],
									papers:		[
													{
														id:				undefined,
														participant:	undefined,
														ranking:		[["A"]]
													}
												]

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
