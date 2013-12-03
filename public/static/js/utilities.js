function _l(obj){
	if(typeof obj == "object"){
		console.groupCollapsed(obj)
			console.dir(obj)
		console.groupEnd()
	}else{
		console.log((typeof obj) +': '+ obj)
	}
	return(obj)
}