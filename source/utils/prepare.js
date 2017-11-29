export function prepareObject(context, type) {
	if (context[type]) return context;
	Object.defineProperty(context, type, {
		value: {},
		enumerable: false,
		writable: true,
		configurable: true
	})
	return context;
}

export function prepareArray(context, type) {
	if(context[type]) return;
	Object.defineProperty(context, type, {
		value: [],
		enumerable: false,
		writable: true,
		configurable: true
	})
	return context;
}
