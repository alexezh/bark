

export function boxedMonkey(): string {
  return `
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
  `
}

// sprite is an class, which merges concept of module and class
export function boxedBread(): string {
  return `
  on create function(bullet: Sprite) begin
    Sprite.setSpeed bullet 50 20 0
    forever do
      var collision := System.waitCollide bullet
      if collision is Sprite.Sprite then
        System.log 'collided with sprite'
        Sprite.removeProjectile(bullet);
        break;
      elif collision is Sprite.Block then
        System.log 'collided with block'
        System.deleteBlock collision
        System.createExplosion collision.position;
        Sprite.removeProjectile(bullet);
        break;
      elif collision != null then
        System.log 'collided with something'
        Sprite.removeProjectile(bullet);
      break;
    end
    end
  end
`
}

// add sprite menu where we add sprites
// then we can have import block - .. and import sprite ..
// the problem is we do not have an easy viewer.. 
// if we have block library - add sprite to level? 
// which makes module per sprite? 
// can work. So add sprite shows list of blocks. You select one and click add
// same for blocks. except we do not have to name them, we can just show a library
// click selects it, click out hides or escape hides it
export function boxedBasic2(): string {
  return `
  var monky;

  on load function() begin
    System.loadLevel 'default'

    monky:= Sprite.createSprite 'monky' scale:=0.5
    Sprite.setPosition monky 120 20 120

    ThirdPersonController.configureController maxSpeed:=40 keySpeed:=10 thumbSpeed:=10 timeoutSeconds:=0.1
    ThirdPersonController.followSprite monky x:=100 y:=50 z:=0
  end

  on message='killedMonkey' function(monky: Sprite) begin
    System.restart
  end
    `;
}
