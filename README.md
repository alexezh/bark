Bark is a prototype for programming environment which combines simplicity of coding in Basic with modern technologies. 

The most visible project in this area is Scratch which provides programming environment with integrated assert editor and project management system. It is a great system for a quick prototype of 2D games. The original implementation of Scratch was done in Smalltalk and provided a smooth transition from Scratch to full Smalltalk. The current implementation is a limited VM on top of JS and it does not provide a way to use full JS. As a result, a developer has to abandon prototype and transition to some other language. 

The second problem with Scratch that it only supports 2D sprites. 2D assets are easy to create initially, but very quickly the cost of making graphics assets becomes higher than cost of coding. General purpose 3D assets are even more costly. However, minecraft style voxel environment can provide a good compromise between complexity of model and flexibility.

Another great idea in Scratch were Sprites based on Smalltalk greenthreads. A standard design for a game today is to update game state in a frame loop; aka callbacks. Callback based coding requires developer to convert state management into some kind of state machine which is lot harder than imperitive programming. In Scratch, each sprite can run one or more infinite loops (green threads) for event processing or animation. 

In JS, green threads can be implemented with await, but the result code is quite hard for beginners.

In Bark, I have combined vortex based graphics with a language inspired by Basic/Pascal/Oberon and green threads based on awaits. THe language is transpiled into JS which means that a developer can always use plain JS (or include JS libraries). 

Here is example of code which creates a sprite and moves it in 3rd person mode.

```
  var monky;

  on load function() begin
    System.loadLevel 'default'

    monky:= Sprite.createSprite 'monky' scale:=0.5
    Sprite.setPosition monky 120 20 200

    ThirdPersonController.configureController maxSpeed:=40 keySpeed:=10 thumbSpeed:=10 timeoutSeconds:=0.1
    ThirdPersonController.followSprite monky x:=100 y:=50 z:=0
  end

  on message='killedMonkey' function(monky: Sprite) begin
    System.restart
  end
```

Bark consist of minimal server part and client part. 

Server is implemented in C# and provides support for managing persisted state (storing game map and code in SQLITE) and realtime communication using WebSocket. In the future it might be extended to manage game runtime state.

Client is implemented in TypeScript/WebGL. Bark transpiler uses hand written parser rather than relying on parser generator such as peg.js. This is done to enable better error handling and integration with editor logic (such as ability to recompile since line of code). Voxel rendering uses custom engine optimized for small words (1000*1000 blocks, no support for minecraft style infinite world)

