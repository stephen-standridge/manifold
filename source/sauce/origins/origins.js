function assign(context, origin, name) {
  if (!origin) return;
  context.origin = context.origin || {};
  if(context.origin[name]) {
    console.warn(`duplicate origin assigning detected ${name} has already been defined`, context);
  }
  context.origin[name] = origin;
  origin.link(context, assignAttribute.bind(context));
}

export { assign }
