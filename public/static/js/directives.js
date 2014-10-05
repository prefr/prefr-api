function HTMLsingleSelect() {
	return	{
				restrict	:	'A',
				scope		:	true,

				controller	:	function($scope, $element, $attrs) {									
									var params 			= $scope.$eval($attrs.singleSelect),
										selection_map	= {}

									$scope.mask = function(value) {
										return($.camelCase('selection-'+value))
									}
									
									$scope.select = function(select_as, select_by) {														
										$scope[$scope.mask(select_as)].value = select_by										
									}

									if(typeof params == 'string'){
										selection_map[$scope.mask(params)] = null
									} 

									if($.isArray(params)) {
										params.forEach(function(value, index){
											selection_map[$scope.mask(value)] = {
																					default	:	null,
																					value	:	null
																				}
										})
									}

									if($.isPlainObject(params)) {
										$.each(params, function(key, value){
											selection_map[$scope.mask(key)] =	{
																					default	: value,
																					value	: value
																				}
										})
									} 

									$.extend($scope, selection_map)

								}
			}

}

function HTMLextendable(){
	return{
		restrict: 'AE',
		link: function(scope, element){
			element.on('input keydown keyup change', function() {
  				element[0].style.height = "";
  				element[0].style.height = element[0].scrollHeight + "px";
			})
		}
	}
}


function HTMLpreferenceRanking() {	
	return	{
				restrict	:	'E',
				scope		:	true,
				transclude	:	true,

				link		:	function(scope, element, attrs, controller, transclude) {
									var content

									element.css('position', 'relative')


									scope.$watch(attrs.rankingModel, function(rankingModel){
										if(scope.dragged_option)
											return false

										element.children().remove()

										//copy rankingModel
										scope.ranking = JSON.parse(JSON.stringify(rankingModel)) || []


										if(!content){
											transclude(scope, function(clone){
												content = clone
											})
										}
										element.append(content)

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
											scope.positionUpdate(pos)

											
											//wait 20 milliseconds
											scope.next_update = window.setTimeout(function() {
																	window.clearInterval(scope.next_update)
																	delete scope.next_update																	
																}, 10)
										}										
									}

									scope.positionUpdate = function(pos){
										var over = false

										var ranks = element.find('preference-rank')

										ranks.each(function(index, rank_DOM){
											var rank = $(rank_DOM)

											over = !over && pos && (_over(rank, {x:pos.cx, y: pos.cy} , true, true, false) >= 1)

											if(over) scope.active_rank = rank
											

											rank.toggleClass('active',		over)
											rank.toggleClass('empty',		rank.find('preference-option').length == 0)	
											rank.toggleClass('nonempty',	rank.find('preference-option').length != 0 || over)

											rank.removeClass('no-transition')
										})

									}

									scope.startDragging = function(event, last_mousemove, option) {	
										if(no_drag) return null



										var parent_rank = option.parents('preference-rank')
											prev_empty	= (parent_rank.prev().find('preference-option').length == 0),
											next_empty 	= (parent_rank.next().find('preference-option').length == 0),
											empty		= (parent_rank.find('preference-option').length == 1)

										parent_rank
										.addClass('no-transition')
										.addClass('active')

										if(empty && prev_empty && next_empty){
											parent_rank.prev().remove()
											parent_rank.next().remove()
											parent_rank.addClass('empty')
										}

										scope.active_rank = parent_rank

										scope.dragged_option = option.addClass('dragged').appendTo(element)
										element.addClass('dragging')

										//scope.demoteRanks()	
										
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
									

										scope.active_rank
										.addClass('no-transition')
										.removeClass('active')
										.removeClass('empty')


										scope.dragged_option
										.appendTo(scope.active_rank)
										.removeClass('dragged')
										.css({
											'top'	: 'auto',
											'left'	: 'auto'
										})

										var prev		= scope.active_rank.prev('preference-rank')
											prev_empty 	= prev.length != 0 && prev.find('preference-option').length == 0
											next		= scope.active_rank.next('preference-rank')
											next_empty 	= next.length != 0 && next.find('preference-option').length == 0


										if(!prev_empty)
											scope.active_rank.scope().empty_rank.clone(true).insertBefore(scope.active_rank)
										

										if(!next_empty)
											scope.active_rank.scope().empty_rank.clone(true).insertAfter(scope.active_rank)


										element.removeClass('dragging')

										delete scope.dragged_option
										delete scope.active_rank

										controller.evaluate()
									}

									scope.rankingOrientation = attrs.rankingOrientation


									scope.$on('dragging-started', 			scope.startDragging)
									scope.$on('dragging-position-update', 	scope.drag)		
									scope.$on('dragging-position-update', 	scope.positionUpdate)		

									

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
												values.push( $(option).attr('value') )
											})
											
											if(values.length > 0) ranking.push(values)
										})			

										
										var rankingModel = $scope.$eval($attrs.rankingModel)

										if(JSON.stringify(ranking) != JSON.stringify(rankingModel)){																					
											while(rankingModel.length) rankingModel.pop()
											rankingModel.push.apply(rankingModel, ranking)	
										}				
										
									}

								}
			}
}

function HTMLpreferenceRank() {
	return	{
				restrict	:	'E',

				link		:	function(scope, element, attrs){

									if(element.parent().find('preference-rank').length <= 1)
										scope.empty_rank.clone(true).insertBefore(element)
										
									scope.empty_rank.clone(true).insertAfter(element)
									
									element.addClass('nonempty')
								},

				controller	:	function($scope, $element){
									$scope.empty_rank = $element.clone(true).addClass('empty')
									$scope.empty_rank.find('preference-option').remove()
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
											event.stopImmediatePropagation() //is this necessary

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
									
								}
			}
}


function HTMLtooltip($scope) {	
	return	{
				restrict	:	'E',

				link		:	function(scope, element, attrs) {
									var marker = $('<div></div>')

									element.append(marker).addClass(scope.$eval(attrs.class))

									marker.css({
										"transform"	:	"rotate(-45deg)",
										"position"	:	"absolute",	
										"width"		:	"1em",
										"height"	:	"1em"
									})

									element.css({
										"position"	:	"absolute"
									})

									scope.$watch(attrs.class, function(){
										marker.class = scope.$eval(attrs.class)
									})
								}

			}
}


function HTMLWalkthrough(walkthrough){
	return {
		restrict: 'AE',
		templateUrl: '/static/partials/walkthrough_tag.html',
		transclude: true,

		controller: function($scope, $element, $attrs){
			$element.addClass('point-'+$attrs.direction)

			$scope.path 	= $attrs.path
			$scope.step 	= $attrs.step	
			$scope.next		= $attrs.next
			$scope.nextPath	= $attrs.nextPath


			$scope.hide = function(){
				$scope.active = false
			}

			$scope.show = function(){
				$scope.active = true
			}

			$scope.skip = function(){
				walkthrough.goto($scope.nextPath, $scope.next)
			}


			walkthrough.register($scope.path, $scope.step, $scope)	
		}
	}
}


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