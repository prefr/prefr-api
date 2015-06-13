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

			element.on('input keydown keyup change focus blur', refresh)

			refresh()

			$timeout(refresh, 100)
		}
	}
}


function HTMLpreferenceRanking($timeout) {	
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
										var	x		=	event.pageX - element.offset().left,
											y		=	event.pageY - element.offset().top

										scope.drag({x:x, y:y})
							
									}
									
									scope.dragOutOption = function(option){
										var parent_rank = option.parents('preference-rank'),
											prev_empty	= (parent_rank.prev().find('preference-option').length == 1), //just the dummy option
											next_empty 	= (parent_rank.next().find('preference-option').length == 1), //just the dummy option
											empty		= (parent_rank.find('preference-option').length == 2)	//dummy option and dragged option


										option.detach()												

										if(empty && prev_empty && next_empty){
											scope.prev = parent_rank.prev().detach()
											scope.next = parent_rank.next().detach()											
										}																											
										
										scope.activateRank(parent_rank)											

										parent_rank.addClass('no-transition')
									}

									scope.dragInOption = function(option){										

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

									scope.startDragging = function(event, option) {	
										if(no_drag) return null		

										element.addClass('dragging')
										$(document).find('body').addClass('dragging')

										scope.dragging = true										

										scope.dragOutOption(option)

										scope.dragged_option = option.addClass('dragged').appendTo(element)

										scope.trackMouseMovement(event)

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

										
										scope.dragInOption(scope.dragged_option)

										
										element.removeClass('dragging')										
										$(document).find('body').removeClass('dragging')

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

									

									
								

									scope.moveOption = function(tag, dir){
										var from_rank 	=	scope.ranking.filter(function(rank){
																return rank.indexOf(tag) != -1
															})[0],
											from_index 	=	from_rank && scope.ranking.indexOf(from_rank),
											from_empty	=	from_rank && from_rank.length == 2 	// has dummy and moved option

											to_index	=	from_index+ (from_empty ? 2*dir : dir),
											to_rank		=	scope.ranking[to_index],
											to_empty	=	to_rank && to_rank.length == 1 	// has dummy

											if(!to_rank || !from_rank) return null

											scope.dragging_blocked = true

											to_rank.push(tag)
											//from_rank[from_rank.indexOf(tag)] = ""
											from_rank.splice(from_rank.indexOf(tag), 1)

											if(to_empty){
												scope.ranking.splice(to_index+1, 0, [""])
												scope.ranking.splice(to_index  , 0, [""])
											}

											if(from_empty){
												scope.ranking.splice(from_index+1,1)
												scope.ranking.splice(from_index-1,1)
											}

											controller.scheduleUpdate()
											.then(function(){
												scope.dragging_blocked = false
											})
									}


									scope.$on('up', function(e, tag){
										scope.moveOption(tag, -1)
									})

									scope.$on('down', function(e, tag){
										scope.moveOption(tag, 1)
									})

									scope.rankingOrientation = attrs.rankingOrientation


									scope.dragging_blocked = false

									scope.toggleDragging = function(){		
										var no_drag 	= scope.$eval(attrs.noDragging),
											blocked 	= scope.dragging_blocked,
											disabled	= no_drag || blocked


										element.toggleClass('no-drag', disabled)	
										scope.$broadcast('dragging-' + (disabled ? 'off' : 'on'))
									} 
							

									element.toggleClass('horizontal',	scope.rankingOrientation == 'horizontal')
									element.toggleClass('vertical', 	scope.rankingOrientation != 'horizontal')

									element.toggleClass('no-drag', 		scope.$eval(attrs.no_drag))	

									scope.$watch(attrs.noDragging, 		scope.toggleDragging)
									scope.$watch('dragging_blocked',	scope.toggleDragging) 


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
												
												if(value)	//ignore dummy, i.e. options without value
													values.push(value)
											})
											
											if(values.length > 0) ranking.push(values)
										})			

										this.updateRankingModel(ranking)
										
									}

									this.updateRankingModel = function(ranking){
										var rankingModel = $scope.$eval($attrs.rankingModel)

										if(JSON.stringify(ranking) != JSON.stringify(rankingModel)){																					
											$scope.$apply(function(){
												while(rankingModel.length) rankingModel.pop()
												rankingModel.push.apply(rankingModel, ranking)
											})	
										}
									}


									var scheduledUpdate = undefined

									this.scheduleUpdate = function(){
										if(scheduledUpdate) $timeout.cancel(scheduledUpdate)

										scheduledUpdate =	$timeout(function(){
																self.updateRankingModel($scope.ranking)
															}, 1000)

										return scheduledUpdate
									}


								}
			}
}

function HTMLpreferenceRank() {
	return	{
				restrict	:	'E',

				link		:	function(scope, element, attrs){

									
									//empty at first:
									element.addClass('empty')

									element.on('mouseenter', function(){
										//call function on parent scope:
										scope.active = true
										if(scope.dragging) scope.activateRank(element)
									})

									element.on('mouseleave', function(){
										scope.active = false
									})

									scope.$on('dragging-started', function(){
										if(scope.active) scope.activateRank(element)
									})

								},

				controller	:	function($scope, $element){
								}

			}
}


function HTMLpreferenceOption($scope) {
	return	{
				restrict	:	'E',

				link		:	function(scope, element, attrs){

									//Dragging controls:

									//200ms of mouse down trigger the drag
									scope.waitForDrag = function(event) {
										//the dummy option should not do anything:
										if(!attrs.value)
											return false

										scope.wait_for_it	=	window.setTimeout(scope.initiateDragging, 200)
										element.on('mousemove', scope.trackMouseMovement)
									}							

									scope.trackMouseMovement = function(event){
										scope.event = event 
									}



									//clear waiting timeout, attribute and event listener
									scope.stopWaitingForDrag = function() {

										window.clearTimeout(scope.wait_for_it)
										element.off('mousemove', scope.trackMouseMovement)
										delete scope.wait_for_it										
									}

									scope.initiateDragging = function() {	

										//cancel wait:
										scope.stopWaitingForDrag()

										//clear selection that might have occured while holding the mouse down
										window.getSelection().removeAllRanges()
										
										scope.startDragging(scope.event, element)
										//scope.$emit('dragging-started', element)

									}

									scope.init = function(event) {
										scope.trackMouseMovement(event)
										scope.waitForDrag(event)	
										event.preventDefault()
										event.stopImmediatePropagation()

										$(document).one('mouseup click', scope.stopWaitingForDrag)
									}

									scope.up = function(){
										scope.$emit('up', attrs.value)
									}

									scope.down = function(){
										scope.$emit('down', attrs.value)
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

			// $scope.optionUp		= 	function(index){ 
			// 							if(index == 0) return null

			// 							var x = $scope.options[index-1]

			// 							$scope.options[index-1] = $scope.options[index]
			// 							$scope.options[index] 	= x
			// 					 	}

		 // 	$scope.optionDown	= 	function(index){ 
			//  							if(index == $scope.options.length-1) return null

			// 							var x = $scope.options[index+1]

			// 							$scope.options[index+1] = $scope.options[index]
			// 							$scope.options[index] 	= x
		 // 							}
		}	
	}
}
