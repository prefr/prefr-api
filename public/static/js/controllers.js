var prefrControllers = angular.module('prefrControllers', []);
 

prefrControllers.controller(

	'BallotBoxCtrl', 
	[
		'$scope', 
		'$routeParams',
		'$http',
		'Ballot',

		function ($scope, $routeParams, $http, Ballot){

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

		    $scope.getCleanData	= function(){
		    	var clean_box = JSON.parse(JSON.stringify($scope.ballot_box)) //bah!

		    	delete clean_box[0]

		    	clean_box.papers	= _obj2arr(clean_box.papers)
		    	clean_box.options	= _obj2arr(clean_box.options)

		    	return(clean_box)
		    }

		    $scope.postBox = function() {
		    	$.post('/api/ballotBox', JSON.stringify($scope.getCleanData()))
		    	.done(function(data){
		    		$scope.addResult(data.result)
		    		$scope.$apply()
		    	})
		    }

		    $scope.lockPapers = function() {
		    	$scope.ballot.papers.forEach(function(paper){ paper.locked = true })		    
		    }


			$scope.box_id		=	$routeParams.box_id

			if($scope.box_id != 'new'){
				$http.get('/api/ballotBox/'+$scope.box_id)
				.then(
					function(data){
						$scope.ballot	= new Ballot(data)
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
														ranking:		["A"]
													}
												]

								})
			}

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
