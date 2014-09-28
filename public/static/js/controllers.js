var prefrControllers = angular.module('prefrControllers', []);
 

prefrControllers.controller(

	'BallotBoxCtrl', 
	[
		'$scope', 
		'$routeParams',
		'$location',
		'$http',
		'Ballot',

		function ($scope, $routeParams, $location, $http, Ballot){

			//dummy:
			var dummy	=	{
							            id      :   "1",
							            subject :   "example subject",
							            options :   [
							            				{
								            				tag		:	"A",
								                            title   :   "That government department",
								                            details :   "Beschreibung"
								                        }, 
								                        {
								            				tag		:	"B",
								                            title   :   "Titel B",
								                            details :   "Beschreibung"
								                        }, 
								                        {
								            				tag		:	"C",
								                            title   :   "Titel C",
								                            details :   "Beschreibung"
								                        }, 
								                        {
								            				tag		:	"D",
								                            title   :   "Titel D",
								                            details :   "Beschreibung"
								                        }, 
								                        {
								            				tag		:	"E",
								                            title   :   "Titel E",
								                            details :   "Beschreibung"
								                        }, 
								                        {
								            				tag		:	"F",
								                            title   :   "Titel F",
								                            details :   "Beschreibung"
								                        }
													], 
							            papers  :   [
														{
							                                id          :   "1",
							                                participant :   "user1",
							                                ranking     :   [["A"], ["B", "C"], ["D", "E", "F"]]
							                            },
							                            {
							                                id          :   "2",
							                                participant :   "user2",
							                                ranking     :   [["B"], ["C", "A"], ["D"], ["E", "F"]]
							                            },
							                            {
							                                id          :   "3",
							                                participant :   "A-user2",
							                                ranking     :   [["B"], ["C", "A"], ["D"], ["E", "F"]]
							                            },
							                            {
							                                id          :   "4",
							                                participant :   "user2",
							                                ranking     :   [["B"], ["C", "A"], ["D"], ["E", "F"]]
							                            },
							                            {
							                                id          :   "5",
							                                participant :   "user2",
							                                ranking     :   [["B"], ["C", "A"], ["D"], ["E", "F"]]
							                            },
							                            {
							                                id          :   "6",
							                                participant :   "user2",
							                                ranking     :   [["B"], ["C", "A"], ["D"], ["E", "F"]]
							                            },
							                            {
							                                id          :   "7",
							                                participant :   "user2",
							                                ranking     :   [["B"], ["C", "A"], ["D"], ["E", "F"]]
							                            }
							                        ]
									}
								
			$scope.isAdmin = true


		    $scope.addResult = function(ranking) {
		    	$scope.ballot_box.papers.unshift({
		    		id			:	-1,
		    		participant	:	'result',
		    		ranking		:	ranking
		    	})
		    }

			$scope.removeBallotPaper = function(paper_id) {
		        if($scope.ballot_box.papers[paper_id]) delete $scope.ballot_box.papers[paper_id]
		    }

		    $scope.getSchulzeRanking = function(box_id) {
		        return ["A", ["C", "D"], ["B", "E", "F"]]
		    } 


		    $scope.postBox = function() {
		    	$http.post('/api/ballotBox', $scope.ballot.exportData())
		    	.then(function(result){
		    		var ballot_data = result.data
		    		$location.path('/ballot_box/'+ballot_data.id)
		    	})
		    }

		    $scope.savePaper = function(paper){
		    	var diff 	= 	paper.diff()

		    	if(!paper.id)
		    		return	$http.post('/api/ballotBox/'+$scope.ballot.id+'/paper', data.exportData())
		    				.then(function(result){
		    					paper.importData(result.data)
		    				})

		    	if(diff.removed)
		    		return	$http.delete('/api/paper/'+paper.id)
    						.then(function(){
    							paper.importData(paper.exportData())
    						})

		    	
		   		return	$http.put('/api/ballotBox/'+$scope.ballot.id+'/paper/'+paper.id, diff)
				    	.then(function(result){
					    	paper.importData(paper.exportData())
					    })

		    }

		    $scope.updateBallotBox = function(){
		    	var data = $scope.ballot.exportData()

		    	return	$http.put('/api/ballotBox/'+data.id, {
		    				subject:	data.subject,
		    				details:	data.details,
		    				option:		data.options
		    			})
		    }

		    $scope.lockPapers = function() {
		    	$scope.ballot.papers.forEach(function(paper){ paper.locked = true })		    
		    }


			$scope.box_id		=	$routeParams.box_id

			if($scope.box_id != 'new'){
				$http.get('/api/ballotBox/'+$scope.box_id)
				.then(
					function(result){
						$scope.ballot	= new Ballot(result.data)
						$scope.lockPapers()
					},
					function(){
						$scope.ballot	= new Ballot(dummy)
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
