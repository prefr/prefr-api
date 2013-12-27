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


									scope.trackMouseMovement = function(event) {
										if(!scope.next_update){													
											var	x		=	event.pageX - element.offset().left,
												y		=	event.pageY - element.offset().top,
												width	=	element.innerWidth(),
												height	=	element.innerHeight(),
												fx		=	scope.rankingOrientation == 'horizontal' ? 0.7 : 1,
												fy		=	scope.rankingOrientation == 'vertical' ? 0.7: 1

											//movement outside the element counts far less than movement inside the element:
											if(x < width*(1-fx))	x = width*(1-fx)	- Math.pow(width*(1-fx)-x, 0.5)
											if(x > width*fx)		x = width*fx 		+ Math.pow(x-width*fx, 0.5)

											if(y < height*(1-fy))	y = height*(1-fy)	- Math.pow(height*(1-fy)-y, 0.5)
											if(y > height*fy)		y = height*fy 		+ Math.pow(y-height*fy, 0.5)	

											//	

											var pos	=	{x:x, y:y}

											scope.$broadcast('dragging-position-update', pos)
											controller.commit()
											//wait 20 milliseconds
											scope.next_update = window.setTimeout(function() {
																	window.clearInterval(scope.next_update)
																	delete scope.next_update																	
																}, 20)
										}										
									}

									scope.startDragging = function(event, last_mousemove, option) {
										
										scope.dragged_element = option.clone().addClass('dragged').appendTo(element)

										controller.replaceOption(option.attr('value'), "")
										
										scope.trackMouseMovement(last_mousemove)

										$(document).on('mousemove',				scope.trackMouseMovement)							
										$(document).on('mouseup mouseleave',	scope.drop)
									}


									//adjust position of the dragged option (keep it attached to the cursor)
									scope.drag = function(event, pos) {	
										if(pos.x != undefined) scope.dragged_element.css('left',	pos.x - scope.dragged_element.outerWidth(true)/2)
										if(pos.y != undefined) scope.dragged_element.css('top', 	pos.y - scope.dragged_element.outerHeight(true)/2)											
									}

									scope.updateRanks = function(event, rank) {
										controller.moveValue("", rank)
									}

									scope.drop = function(event) {
										$(document).off('mousemove',			scope.trackMousemovement)
										$(document).off('mouseup mouseleave',	scope.drop)

										var	option_id = scope.dragged_element.attr('value')

										controller.replaceOption("", option_id) || controller.addOption(option_id)

										controller.commit()

										scope.dragged_element.remove()
										delete scope.dragged_element	
									}


									scope.$on('dragging-started', 			scope.startDragging)

									scope.$on('dragging-position-update', 	scope.drag)

									scope.$on('dragging-into-rank', 		scope.updateRanks)									
									
								},

				controller	:	function($scope, $element, $attrs){	

									//insert empty ranks
									this.processRankingData = function(ranking) {
										var processed_ranking = [[]]
										
										$.each(ranking, function(index, rank){																																
											processed_ranking.push(rank)
											processed_ranking.push([])
											
										})

										return(processed_ranking)
									}

									//removes redundant empty ranks and move dummy to the end
									this.flattenRankingData = function(ranking){
										ranking = ranking || $scope.rankingData

										var	i = ranking.length

										while(i--) {
											//remove empty ranks around a depleted one
											if(
													this.isEmpty(ranking[i]) 
												&&	this.isDepleted(ranking[i-1])
												&&	this.isEmpty(ranking[i-2])
											){
												ranking.splice(i,1)
												ranking.splice(i-2,1)
												i -= 2
											}

											//remove double empty, keep the second
											if(this.isEmpty(ranking[i]) && this.isEmpty(ranking[i-1])){
												ranking.splice(i,1)
												i--
											}									
										}										
									}

									//insert empty Ranks in between
									this.refreshRankingData = function(ranking) {
										ranking = ranking || $scope.rankingData

										var	i = ranking.length

										while(i--) {
											if(
												   !this.isEmpty(ranking[i]) 
												&& !this.isDepleted(ranking[i])
												&& !this.isEmpty(ranking[i+1])
												&& !this.isDepleted(ranking[i+1])
											){
												ranking.splice(i+1, 0, [])
											}
										}

										if(!this.isEmpty(ranking[0]) && !this.isDepleted(ranking[0])) ranking.unshift([])
										$scope.$apply()	
									}


									//check if a rank is empty
									this.isEmpty = function(rank) {
										return(rank && rank.length == 0 )
									}

									//check if rank has no options but the placeholder
									this.isDepleted = function(rank) {
										return(rank && rank.length == 1 && rank[0] == "")
									}

									this.hasPlaceholder = function(rank) {
										return($.inArray("", rank) != -1)
									}

									//find Option
									this.findOption = function(id){
										var	option_rank		= null,
											option_index	= null

										$.each($scope.rankingData, function(i, rank){
											$.each(rank, function(j, option_id){
												if(option_id == id) {
													option_rank		= rank
													option_index	= j
												}
											})											
										})

										return({rank:option_rank, index: option_index})
									}
									
									this.removeOption = function(id) {
										var	option = this.findOption(id)

										if(option.rank){
											option.rank.splice(option.index,1)

											this.stage()
										}
									}

									this.addOption = function(id, rank) {
										if(rank){
											rank.push(id)
										}else{
											$scope.rankingData.push([id])
										}
										this.stage()
									}

									this.moveOption = function(id, rank) {	
										var	option = this.findOption(id)

										_l('id: '+id+' rank: '+rank)

										if(option.rank) {
											rank.push(option.rank.splice(option.index, 1)[0])											

											this.stage()

											return(true)
										}

										return(false)
									}

									this.replaceOption = function(id_1, id_2){
										var	option = this.findOption(id_1)

										if(option.rank){
											option.rank[option.index] = id_2
											this.stage()
											return(true)
										}
										return(false)
									}

									this.stage = function() {
										$scope.staged = true
									}

									this.commit = function() {
										if($scope.staged) {											
											this.flattenRankingData()
											this.refreshRankingData()
											$scope.$apply()
											$scope.$broadcast('ranking-update')
										}
									}


									$scope.rankingOrientation 	= $attrs.rankingOrientation || 'vertical'									
									$scope.raw_rankingData 		= $parse($attrs.ngModel)($scope)

									$scope.rankingData 			= this.processRankingData($scope.raw_rankingData)									
									this.flattenRankingData()
								}
			}
}

function HTMLpreferenceRank($scope, $animate) {
	return	{
				restrict	:	'E',
				require		:	'^preferenceRanking',

				link		:	function(scope, element, attrs, rankingCtrl) {	
									
									scope.evaluatePositionUpdate = function(event, pos) {
										if(!scope.hasPlaceholder() && _over(element, pos, true)) rankingCtrl.moveOption("", scope.rank)
									}

									scope.isEmpty = function() {
										return(rankingCtrl.isEmpty(scope.rank))
									}

									scope.isDepleted = function() {
										return(rankingCtrl.isDepleted(scope.rank))
									}

									scope.hasPlaceholder = function() {
										return(rankingCtrl.hasPlaceholder(scope.rank))
									}

									scope.refresh = function() {										
										element.toggleClass('empty', 	scope.isEmpty())
										element.toggleClass('nonempty',	!scope.isEmpty())
										element.toggleClass('depleted',	scope.isDepleted())
									}

									scope.$on('dragging-position-update', 	scope.evaluatePositionUpdate)
									scope.$on('ranking-update', 			scope.refresh)
									scope.refresh()
								},

				controller	:	function($scope, $element, $attrs, $compile) {

								}
			}
}


function HTMLpreferenceOption($scope, $animate) {
	return	{
				restrict	:	'E',
				require		:	'^preferenceRanking',

				link		:	function(scope, element, attrs, rankingCtrl){

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
									if(attrs.value) {
										element.on('mousedown', function(event) {
											scope.waitForDrag(event)	
											event.preventDefault()
											event.stopImmediatePropagation() //ist das nötig?

											$(document).one('mouseup click', scope.stopWaitingForDrag)
										})
									}									
									
								},

				controller	:	function($scope){
								}
			}
}