var three = require('three');

export function construct(type, args){
	let Constructor = three[type];
  let shiftedArgs = args.unshift(Constructor), created;
  try {
  	created = new (Constructor.bind.apply(Constructor,args))();
  } catch (e) {
  	console.warn(`attempted to create ${type} with ${args}, but failed`)
  }
  return created;
}

