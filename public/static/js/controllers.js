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


		    $scope.diffOptions = function(o1, o2){
		    	var hash_1		=	{},
		    		hash_2		=	{},
		    		tags		=	{}

		    	o1.forEach(function(option_1){
		    		hash_1[options_1.tag] = options_1
		    		if(tags.indexOf(option_1.tag) != -1)
		    			tags.push(option_1.tag)
		    	})


		    	o2.forEach(function(option_2){
		    		hash_2[options_2.tag] = options_2
		    		if(tags.indexOf(option_2.tag) != -1)
		    			tags.push(option_2.tag)
		    	})

		    	return 	tags.map(function(tag){
		    				
		    				//deleted entries:
		    				if(hash_1[tag] && !hash_2[tag])
		    					return	{
		    								tag: 		tag,
		    								deleted: 	true
		    							}

		    				//new entries:
		    				if(!hash_1[tag] && hash_2[tag])
		    					return hash_2[tag]

		    				return	{
		    							tag:		tag,

		    							title:		hash_1[tag].title != hash_2[tag].title
													?	undefined
													:	hash_2[tag].title,

    									details:	hash_1[tag].details != hash_2[tag].details
													?	undefined
													:	hash_2[tag].details
		    						}
		    				
		    			})

		    }

		    $scope.diffPapers = function(p1, p2){

		    	return	p2.map(function(paper){

		    				var old_paper = p2.id && p1.filer(function(old_paper){ old_paper.id == paper.id })[0]

				    		//modified entries
				    		return	old_paper
				    				?	{
					    					id:				paper.id,
					    					participant:	old_paper.participant == paper.participant
															?	undefined
															:	paper.participant,

											ranking:		JSON.stringify(hash_1[key].ranking) == JSON.stringify(hash_2[key].ranking)
															?	undefined
															:	JSON.parse(JSON.stringify(hash_2[key].ranking))
					    				}
					    			:	p2
				    	})
		    			//entries iwthout id:
		    			.concat(
				    		p2.filter(function(paper_2){
				    			return !paper_2.id
				    		})
				    	)

		    }

		    $scope.diffBallot = function(b1, b2){
		    	return	{
		    				id:			b1.id == b2.id 
		    							?	undefined 
		    							:	b2.id,

		    				subject: 	b1.subject == b2.subject 
    									?	undefined
    									:	b2.subject,

    						options:	$scope.diffOptions(b1.options, b2.options),
    						papers:		$scope.diffPapers(b1.papers, b2.papers)
		    			}
		    }

			$scope.box_id		=	$routeParams.box_id

			if($scope.box_id != 'new'){
				$http.get('/api/ballotBox/'+$scope.box_id)
				.then(
					function(data){
						$scope.ballot			= new Ballot(data)
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
