var prefrControllers = angular.module('prefrControllers', []);
 

prefrControllers.controller(

	'BallotBoxCtrl', 
	[
		'$scope', 
		'$routeParams',
		function ($scope, $routeParams) {

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
								


		    $scope.addBallotPaper = function(id, ranking) {
		    	$scope.ballot_box.papers.unshift({
		    		id			:	id !== undefined ? id : Math.floor(Math.random()*100),
					participant :   "unnamed",
					ranking     :   ranking || [Object.keys($scope.ballot_box.options)]
		    	})
		    }

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

		    $scope.lockPapers = function(papers) {
		    	$.each(papers, function(key, paper) {
		    		paper.locked = true
		    	})
		    	return(papers)
		    }


			$scope.box_id		=	$routeParams.box_id



			$.ajax({
				url: 'api/ballotBox/'+$scope.box_id,
				data: null,
				async: false
			})
			.done(function(data){
				$scope.ballot_box	= data
			})
			.error(function(){
				$scope.ballot_box	= dummy
			})
		    .always(function(data){

				$scope.ballot_box.options	= _property2key($scope.ballot_box.options, 'tag')
				//$scope.ballot_box.papers	= _property2key($scope.ballot_box.papers, 'id')

			    $scope.addBallotPaper("")
				$scope.lockPapers($scope.ballot_box.papers)

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

prefrControllers.controller(
	'NewGroupDecisionCtrl', 
	
	function ($scope, $routeParams) {		
		$scope.options 		= [{title:'', details:''}]
		$scope.tags_base 	= 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'


		$scope.getTag		= 	function(index){ return (new Array(2+Math.floor(index/26))).join($scope.tags_base.charAt(index%26)) }
		$scope.addOption 	= 	function()	 { $scope.options.push({title:'', details:''}) }
		$scope.removeOption = 	function(index){ $scope.options.slice(index,index) }

		$scope.optionUp		= 	function(index){ 
									if(index == 0) return null

									var x = $scope.options[index-1]

									$scope.options[index-1] = $scope.options[index]
									$scope.options[index] 	= x
							 	}

	 	$scope.optionDown	= 	function(index){ 
		 							if(index == $scope.options.length-1) return null

									var x = $scope.options[index+1]

									$scope.options[index+1] = $scope.options[index]
									$scope.options[index] 	= x
	 							}
	}
)

