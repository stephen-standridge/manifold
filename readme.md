### Manifold

a framework for building and managing interactive webgl applications

Rendering
  - framebuffers are not rendered to the screen and are rendered first
  - composers are rendered to the screen and are rendered second
  - when either is rendered
    - if layers are defined
      - render each in order
        - if own scene/camera/material is defined, use those
        - if not use parents
        - update associated texture
    - if not
      - render own scene/camera/material
      - update associated texture

Wrapper
  - allows for the management of multiple manifold instances
  - load(name, configuration, options, element)
    - loads the given configuration file as program with name
    - options are an object with three attributes defined
      - locateFile: function(){ return 'http://file_location_here' } //return a url where to locate files
      - locateSource: function(){ return 'http://source_location_here' } //return a url where to locate sources
      - onInitialize: function(){ return null } //called once program starts
    - element = dom element or queryString in which to place canvas
  - unload(name)
    - stops and unloads the program specified by name
  - start(name)
    - starts all rendering, cycles, and subscriptions of the program specified by name
  - stop(name)
    - stops all rendering, cycles, and subscriptions of the program specified by name

Configuration types
  - framebuffers and composers
    - can define a renderer
    - each are a composition
    - can define layers
    - can define a scene
    - can define a camera
    - can define a material
    - can define cycles
    - can define actions
    - can defined subscriptions
  - layers
    - uses 3js render targets
    - can define actions
    - can define a scene
    - can define a camera
    - can define a material
    - can define cycles
    - can defined subscriptions
    - can define a texture with a name
  - scenes
    - actually 3js scenes
    - can define actions
    - can have children defined
    - can define cycles
    - can defined subscriptions
  - cameras
    - actually 3js cameras
    - can define actions
    - can define cycles
    - can defined subscriptions
  - objects
    - actually 3js objects
    - can define actions
    - can specify attribute sources
    - can specify attribute behavior
    - can define cycles
    - can defined subscriptions
  - materials
    - actually 3js materials
    - can define actions
    - have uniforms defined
    - have defines defined
    - have textures defined
      - textures can be string of framebuffer texture name
    - have vertex and fragment shader defined as a string
    - can specify uniform sources
    - can specify uniform behavior
    - cannot have cycles
      - must be defined on the behavior or object
    - cannot have subscriptions
      - must be defined on the behavior or object
  - renderer
    - actually 3js renderer
    - will create a canvas
    - defines the size of the compositions
    - defines dom element in which to place

Webgl Things
  - attributes
  - uniforms
  - defines
  - textures

The Sauce
- behaviors
- cycles
- sources
- subscriptions
- actions

