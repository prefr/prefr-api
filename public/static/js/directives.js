function HTMLsingleSelect() {
	return	{
				restrict	:	'A',
				scope		:	true,

				controller	:	function($scope, $element, $attrs) {		

									$scope.mask = function(value) {
										return($.camelCase('selection-'+value))
									}
									
									$scope.select = function(select_as, select_by) {														
										$scope[$scope.mask(select_as)]			= $scope[$scope.mask(select_as)] || {}
										$scope[$scope.mask(select_as)].value 	= select_by										
									}

									$scope.isActive = function(select_as){
										return		$scope[$scope.mask(select_as)]
												&&	$scope[$scope.mask(select_as)].value !== undefined
									}

									function setupSelection(){
										var params = $scope.$eval($attrs.singleSelect)

										if(typeof params == 'string')
											if(!$scope.isActive(key))
												$scope.select(params, undefined)

										if($.isArray(params))
											params.forEach(function(key, index){
												if(!$scope.isActive(key))
													$scope.select(key, undefined)												
											})

										if($.isPlainObject(params))
											$.each(params, function(key, value){
												if(!$scope.isActive(key))
													$scope.select(key, value)											
											})										
									}

									$scope.$watch(function(){
										setupSelection()
									})								

								}
			}

}

function HTMLextendable($timeout){
	return{
		restrict: 'AE',
		priotity: 1000,

		link: function(scope, element, atrrs){
			function refresh(){
				element[0].style.height = "auto";
  				element[0].style.height = element[0].scrollHeight + "px";
			}

			element.on('input keydown keyup change', refresh)

			refresh()

			$timeout(refresh, 0)
		}
	}
}


function HTMLpreferenceRanking($timeout, $window) {	
	return	{
				restrict	:	'E',
				scope		:	true,
				transclude	:	true,

				link		:	function(scope, element, attrs, controller, transclude) {
									var content

									element.css('position', 'relative')


									function updateRankingByModel(rankingModel){
										if(scope.dragged_option)
											return false

										element.children().remove()

										//copy rankingModel:
										ranking_data = JSON.parse(JSON.stringify(rankingModel)) || []

										scope.ranking = [['']]

										ranking_data.forEach(function(rank){
											//add dummy options:
											rank.push('')
											scope.ranking.push(rank)
											//add empty ranks:
											scope.ranking.push([''])
										})


										if(!content){
											transclude(scope, function(clone){
												content = clone
											})
										}
										element.append(content)
									}

									scope.$watch(attrs.rankingModel, function(rankingModel){
										updateRankingByModel(rankingModel)
									}, true)


									var no_drag = false

									scope.trackMouseMovement = function(event) {
										if(!scope.next_update){							
											var	x		=	event.pageX - element.offset().left,
												y		=	event.pageY - element.offset().top,
												width	=	element.innerWidth()
												height	=	element.innerHeight(),
												// fx, and fy determine from which point on dragging gets harder, fy = 0.3 means: 
												// if the cursor is within 30% of the border vertical dragging gets harder
												fx		=	scope.rankingOrientation == 'vertical' 	? 0.3 : 0,
												fy		=	scope.rankingOrientation == 'horizonal' ? 0.3 : 0

											//movement outside the element counts far less than movement inside the element:
											if(x < width*fx)		x = width*fx		- fx*Math.pow(width*fx-x, 0.75)
											if(x > width*(1-fx))	x = width*(1-fx) 	+ fx*Math.pow(x-width*(1-fx), 0.75)

											if(y < height*fy)		y = height*fy		- fy*Math.pow(height*fy-y, 0.75)
											if(y > height*(1-fy))	y = height*(1-fy) 	+ fy*Math.pow(y-height*(1-fy), 0.75)	
											

											var cx = x >= width		? width-1 	: x, 
												cy = y >= height 	? height-1 	: y

											cx = cx <= 0 ? 1 : cx
											cy = cy <= 0 ? 1 : cy

											var pos	=	{
															x:	x, 
															y:	y, 
															cx: cx,
															cy: cy
														}


											scope.drag(pos)

											
											//wait 20 milliseconds
											scope.next_update = window.setTimeout(function() {
																	window.clearInterval(scope.next_update)
																	delete scope.next_update																	
																}, 20)
										}										
									}

									scope.moveOutOption = function(option){
										var parent_rank = option.parents('preference-rank'),
											prev_empty	= (parent_rank.prev().find('preference-option').length == 1), //just the dummy option
											next_empty 	= (parent_rank.next().find('preference-option').length == 1), //just the dummy option
											empty		= (parent_rank.find('preference-option').length == 2)	//dummy option and dragged option


										option.detach()												

										if(empty && prev_empty && next_empty){
											scope.prev = parent_rank.prev().detach()
											scope.next = parent_rank.next().detach()											
										}																											
										
										if(!scope.active_rank) scope.activateRank(parent_rank)											

										parent_rank.addClass('no-transition')
									}

									scope.moveInOption = function(option){										

										option
										.appendTo(scope.active_rank)										
										.css({
											'top'	: 'auto',
											'left'	: 'auto'
										})
									

										scope.cleanRank(scope.active_rank)

										var parent_rank = option.parents('preference-rank'),
											prev		= scope.active_rank.prev('preference-rank')
											prev_empty 	= prev.length != 0 && prev.find('preference-option').length == 1
											next		= scope.active_rank.next('preference-rank')
											next_empty 	= next.length != 0 && next.find('preference-option').length == 1

										if(scope.prev) scope.prev.insertBefore(scope.active_rank)
										if(scope.next) scope.next.insertAfter(scope.active_rank)

										scope.active_rank
										.addClass('no-transition')
										.removeClass('empty')	
										.removeClass('active')

										delete scope.next
										delete scope.prev

										delete scope.active_rank
									}

									scope.startDragging = function(event, last_mousemove, option) {	
										if(no_drag) return null										
										element.addClass('dragging')
										scope.dragging = true										

										scope.moveOutOption(option)

										scope.dragged_option = option.addClass('dragged').appendTo(element)

										scope.trackMouseMovement(last_mousemove)
										$(document).on('mousemove',				scope.trackMouseMovement)							
										$(document).on('mouseup mouseleave',	scope.drop)

									}


									//adjust position of the dragged option (keep it attached to the cursor)
									scope.drag = function(pos) {	
										if(pos.x != undefined) scope.dragged_option.css('left',	pos.x - scope.dragged_option.outerWidth(true)/2)
										if(pos.y != undefined) scope.dragged_option.css('top', 	pos.y - scope.dragged_option.outerHeight(true)/2)											
									}

									scope.drop = function(event) {
										$(document).off('mousemove',			scope.trackMousemovement)
										$(document).off('mouseup mouseleave',	scope.drop)
									
										scope.dragged_option.removeClass('dragged')

										
										scope.moveInOption(scope.dragged_option)

										

										element.removeClass('dragging')										
										scope.dragging = false

										delete scope.dragged_option

										controller.evaluate()										
									}

									scope.cleanRank = function(rank){
										if(!rank) return null

										//clear textNodes:
										var childNodes 	= rank.get(0).childNodes,
											textNodes	= []


										for(key in childNodes){
											var node = childNodes[key]
											if(node.nodeType == 3) 
												textNodes.push(node)
										}

										textNodes.forEach(function(node){
											rank.get(0).removeChild(node)
										})

										//move dummy option to the end of the rank
										rank
										.find('[value=""]')
										.appendTo(rank)
									}

									scope.activateRank = function(rank){
										if(scope.active_rank == rank) return null


										//reset last active rank:
										if(!!scope.active_rank){

											var options = scope.active_rank.find('preference-option')				

											scope.active_rank.removeClass('active')
											scope.active_rank.toggleClass('nonempty', options.length > 1)
											scope.active_rank.toggleClass('empty', options.length == 1)	
											scope.active_rank.removeClass('no-transition')
										}

										//setup new active rank:
										var options = rank.find('preference-option')

										rank.addClass('active')
										rank.addClass('nonempty')
										rank.toggleClass('empty',  options.length == 1)								
										rank.removeClass('no-transition')

										scope.active_rank = rank
									}
								
									scope.rankingOrientation = attrs.rankingOrientation


									scope.$on('dragging-started', 			scope.startDragging)
									scope.$on('dragging-position-update', 	scope.drag)		

									

									element.toggleClass('horizontal',	scope.rankingOrientation == 'horizontal')
									element.toggleClass('vertical', 	scope.rankingOrientation != 'horizontal')

									element.toggleClass('no-drag', 		scope.$eval(attrs.no_drag))	



									scope.$watch(attrs.noDragging, function(){		
										no_drag = scope.$eval(attrs.noDragging)								
										element.toggleClass('no-drag', no_drag)	
										scope.$broadcast('dragging-' + (no_drag ? 'off' : 'on'))
									})	
								},

				controller	:	function($scope, $element, $attrs, $rootScope){
									
									var	self = this

									$scope.ranking 		= JSON.parse(JSON.stringify($scope.$eval($attrs.rankingModel))) || []

									this.evaluate = function(){
										var ranking = []

										$element.find('preference-rank').each(function(index, rank){
											var values = []

											$(rank).find('preference-option').map(function(index, option){
												var value = $(option).attr('value')
												
												if(value)	//ignore dummy, i.e. options witghput value
													values.push(value)
											})
											
											if(values.length > 0) ranking.push(values)
										})			

										
										var rankingModel = $scope.$eval($attrs.rankingModel)

										if(JSON.stringify(ranking) != JSON.stringify(rankingModel)){																					
											while(rankingModel.length) rankingModel.pop()
											rankingModel.push.apply(rankingModel, ranking)
											$scope.$apply()	
										}				
										
									}
								}
			}
}

function HTMLpreferenceRank() {
	return	{
				restrict	:	'E',

				link		:	function(scope, element, attrs){

									// if(element.parent().find('preference-rank').length <= 1)
									// 	scope.empty_rank.clone(true).insertBefore(element)
										
									// scope.empty_rank.clone(true).insertAfter(element)
									
									//empty at first:
									element.addClass('empty')

									scope.activate = function(){
										if(scope.dragging)
											scope.activateRank(element)
									}
									
									element.on('mouseenter', scope.activate)
									
								},

				controller	:	function($scope, $element){
									// $scope.empty_rank = $element.clone(true).addClass('empty')
									// $scope.empty_rank.find('preference-option').remove()
								}

			}
}


function HTMLpreferenceOption($scope) {
	return	{
				restrict	:	'E',

				link		:	function(scope, element, attrs){

									//Dragging controls:

									//300ms of mouse down trigger the drag
									scope.waitForDrag = function(event) {
										//the dummy option should not do anything:
										if(!attrs.value)
											return false

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

									scope.init = function(event) {
										scope.waitForDrag(event)	
										event.preventDefault()
										event.stopImmediatePropagation()

										$(document).one('mouseup click', scope.stopWaitingForDrag)
									}

									//listen for a mousedown to get the dragging started
									if(attrs.value && !scope.$eval(attrs.noDragging)) element.on('mousedown', scope.init)

									
									scope.$on('dragging-off', function(){
										element.off('mousedown', scope.init)
									})

									scope.$on('dragging-on', function(){										
										element.on('mousedown', scope.init)
									})
									
									if(attrs.value)
										element.parents('preference-rank')
										.addClass('nonempty')
										.removeClass('empty')
								}
			}
}

//Is that in use? //

function manageOptions(){
	return {	
		restrict: 'A',
		templateUrl: 'static/partials/options.html',
		scope: {
			options: "=manageOptions"
		},

		controller: function ($scope, $element, $attrs) {
			
			$scope.tag_base 	= 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'


			$scope.getTag		= 	function(index)	{ return (new Array(2+Math.floor(index/26))).join($scope.tag_base.charAt(index%26)) }
			$scope.addOption 	= 	function()	 	{ $scope.options.push({title:'', details:''});}
			$scope.removeOption = 	function(index)	{ $scope.options.slice(index,1) }

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
	}
}
