function _l(obj){
	if(typeof obj == "object"){
		console.groupCollapsed(obj)
			console.dir(obj)
		console.groupEnd()
	}else{
		console.log((Object.prototype.toString.call( obj )) +': '+ obj)
	}
	return(obj)
}

function _refactor(coll) {

		if(Object.prototype.toString.call( coll ) === '[object Object]') {						
			$.each(coll, function(key, value){
				coll[key] = _refactor(value)
			})
		}

		if(Object.prototype.toString.call( coll ) === '[object Array]') {		
			var obj = {}				

			$.each(coll, function(index, value){
				 if(value.id != undefined) {
				 	obj[value.id] = coll[index]
				 }
				 coll[index] = _refactor(coll[index])
			})

			var length = Object.keys(obj).length

			if(length == coll.length) {
				coll = obj
			}else{
				if(length !=0) console.warn('refactoring did not work: ', coll)
			}
				
		}		

		return(coll)		
	}