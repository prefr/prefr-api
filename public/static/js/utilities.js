function _l(obj){

	if(obj == undefined) {
		console.log(undefined)
		return(obj)
	}

	if(typeof obj == "object"){
		console.groupCollapsed(obj)
			console.dir(obj)
		console.groupEnd()
	}else{
		console.log(obj.toString())
	}
	
	return(obj)
}

function _within(boundry, point) {
	return(
		(point.x == undefined ?  true : (boundry.left	<= point.x && point.x <= boundry.right) ) 
		&& 
		(point.y == undefined ?  true : (boundry.top	<= point.y && point.y <= boundry.bottom) )
	)
}

function _over(element, mouse, rel) {	
	var	pos		=	rel ? element.position()	: element.offset(),
		margin	=	{
						top		: parseInt(element.css('margin-top')),
						bottom	: parseInt(element.css('margin-bottom')),
						left	: parseInt(element.css('margin-left')),
						right	: parseInt(element.css('margin-right'))
					},

		padding =	{
						top		: parseInt(element.css('padding-top')),
						bottom	: parseInt(element.css('padding-bottom')),
						left	: parseInt(element.css('padding-left')),
						right	: parseInt(element.css('padding-right'))
					},

		border 	=	{
						top		: parseInt(element.css('border-top-width')),
						bottom	: parseInt(element.css('border-bottom-width')),
						left	: parseInt(element.css('border-left-width')),
						right	: parseInt(element.css('border-right-width'))
					},

		point	=	{
						x : mouse.x != undefined ? mouse.x 	: undefined,
						y : mouse.y != undefined ? mouse.y 	: undefined,
					},

		width	=	element.width(),
		height	=	element.height(),	

		boundry	=	{},

		level	=	0

		//check perimeter (with margin, border and padding)

		boundry	=	{
						top		: pos.top,
						bottom	: pos.top	+ margin.top	+ border.top	+ padding.top	+ height	+ padding.bottom	+ border.bottom	+ margin.bottom,
						left	: pos.left,
						right	: pos.left	+ margin.left	+ border.left	+ padding.left	+ width		+ padding.right		+ border.right	+ margin.right,
					}

		

		if(_within(boundry, point)){
		 	level++
		} else {
			return(level)
		}


		//check hull (without margin, but with border and padding)
		boundry	=	{
						top		: pos.top	+ margin.top,
						bottom	: pos.top	+ margin.top	+ border.top	+ padding.top	+ height	+ padding.bottom	+ border.bottom,
						left	: pos.left	+ margin.left,
						right	: pos.left	+ margin.left	+ border.left	+ padding.left	+ width		+ padding.right		+ border.right,
					}

		if(_within(boundry, point)){
		 	level++
		} else {
			return(level)
		}

		
		//check content (without margin and border, but with padding)
		boundry	=	{
						top		: pos.top	+ margin.top	+ border.top,
						bottom	: pos.top	+ margin.top	+ border.top	+ padding.top	+ height	+ padding.bottom,
						left	: pos.left	+ margin.left	+ border.left,
						right	: pos.left	+ margin.left	+ border.left	+ padding.left	+ width		+ padding.right,
					}


		if(_within(boundry, point)){
		 	level++
		} else {
			return(level)
		}
		
		//check core (without margin, border and padding)
		boundry	=	{
						top		: pos.top	+ margin.top	+ border.top	+ padding.top,
						bottom	: pos.top	+ margin.top	+ border.top	+ padding.top	+ height,
						left	: pos.left	+ margin.left	+ border.left	+ padding.left,
						right	: pos.left	+ margin.left	+ border.left	+ padding.left	+ width,
					}

		if(_within(boundry, point)){
		 	return(level+1)
		} else {
			return(level)
		}		
}

function _property2key(arr, prop) {

		if(Object.prototype.toString.call( arr )  === '[object Array]') {		
			var obj = {}				

			$.each(arr, function(index, value){
				 if(value[prop] != undefined) obj[value[prop]] = value
			})

			var length = Object.keys(obj).length

			if(length == arr.length) {
				arr = obj
			}else{
				if(length !=0) console.warn('refactoring did not work: ', arr)
			}				
		}else{		
			console.warn('_property2key() used on non array.')
		}
		return(arr)
	}

function _obj2arr(obj) {
	var arr = []
	for(key in obj) arr.push(obj[key])
	return(arr)
}