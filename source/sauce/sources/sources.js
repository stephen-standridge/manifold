function assign(context, source, name) {
  if (!source) return;
  context.source = context.source || {};
  if(context.source[name]) {
    console.warn(`duplicate source assigning detected ${name} has already been defined`, context);
  }
  context.source[name] = source;
  source.link(context, assignAttribute.bind(context));
}

export { assign }
