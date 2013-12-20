function HTMLsingleSelect() {
	return	{
				restrict	:	'A',

				link		:	function(scope, element, attrs, controller) {

								},

				controller	:	function($scope) {					
									$scope.$on('select', function(event, origin){																	
										if(event.targetScope != $scope) {
											event.stopPropagation()											
											$scope.selected = origin
											$scope.select($scope.selected)	
										}
									})

									$scope.$on('deselect', function(event, origin){																	
										if(event.targetScope != $scope) {
											event.stopPropagation()
											$scope.selected = undefined
											$scope.select($scope.selected)
										}
									})

									$scope.select = function(target) {										
										$scope.$broadcast('select', target)
									}
								}

			}

}

function HTMLselectAs() {
	return	{
				restrict	:	'A',

				link		:	function(scope, element, attrs, controller) {

								},

				controller	:	function($scope, $element, $attrs) {																		
									$scope.selected = false

									$scope.$on('select', function(event, origin) {										
										$scope.selected =  (origin == $attrs.selectAs)
									})

									$scope.select = function() {
										$scope.$emit('select', $attrs.selectAs)
									}

									$scope.deselect = function() {
										$scope.$emit('deselect', $attrs.selectAs)
									}

								}

			}
}


function HTMLpreferenceRanking($parse, $animate) {
	return	{
				restrict	:	'E',
				transclude	:	true,
				templateUrl	:	'static/partials/directives/preference-ranking.html',

				link		:	function(scope, element, attrs, controller) {								
									element.css({
										'position'		:	'relative'
									})

									scope.trackMouseMovement = function(event) {
										if(!scope.next_update){													
											var	x		=	event.pageX - element.offset().left,
												y		=	event.pageY - element.offset().top,
												width	=	element.innerWidth(),
												height	=	element.innerHeight(),
												fx		=	scope.rankingOrientation == 'horizontal' ? 0.5 : 1,
												fy		=	scope.rankingOrientation == 'vertical' ? 0.5 : 1


											if(x < width*(1-fx))	x = width*(1-fx)	- Math.pow(width*(1-fx)-x, 0.5)
											if(x > width*fx)		x = width*fx 		+ Math.pow(x-width*fx, 0.5)

											if(y < height*(1-fy))	y = height*(1-fy)	- Math.pow(height*(1-fy)-y, 0.5)
											if(y > height*fy)		y = height*fy 		+ Math.pow(y-height*fy, 0.5)	

											var pos	=	{x:x, y:y}

											scope.$broadcast('dragging-position-update', pos)

											//wait 20 milliseconds
											scope.next_update = window.setTimeout(function() {
																	window.clearInterval(scope.next_update)
																	delete scope.next_update																	
																}, 30)
										}										
									}

									scope.startDragging = function(event, last_mousemove, option) {
										scope.dragged_element	= option.clone().addClass('dragged').appendTo(element)										

										option.remove()

										controller.removeOption(option.attr('value'))
										
										scope.trackMouseMovement(last_mousemove)
										
										$(document).on('mousemove',				scope.trackMouseMovement)							
										$(document).on('mouseup mouseleave',	scope.drop)
									}


									//adjust position of the dragged option (keep it attached to the cursor)
									scope.drag = function(event, pos) {								

										if(pos.x != undefined) scope.dragged_element.css('left',	pos.x - scope.dragged_element.outerWidth(true)/2)
										if(pos.y != undefined) scope.dragged_element.css('top', 	pos.y - scope.dragged_element.outerHeight(true)/2)											
									}

									scope.updateRanks = function(event, rank){
										if(scope.current_rank != rank) {
											if(scope.current_rank) scope.current_rank.removeClass('active')
											scope.current_rank = rank.addClass('active')											
										}
									}

									scope.drop = function(event) {
										$(document).off('mousemove',			scope.trackMousemovement)
										$(document).off('mouseup mouseleave',	scope.drop)

										var	index 		= scope.current_rank ? scope.current_rank.attr('index') : 0
											shadow_rank	= scope.current_rank ? scope.current_rank.attr('shadow-rank') != undefined : false
											option_id	= scope.dragged_element.attr('value')

										controller.addOption(index, option_id, shadow_rank)

										if(scope.current_rank) scope.current_rank.removeClass('active')									

										scope.dragged_element.remove()
										delete scope.dragged_element

										scope.$broadcast('dragging-done')
									}


									scope.$on('dragging-started', 			scope.startDragging)

									scope.$on('dragging-position-update', 	scope.drag)

									scope.$on('dragging-over-rank', 		scope.updateRanks)
									
									
								},

				controller	:	function($scope, $element, $attrs){					
									
									$scope.rankingOrientation = $attrs.rankingOrientation || 'vertical'									
									$scope.rankingData = $parse($attrs.rankingData)($scope)

									this.removeOption = function(id) {						
										var	rank_index		= null,
											option_index	= null

										$.each($scope.rankingData, function(i, rank){
											$.each(rank, function(j, option_id){
												if(option_id == id) {
													rank_index		= i
													option_index	= j
												}
											})											
										})

										if(option_index != null){
											$scope.rankingData[rank_index].splice(option_index, 1)
											if($scope.rankingData[rank_index].length == 0) $scope.rankingData.splice(rank_index, 1)
										}

										$scope.$apply()										
									}

									this.addOption = function(index, id, shadow_rank) {
										index = index || $scope.rankingData.length

										if(shadow_rank){
											$scope.rankingData.splice(index, 0, [id])
										}else{
											$scope.rankingData[index].push(id)
										}
										$scope.$apply()
									}
								}
			}
}

function HTMLpreferenceRank() {
	return	{
				restrict	:	'E',
				require		:	'^preferenceRanking',

				link		:	function(scope, element, attrs, rankingCtrl) {	


									scope.listenToPositionUpdates = function() {
										scope.stopListeningToPositionUpdates = scope.$on('dragging-position-update', scope.evaluatePositionUpdate)																			
									}

									scope.evaluatePositionUpdate = function(event, pos) {										
										if(_over(element, pos, true) >= 1)	scope.$emit('dragging-over-rank', element)
									}																								

									scope.listenToPositionUpdates()
									

									if(attrs.shadowRank != undefined) element.addClass('shadow')
								},

				controller	:	function($scope, $element, $attrs, $compile) {

								}
			}
}


function HTMLpreferenceOption() {
	return	{
				restrict	:	'E',
				require		:	'^preferenceRanking',

				link		:	function(scope, element, attrs, rankingCtrls){

									//Dragging controls:

									//400 ms of mouse down trigger the drag
									scope.waitForDrag = function(event) {
										scope.wait_for_it	=	window.setTimeout(scope.startDragging, 300)
										scope.trackMouseMovement(event)
										$(document).on('mousemove)', scope.trackMouseMovement)
									}							

									scope.trackMouseMovement = function(event){
										scope.last_mousemove = event
									}	

									//clear waiting timeout, attribute and event listener
									scope.stopWaitingForDrag = function() {
										$(document).off('mouseup click', scope.stopWaitingForDrag)
										$(document).off('mousemove', scope.trackMousemovement)

										window.clearTimeout(scope.wait_for_it)
										delete scope.wait_for_it										
									}

									//intitiate the dragging:
									scope.startDragging = function() {										
										//cancel wait:
										scope.stopWaitingForDrag()

										//clear selection that might have occured while holding the mouse down
										window.getSelection().removeAllRanges()
										
										scope.$emit('dragging-started', scope.last_mousemove, element)

										delete scope.last_mousemove																		
									}

									//listen for a mousedown to get the dragging started
									element.on('mousedown', function(event) {
										scope.waitForDrag(event)	
										event.preventDefault()
										event.stopImmediatePropagation() //ist das nötig?

										$(document).one('mouseup click', scope.stopWaitingForDrag)
									})

									if(attrs.dummyOption != undefined) element.addClass('dummy')
									
								},

				controller	:	function($scope){
								}
			}
}