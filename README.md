Bark is a prototype for a programming environment which combines simplicity of coding in Basic with modern technologies.

The most visible project in this area is Scratch which provides a programming environment with an integrated assert editor and project management system. It is a great system for a quick prototype of 2D games. The original implementation of Scratch was done in Smalltalk and provided a smooth transition from Scratch to full Smalltalk. The current implementation of Scratch is based on a limited VM running top of JS and it does not provide a way to use full JS. As a result, a developer has to abandon the prototype and transition to some other language.

The second problem with Scratch is that it only supports 2D sprites. 2D assets are easy to create initially, but very quickly the cost of making graphics assets becomes higher than the cost of coding. General purpose 3D assets are even more costly. However, Minecraft style voxel environment can provide a good compromise between complexity of model and flexibility.

Another great idea in Scratch was the concept of Sprite based on Smalltalk greenthreads. A standard design for a game today is to update game state in a frame loop; aka callback executed on every frame. Callback based coding requires a developer to convert state management into some kind of state machine which is a lot harder than imperative programming. In Scratch, each sprite can run one or more infinite loops (green threads) for event processing or animation.

In JS, green threads can be implemented with await, but the result code is quite hard for beginners.

In Bark, I have combined vortex based graphics with a language inspired by Basic/Pascal/Oberon, green threads based on awaits and built-in multiplayer support. THe language is transpiled into JS which means that a developer can always use plain JS (or include JS libraries). 

Below is an example of code which creates a sprite and moves it in 3rd person mode.

[<video src="./barkdemo1.mov" width="400" />]

In the example, the main code creates "monkey" sprite. Sprite creation invokes "on create" which handles which setups animation and sends "startMonky" message to inself. Similar to Scratch, sendMessage  asynchronous and processed by a separate green thread. create code then starts a loop which reads input from the controller and handles shooting. In this example, move handling is delegated to the keyboard controller as move requires a lot of subtle handling for jumping, climbing etc. But for simpler games it can be handled by this code as well. When a user presses space to shoot, code creates a projectile which is a special kind of sprite. The rest is handled by projectile code written in a similar way. 

```
  on create function(monky: Sprite) begin
    var ma:= Sprite.addAnimation monky 'move'

    Sprite.addFrame ma idx:= 1 dur:=0.1 
    Sprite.addFrame ma idx:= 2 dur:=0.1

    ma:= Sprite.addAnimation monky 'stand'
    Sprite.addFrame ma idx:= 0 dur:=0

    System.log 'send start message'
    System.sendMessage 'startMonky' monky

    forever do
      var ev := ThirdPersonController.readInput();

      if ev.speedX != 0 or ev.speedZ != 0 then
        Sprite.animate monky 'move'
      else
        Sprite.animate monky 'stand'
      end

      if ev.fire then
        System.log 'shoot bread'
        var bullet := Sprite.createProjectile monky 'bread'
      end
    end
  end

  on message='startMonky' function(monky: Sprite) begin
    System.log 'start monky'
    forever do
      var collision := System.waitCollide monky
      if collision is Sprite.Boundary then
        System.log 'monky hit boundary'
        System.sendMessage 'killedMonkey'
        break;
      end
    end
  end

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

Key ideas about the language

- Use ":=" for assingment. It seems to be easier for beginngers to use "=" for comparison and ":=" for assingment
- Functional. Functions and modules solve a lot of problems which OOP was solving. And it is easier to understand
- Strongly typed. Functional style code shines with strong typing. Especially once typesystem supports operations on type such as "&" or "|" similar to TypeScript
- Optional dot notation. One of the problems with functional syntax is pipelining. "foo(bar(blah(1)))" does not look as good as "blah(1).bar().foo()". Some languages solve this by allowing any method to be called with dot notation based on the first parameter. In Bark you can call "1.blah().bar().foo()" instead of "foo(bar(blah(1)))"
- Built in green threads. Each event handler (such as startMonkey handler) runs on a separate green thread. Green threads are emulated using async/await methods. System calls such as "forever" can block execution of the loop to allow other code to run.
- Zero cost interop with JS. Bark code is transpiled to JS. You can bring new JS code into Bark or use Bark code in JS.

From implementation perspective, Bark consist of minimal server part and client part. 

Server is implemented in C# and provides support for managing persisted state (storing game map and code in SQLITE) and realtime communication using WebSocket. 

Client is implemented in TypeScript/WebGL. Bark transpiler uses hand written parser rather than relying on parser generator such as peg.js. This is done to enable better error handling and integration with editor logic (such as ability to recompile since line of code). Voxel rendering uses custom engine optimized for small words (1000*1000 blocks, no support for minecraft style infinite world)

