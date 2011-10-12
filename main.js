// ---------------------------------------------------------
// GLOBAL OBJECTS
var gameControl = new GameControl();

var playerKeys = KeyManager.appendMapping([
		["up", 38],
		["down", 40],
		["left", 37],
		["right", 39],
//		["action1", 75],
//		["action2", 76]
	] );

var assets = {}

var player = new( function() {
    this.startx = 50;
    this.starty = 100;
    this.x = this.startx;
    this.y = this.starty;
    this.width = 8;
    this.height = 17;
    this.speedUp = 0;
    this.speedRight = 0;
    this.standing = false;
    this.rejecting = false;
    this.jumpStrength = 160;
    this.horzSpeed = 100;
    this.gravityStrength = 500;
    this.frame = 0;
    this.animationTimer = 0;
    this.frameDelay = 1000/18;
})

function load() {
	assets.walkerImage = new Image();
    assets.walkerImage.src = "graphics/walker.png";
	assets.levelImage = new Image();
	assets.levelImage.src = "graphics/map_1_1.png";
}

function loaderProgress() {
    if (!assets.walkerImage.complete)
	return 0;
    if (!assets.levelImage.complete)
	return 50;
    return 100;
}

function prepareGame() {
    graphics.init();
	Level.init();
}

//---------------------------------------
// GAME LOGIC + GAME GRAPHICS

function resetPlayer() {
    player.x = player.startx;
    player.y = player.starty;
    player.speedUp = 0;
    player.speedRight = 0;
}

// Note: dt is given in milliseconds
function update(dt) {
    var dts = dt/1000;
    var origx = player.x
    var origy = player.y
    
    // vertical movement
    player.wasClimbing = Collision.collidedClimb();
    if (player.wasClimbing) {
    	if (!player.rejecting) {
	    	player.speedUp = 0;
	    	if (playerKeys.check("up"))
	    		player.speedUp = player.horzSpeed;
	    	else if (playerKeys.check("down"))
	    		player.speedUp = -player.horzSpeed;
    	}
    } else {
	    if (playerKeys.check("up") && player.standing)
			player.speedUp = player.jumpStrength;
	    else 
			player.speedUp = player.speedUp - player.gravityStrength * dts;
    }

    player.y = player.y - player.speedUp * dts;
    
    if (Collision.collidedVertical()) {
		player.y = origy;
		if (player.speedUp < 0) {
		    player.standing = true;
		}
		if (player.speedUp != 0) {
		    // "reject" the player
		    Collision.rejectVertically();
		}
		player.speedUp = 0;
	
    } else 
		player.standing = player.wasClimbing;
    
    // horizontal movement
    if (!player.rejecting) {
		player.speedRight = 0;
		if (playerKeys.check("right"))
		    player.speedRight = player.horzSpeed;
		if (playerKeys.check("left"))
		    player.speedRight = -player.horzSpeed;
    }
	
    player.x = player.x + player.speedRight * dts;
    if (Collision.collidedHorizontal()) {
		player.rejecting = true;
        player.x = origx;
        
		// reject the player
		if (player.speedRight != 0) {
		    Collision.rejectHorizontally();
		}
		
		if (!player.rejecting)
		    player.speedRight = 0;
    }
    
    if (Collision.collidedDeath())
		resetPlayer();
	
    // animation
   graphics.updateAnimation( dt );
    
    // check preloading
    if (assets.upLevel.pending && assets.upLevel.levelImage.complete)
    	Level.updateUpLevelPreloading();
	if (assets.downLevel.pending && assets.downLevel.levelImage.complete)
    	Level.updateDownLevelPreloading();
}

function draw(dt) {
    graphics.draw(dt);
}
