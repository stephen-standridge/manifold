export default function convertToArgs( value ){
	if(
		typeof value === 'string' || 
		typeof value === 'number' || 
		value.constructor === Array
	){ 
		return [].concat( value )
	}

	let args = [];
	for (var key in value){
    args.push(value[key]);
	}
	return args
}