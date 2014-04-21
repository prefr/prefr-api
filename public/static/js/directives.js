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


function HTMLrankingSource() {
	return	{
				restrict	:	'E',
				replace		:	true,
				template	:	'<code contenteditable="true" class="ranking-source"></code>',
				
				scope		:	true,

				link		:	function(scope, element, attrs) {

									scope.parseAsPreftools = function(){
										/*
										var value 	= element.text(),
											json	= ''

										_l(value)

										value = value.replace(/\n/,'][')
										value = value.replace(/\s/g, '') //remove white spaces
										value = value.replace(/\/|;/g, '"]["')
										value = value.replace(/,/g, '","')

										json += '[[["'+value+'"]]]'

										_l(json)
										*/
									}

									scope.toJSON = function(){

									}

									scope.highlight = function(text){
										var	html	= text || ""										

										html.match(/\[[^\[\]]*\]\,*/gi).forEach(function(match, index){											
											html = html.replace(match, '<div><span class="tab">'+match+'</div>')
										})
										
										return(html)
									}

									scope.update	=	function(){
										var text	= element.text(),
											data	= undefined
										
										try{
											data = JSON.parse(text)
										}catch(e){

										}	

										if(data) {
											scope.rankingData.slice(0, scope.rankingData.length) 
											Array.prototype.push.apply(scope.rankingData, data)
												
										} 

										//element.html(scope.highlight(text))
									}

									/*
									element.on('keydown', function(event){
										if(event.which == 9){
											var span	= document.createElement('span'),
												sel		= window.getSelection(),
												range	= sel.getRangeAt(0)

											range.insertNode(span)
											$(span).addClass("tab")

											range.setStartAfter(span)
											
											event.preventDefault()
											event.target.focus()
											return(false)
										}
										scope.update()
									})
									*/

									scope.rankingData = scope.rankingData || []
									element.html(JSON.stringify(scope.rankingData))									
									scope.update()

									scope.$watchCollection(attrs.rankingData, function(new_ranking, old_ranking){										
										//scope.rankingData = new_ranking
										element.html(JSON.stringify(new_ranking))
										scope.update()
									})

									scope.$watch(attrs.mode, function(){
										if(scope.$eval(attrs.mode) == 'preftools') scope.parseAsPreftools()
									})
								}

			}
}


function HTMLpreferenceRanking($parse, $animate) {
	return	{
				restrict	:	'E',
				scope		:	true,

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
												// fx, and fy determine from which pint dragging gets harder fy = 0.3 means: 
												// if the cursor is within 30% width of the border horizontal dragging gets harder
												fx		=	scope.rankingOrientation == 'vertical' ? 0.3 : 0,
												fy		=	scope.rankingOrientation == 'horizonal' ? 0.3: 0


											/*
											//movement outside the element counts far less than movement inside the element:
											if(x < width*fx)		x = width*fx		- Math.pow(width*fx-x, 0.5)
											if(x > width*(1-fx))	x = width*(1-fx) 	+ Math.pow(x-width*(1-fx), 0.5)

											if(y < height*fy)		y = height*fy		- Math.pow(height*fy-y, 0.5)
											if(y > height*(1-fy))	y = height*(1-fy) 	+ Math.pow(y-height*(1-fy), 0.5)	
											*/

											var pos	=	{x:x, y:y}

											scope.$broadcast('dragging-position-update', pos)
											
											//wait 20 milliseconds
											scope.next_update = window.setTimeout(function() {
																	window.clearInterval(scope.next_update)
																	delete scope.next_update																	
																}, 20)
										}										
									}

									scope.startDragging = function(event, last_mousemove, option) {										

										scope.dragged_element = option.clone().addClass('dragged').appendTo(element)

										controller.removeOption(option.attr('value'))
										scope.$apply()

										element.addClass('dragging')
										
										scope.trackMouseMovement(last_mousemove)

										$(document).on('mousemove',				scope.trackMouseMovement)							
										$(document).on('mouseup mouseleave',	scope.drop)
									}


									//adjust position of the dragged option (keep it attached to the cursor)
									scope.drag = function(event, pos) {	
										if(pos.x != undefined) scope.dragged_element.css('left',	pos.x - scope.dragged_element.outerWidth(true)/2)
										if(pos.y != undefined) scope.dragged_element.css('top', 	pos.y - scope.dragged_element.outerHeight(true)/2)											
									}

									scope.drop = function(event) {
										$(document).off('mousemove',			scope.trackMousemovement)
										$(document).off('mouseup mouseleave',	scope.drop)

										var	option_id = scope.dragged_element.attr('value')

										controller.addOption(option_id, controller.getActive())
										controller.setActive(null)
										controller.commit()

										element.removeClass('dragging')

										scope.dragged_element.remove()
										delete scope.dragged_element

										scope.$broadcast('dragging-done')
									}

									scope.$on('dragging-started', 			scope.startDragging)
									scope.$on('dragging-position-update', 	scope.drag)								

									element.toggleClass('horizontal',	scope.rankingOrientation == 'horizontal')
									element.toggleClass('vertical', 	scope.rankingOrientation != 'horizontal')

									element.toggleClass('no-drag', 		scope.$eval(attrs.no_drag))	

									scope.$watch(attrs.noDragging, function(){		
										var no_drag = scope.$eval(attrs.noDragging)								
										element.toggleClass('no-drag', no_drag)	
										scope.$broadcast('dragging-' + (no_drag ? 'off' : 'on'))
									})										
									
								},

				controller	:	function($scope, $element, $attrs){

									//there are to sets of rankingData:
									// -the model shared with other directives
									// -an internal set passed to ng-repeat including empty ranks
									// both sets share some of the ranks
									// it get's a bit tricky to keep them in sync when it comes to adding or removing ranks in one of the two data sets

									
									var	self			= this

									$scope.rankingData		= []
									$scope.raw_rankingData	= $scope.$eval($attrs.rankingModel)


									this.addRank			=	function(rank, after) {																		
																	var pos 	= typeof after =='number' ? after : $scope.rankingData.indexOf(after),
																		length	= $scope.rankingData.length																	
																	
																	if(pos < 0) 				$scope.rankingData.unshift(rank)
																	if(pos >= 0 && pos <length)	$scope.rankingData.splice(pos+1,0, rank)
																	if(pos >= length)			$scope.rankingData.push(rank)
																	
																}

									this.removeRank			=	function(rank) {
																	var pos = typeof rank =='number'  ? rank : $scope.rankingData.indexOf(rank)
																	if(pos != -1) $scope.rankingData.splice(pos,1)
																}

									this.isEmpty			=	function(rank) {
																	return(rank && rank.length == 0)
																}							

									this.processRankingData	=	function() {
																	var options 		= {}
																	$scope.rankingData	= []

																	this.addRank([])			

																	$scope.raw_rankingData.forEach(function(rank, index) {
																		var copy = []
																		self.addRank(copy, $scope.rankingData.length-1)

																		rank.forEach(function(option, index){
																			if(!options[option]) copy.push(option) 
																			options[option] = true	//prevent dublicates
																		})
																		self.addRank([], copy)																		
																	})
																}

									this.exportRankingData	=	function() {
																	$scope.raw_rankingData.splice(0, $scope.raw_rankingData.length)
																	$scope.rankingData.forEach(function(rank, index) {
																		if(!self.isEmpty(rank)) $scope.raw_rankingData.push(rank.slice(0))
																	})
																}

									this.promoteRank		=	function(rank) {
																	var pos 	= typeof rank == "number" ? rank : $scope.rankingData.indexOf(rank)

																	this.addRank([], pos)
																	this.addRank([], pos-1)
																}

									this.demoteRank			=	function(rank) {
																	var pos 	= typeof rank == "number" ? rank : $scope.rankingData.indexOf(rank),
																		prev	= $scope.rankingData[pos-1],
																		next	= $scope.rankingData[pos+1]

																	if(this.isEmpty(next)) this.removeRank(pos+1)
																	if(this.isEmpty(prev)) this.removeRank(pos-1)
																}

									this.findOption			=	function(option) {
																	var matches = []

																	$scope.rankingData.forEach(function(rank){
																		var pos = rank.indexOf(option)
																		if(pos != -1) {
																			matches.push({
																				rank	: rank,
																				index	: pos
																			})																			
																		}
																	})
																	return(matches)
																}		

									this.removeOption		=	function(option) {																															
																	var last_rank 	= undefined,
																		matches		= this.findOption(option)

																	matches.forEach(function(match){
																		last_rank = match.rank
																		match.rank.splice(match.index, 1)
																		if(self.isEmpty(match.rank)) self.demoteRank(match.rank) //there must not be any dublicates of option for this to work properly																		
																	})

																	return(last_rank)																			
																}

									this.addOption			=	function(option, rank) {
																	rank = rank  || $scope.rankingData.length-1
																	if(this.isEmpty(rank)) this.promoteRank(rank)
																	rank.push(option)
																}		

									this.setActive			=	function(rank) {
																	$scope.active = rank
																}

									this.getActive			=	function() {
																	return($scope.active)
																}

									this.commit				=	function() {										
																	$scope.saved = true
																	this.exportRankingData()
																	$scope.$apply()
																}

									this.processRankingData()

									$scope.$watchCollection($attrs.rankingModel, function(new_value){
										if(!$scope.saved){
											$scope.raw_rankingData	= new_value											
											self.processRankingData()											
										}
										delete $scope.saved
									}, true)

									$scope.rankingOrientation 	= $attrs.rankingOrientation || 'vertical'																		
									
								}
			}
}

function HTMLpreferenceRank($scope, $animate) {
	return	{
				restrict	:	'E',
				require		:	'^preferenceRanking',

				link		:	function(scope, element, attrs, rankingCtrl) {	
									
									scope.evaluatePositionUpdate = function(event, pos) {
										if(!scope.isActive() && _over(element, pos, true)>1) {
											scope.activate()											
										}
										scope.refresh()
									}

									scope.isEmpty = function() {
										return(rankingCtrl.isEmpty(scope.rank))
									}

									scope.isActive = function(){
										return(rankingCtrl.getActive() == scope.rank)
									}

									scope.activate = function(){
										rankingCtrl.setActive(scope.rank)	
									}

									scope.refresh = function() {										
										element.toggleClass('empty', 		scope.isEmpty())
										element.toggleClass('active', 		scope.isActive())
										element.toggleClass('nonempty',		!scope.isEmpty())
										element.toggleClass('depleted', 	scope.isEmpty() && !scope.was_empty)

										scope.was_empty = scope.isEmpty()
									}

									scope.$on('dragging-started',			scope.activate)
									scope.$on('dragging-position-update', 	scope.evaluatePositionUpdate)
									scope.$on('dragging-done',				scope.refresh)
									scope.refresh()
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

function HTMLtooltip($scope, $animate) {
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


function manageOptions(){
	return {	
		restrict: 'A',
		templateUrl: 'static/partials/options.html',
		scope: {
			options: "=manageOptions"
		},

		controller: function ($scope, $element, $attrs) {
			
			$scope.tag_base 	= 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

			$scope.$watch('options', function(x){ console.log(x) })

			console.log($scope.options)

			$scope.getTag		= 	function(index)	{ return (new Array(2+Math.floor(index/26))).join($scope.tag_base.charAt(index%26)) }
			$scope.addOption 	= 	function()	 	{ $scope.options.push({title:'', details:''});}
			$scope.removeOption = 	function(index)	{ $scope.options.slice(index,index) }

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