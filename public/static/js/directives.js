function HTMLsingleSelect() {
	return	{
				restrict	:	'A',

				link		:	function(scope, element, attrs, controller) {

								},

				controller	:	function($scope) {					
									$scope.$on('select', function(event, origin){																	
										if(event.targetScope != $scope) {											
											$scope.selected = origin
											$scope.select($scope.selected)	
										}
									})

									$scope.$on('deselect', function(event, origin){																	
										if(event.targetScope != $scope) {
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


function HTMLpreferenceRanking() {
	return	{
				restrict	:	'E',

				link		:	function(scope, element, attr, controller) {
									element.css({
										'position'		:	'relative'
									})

									
									$(document).on('mousemove', element, function(event) {
										if(scope.dragged_element){											
											scope.dragged_element.css({
												'top'	:	event.pageY-element.offset().top-scope.dragged_element.outerHeight()/2
											})
										}
									})
								},

				controller	:	function($scope){

									this.addRank = function(rank) {																		
										rank.on('mouseenter', function() {
											if($scope.dummy){
												$scope.dummy.appendTo(rank)
											}
										})
									}

									this.startDragging = function(element) {
										$scope.dragged_element = element
										if($scope.dummy){
											$scope.dummy.remove()
											delete $scope.dummy
										}
										$scope.dummy	=	element
															.clone()
															.removeClass('dragged')
															.addClass('dummy')
															.insertAfter(element)
									}

									this.drop = function(element){
										$scope.dummy.replaceWith($scope.dragged_element)
										delete $scope.dragged_element
										if($scope.dummy) {
											$scope.dummy.remove()
											delete $scope.dummy
										}
									}
								}
			}
}

function HTMLpreferenceRank() {
	return	{
				restrict	:	'E',
				require		:	'^preferenceRanking',

				link		:	function(scope, element, attrs, rankingCtrl) {				
									rankingCtrl.addRank(element)				
								}
			}
}


function HTMLpreferenceOption() {
	return	{
				restrict	:	'E',
				require		:	'^preferenceRanking',

				link		:	function(scope, element, attrs, rankingCtrl){

									function startDragging() {
										window.getSelection().removeAllRanges()

										element.addClass('dragged')										
										rankingCtrl.startDragging(element)
									}

									function drop() {
										window.clearTimeout(scope.wait_for_it)
										delete scope.wait_for_it

										if(scope.dragging){
											scope.dragging = false
											element.removeClass('dragged')
											rankingCtrl.drop()
										}
									}

									element.on('mousedown', function(event) {
										scope.wait_for_it	=	window.setTimeout(function() {
																	scope.dragging = true
																	startDragging()
																}, 400);
										event.preventDefault()
										event.stopImmediatePropagation()										
									})
									
									$(document).on('mouseup click', drop)
								},

				controller	:	function($scope){
								}
			}
}