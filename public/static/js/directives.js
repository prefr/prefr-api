function HTMLballotbox() {
	return	{
				restrict	:	'E',
				link		:	function(scope, element, attrs, controller) {
									scope.getData(attrs.ballotBoxId)

									$(document).on('click', '[ballot-box-add="'+attrs.ballotBoxId+'"]', function () {
										scope.$apply(scope.addBallotPaper)
									})

									scope.$on('quick_edit', function(event, origin) {										
										if(scope != event.targetScope) scope.$broadcast('quick_edit', origin)
									})

								},

				controller	:	function($scope, Ballot) {
									$scope.ballotbox = {}

									$scope.getData = function(box_id) {
										Ballot.getBallotBox(box_id)
										.then(function(ballotbox){
											$scope.ballotbox = ballotbox
										})
									}											

									$scope.addBallotPaper = function() {
										proposed_paper	=	{
																participant	:	"unnamed",
																ranking		:	[["A", "C"], ["B"]]
															}

										$scope.ballotbox.papers = $scope.ballotbox.papers || []

										Ballot
										.addBallotPaper(proposed_paper)
										.then(function(paper){
											$scope.ballotbox.papers.push(paper)	
										})
										
									}

									$scope.removeBallotPaper = function(paper_id) {																											
										$scope.ballotbox.papers = $scope.ballotbox.papers || []

										$.each($scope.ballotbox.papers, function(index, paper){
											if(paper.id == paper_id){
												Ballot
												.removeBallotPaper(paper.id)
												.then(function(){
													$scope.ballotbox.papers.splice(index,1)
													//remove further ballot papers (although there should be none left)
													$scope.removeBallotPaper(paper_id)
												})
												return(false)
											}
										})													
									}								
								}
			}		
}



function HTMLballotpaper() {
	return	{
				restrict	:	'E',

				link		:	function(scope, element, attrs, controller) {
									scope.$on('quick_edit_echo', function(event, origin){
										if(scope != origin) scope.unsetQuickEdit()
									})

									if(!scope.paper) scope.getData(attrs.ballotPaperId)
								},

				controller	:	function($scope, Ballot) {
									$scope.quick_edit = false									

									$scope.getData = function(paper_id) {														
										Ballot.getBallotPaper(paper_id)
										.then(function(paper){
											$scope.paper = paper
											Ballot.getBallotBoxOptions(paper.box_id)
											.then(function(options){
												$scope.options = options
											})
										})
									}	

									$scope.setQuickEdit = function() {
										$scope.quick_edit = true										
									}

									$scope.unsetQuickEdit = function() {
										$scope.quick_edit = false										
									}

									$scope.quickEdit = function() {			
										$scope.setQuickEdit()																	
										$scope.$emit('quick_edit', $scope)
									}

									$scope.updateBallotPaper = function() {
										$scope.$emit('paper_update', $scope)
									}
								}

			}		
}

function HTMLranking() {
	return	{
				restrict	:	'E',

				link		:	function(scope, element, attr, controller){
									element.css({
										'position'		:	'relative'
									})

									
									element.on('mousemove', function(event){
										if(scope.dragged_element){											
											scope.dragged_element.css({
												'top'	:	event.pageY-element.offset().top-scope.dragged_element.outerHeight()/2
											})
										}
									})
								},

				controller	:	function($scope){

									this.addRank = function(rank) {																		
										rank.on('mouseenter', function(){
											if($scope.dummy){
												$scope.dummy.appendTo(rank)
											}
										})
									}

									this.startDragging = function(element){
										$scope.dragged_element = element
										if($scope.dummy) $scope.dummy.remove()
										$scope.dummy	=	element
															.clone()
															.removeClass('dragged')
															.addClass('dummy')
															.insertAfter(element)
									}

									this.drop = function(element){
										$scope.dragged_element = undefined
										if($scope.dummy) $scope.dummy.remove()
									}
								}
			}
}

function HTMLrank() {
	return	{
				restrict	:	'E',
				require		:	'^ranking',

				link		:	function(scope, element, attrs, rankingCtrl) {				
									rankingCtrl.addRank(element)				
								}
			}
}


function HTMLballotoption() {
	return	{
				restrict	:	'E',
				require		:	'^ranking',

				link		:	function(scope, element, attrs, rankingCtrl){

									function startDragging() {
										window.getSelection().removeAllRanges()
										element.css({
											
										})	

										element.addClass('dragged')										
										rankingCtrl.startDragging(element)
									}

									function drag(event) {
										
									}

									function drop() {
										window.clearTimeout(scope.wait_for_it)

										element.css({
										})	

										element.removeClass('dragged')
										rankingCtrl.drop(element)
									}

									element.on('mousedown', function(){
										if(scope.wait_For_it) return(false)

										scope.wait_for_it	=	window.setTimeout(function() {
																	//scope.dragging = true
																	startDragging()
																	
																	
																}, 500);
									})
									
									$(document).on('mouseup click', function(){										
										drop()
									})
								},

				controller	:	function($scope){
								}
			}
}