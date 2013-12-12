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


				link		:	function(scope, element, attrs, controller) {								
									element.css({
										'position'		:	'relative'
									})

									scope.trackMousemovement = function(event) {
										if(!scope.next_update){		
											var	x		=	event.pageX-element.offset().left,
												y		=	event.pageY-element.offset().top,
												width	=	element.innerWidth(),
												height	=	element.innerHeight(),
												fx		=	attrs.rankingOrientation == 'horizontal' ? 0.5 : 1,
												fy		=	attrs.rankingOrientation == 'vertical' ? 0.5 : 1


											if(x < width*(1-fx))	x = width*(1-fx)	- Math.pow(width*(1-fx)-x, 0.5)
											if(x > width*fx)		x = width*fx 		+ Math.pow(x-width*fx, 0.5)

											if(y < height*(1-fy))	y = height*(1-fy)	- Math.pow(height*(1-fy)-y, 0.5)
											if(y > height*fy)		y = height*fy 		+ Math.pow(y-height*fy, 0.5)	

											var pos	=	{x:x, y:y}

											scope.$broadcast('dragging-position-update',pos)									

											//wait 20 milliseconds
											scope.next_update = window.setTimeout(function() {
																	window.clearInterval(scope.next_update)
																	delete scope.next_update																	
																}, 20)
										}
									}

									scope.$on('dragging-started', function(){										
										$(document).on('mousemove',		scope.trackMousemovement)
										$(document).trigger('mousemove')
										scope.$apply(function(){
											//?
										})										
									})

									scope.$on('dragging-done', function() {
										$(document).off('mousemove', scope.trackMousemovement)
									})
									
									
								},

				controller	:	function($scope, $element, $attrs){					
									
									$scope.rankingData = $parse($attrs.rankingData)($scope)

									this.addRank = function(index, rank){
										if(!rank){
											rank = index
											index = $scope.rankingData.length -1
										}
										$scope.$apply(function(){
											$scope.rankingData.splice(index, 0, rank)
										})
									}

									this.startDragging = function() {
										$scope.dragging = true
										$scope.$broadcast('dragging-started')	
									}

									this.stopDragging = function() {
										$scope.dragging = false
										$scope.$broadcast('dragging-done')		
									}

									this.requestDraggedElement = function(origin) {
										$scope.$broadcast('request-dragged-element', origin)
									}									
								}
			}
}

function HTMLpreferenceRank() {
	return	{
				restrict	:	'E',
				require		:	'^preferenceRanking',
				scope		:	{},

				link		:	function(scope, element, attrs, rankingCtrl) {	

									//element.clone().insertBefore(element)

									element.addClass('full')

									element.on('click', function(){
										scope.$apply(scope.insertNewRank())
									})

									scope.setup = function() {
										scope.listenToPositionUpdates()
										scope.stopWaitingForDrop = scope.$on('dragging-done', scope.cleanup)
									}

									scope.cleanup = function() {
										scope.stopWaitingForDrop()
										scope.stopListeningToUpdates()
										delete scope.stopListeningToUpdates
									}

									scope.requestDraggedElement = function() {
										rankingCtrl.requestDraggedElement(element)
									}

									scope.insertNewRank = function() {										
										rankingCtrl.addRank(scope.$index,["A"])
									}

									scope.listenToPositionUpdates = function() {
										scope.stopListeningToPositionUpdates = scope.$on('dragging-position-update', scope.evaluatePositionUpdate)																			
									}

									scope.evaluatePositionUpdate = function(event, pos) {
										if(_over(element, pos, true) > 1)	scope.requestDraggedElement()										
									}

									scope.$on('dragging-started', scope.setup) 
									
								},

				controller	:	function($scope, $element) {
									//$compile('<prefrence-rank>XXX<preference-option></preference-option></preference-rank>', $scope).insertBefore($element)
									this.addOption = function(option) {

									}
								}
			}
}


function HTMLpreferenceOption() {
	return	{
				restrict	:	'E',
				require		:	'^preferenceRanking',
				scope		:	{},

				link		:	function(scope, element, attrs, rankingCtrl){

									scope.waitForDrag = function() {
										scope.wait_for_it	=	window.setTimeout(scope.startDragging, 400);
									}

									scope.stopWaitingForDrag = function() {
										window.clearTimeout(scope.wait_for_it)
										delete scope.wait_for_it
									}

									scope.startDragging = function() {
										scope.stopWaitingForDrag()
										$(document).off('mouseup click', scope.stopWaitingForDrag)

										window.getSelection().removeAllRanges()

										scope.dummy = element.clone().addClass('dummy').insertAfter(element)
										element.addClass('dragged')
												
										$(document).one('mouseup click', scope.drop)										

										scope.listenToUpdates()
										scope.listenToRequests()
										rankingCtrl.startDragging(element)
									}

									scope.listenToUpdates = function() {
										scope.stopListeningToUpdates = scope.$on('dragging-position-update', scope.drag)
									}

									scope.listenToRequests = function() {
										scope.stopListeningToRequests = scope.$on('request-dragged-element', scope.moveToRank)										
									}

									scope.moveToRank = function(event, rank) {
										element.appendTo(rank)
										scope.dummy.appendTo(rank)
									}


									scope.drag = function(event, pos) {
										if(pos.x) element.css('left',	pos.x-element.outerWidth(true)/2)	//CSS?
										if(pos.y) element.css('top', 	pos.y-element.outerHeight(true)/2)
											
									}

									scope.drop = function() {
										scope.stopListeningToUpdates()
										delete scope.stopListeningToUpdates

										scope.stopListeningToRequests()
										delete scope.stopListeningToRequests

										scope.dummy.remove()
										delete scope.dummy

										element.removeClass('dragged')										

										rankingCtrl.stopDragging()
									}

									element.on('mousedown', function(event) {
										scope.waitForDrag()	
										event.preventDefault()
										event.stopImmediatePropagation() //ist das nötig?

										$(document).one('mouseup click', scope.stopWaitingForDrag)
									})
									
									
								},

				controller	:	function($scope){
								}
			}
}