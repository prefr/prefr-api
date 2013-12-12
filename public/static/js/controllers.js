var schulzeDoodleControllers = angular.module('schulzeDoodleControllers', []);
 

schulzeDoodleControllers.controller(

	'BallotBoxCtrl', 
	[
		'$scope', 
		'$routeParams',
		function ($scope, $routeParams) {
			$scope.box_id		=	$routeParams.box_id
			$scope.ballot_box	=	{
										options	:	[],
										papers	:	[]
									}

			$scope.edit			=	undefined

			//dummy:
			$scope.ballot_box	=	{
							            id      :   1,
							            subject :   "Beispiel",
							            options :   [
							            				{
								            				id		:	"A",
								                            title   :   "Titel A",
								                            details :   "Beschreibung"
								                        }, 
								                        {
								            				id		:	"B",
								                            title   :   "Titel B",
								                            details :   "Beschreibung"
								                        }, 
								                        {
								            				id		:	"C",
								                            title   :   "Titel C",
								                            details :   "Beschreibung"
								                        }
													], 
							            papers  :   [
														{
							                                id          :   1,
							                                box			:	1,
							                                participant :   "user1",
							                                ranking     :   [["A"], ["B", "C"], ["D", "E", "F"]]
							                            },
							                            {
							                                id          :   2,
							                                box			:	1,
							                                participant :   "user2",
							                                ranking     :   [["B"], ["C", "A"], ["D"], ["E", "F"]]
							                            }
							                        ]
									}

			_refactor($scope.ballot_box)

		    $scope.addBallotPaper = function() {
		    	var ballot_paper = {
		    							box			:	$scope.ballot_box.id,
										participant :   "unnamed",
										ranking     :   [["C"], ["A"], ["B"]]	
		    						}
		    	
		        $.extend(ballot_paper, {id: Math.floor(Math.random()*100)})
		        $scope.ballot_box.papers[ballot_paper.id] = ballot_paper
		    }

			$scope.removeBallotPaper = function(paper_id) {
		        if($scope.ballot_box.papers[paper_id]) delete $scope.ballot_box.papers[paper_id]
		    }

		    $scope.getSchulzeRanking = function(box_id) {
		        return ["A", "C", "B"]
		    }  
		    
		}
	]
)



