// ---------------------------------------------------------
// GLOBAL OBJECTS
var runningLocallyOnFirefox = false;

// timer engine
var gameControl = new( function() {
    this.fps = 60;
    this.startTime = new Date().getTime();
    this.stopTime = this.startTime;
    this.elapsed = 0;
    this.dt = 0;
    this.step = 1000/this.fps;
    this.skip = false;
} )

// keyboard input
var keys = new( function() {
    this.upPressed = false;
    this.downPressed = false;
    this.leftPressed = false;
    this.rightPressed = false;
    this.upCode = 38;
    this.downCode = 40;
    this.leftCode = 37;
    this.rightCode = 39;
    this.keyPressed = function(event) {
	switch (event.keyCode) {
	    case keys.upCode:  keys.upPressed = true;
	    break;
	    case keys.downCode: keys.downPressed = true;
	    break;
	    case keys.leftCode: keys.leftPressed = true;
	    break;
	    case keys.rightCode: keys.rightPressed = true;
	    break;
	}
    }
    this.keyReleased = function(event) {
	switch (event.keyCode) {
	    case keys.upCode:  keys.upPressed = false;
	    break;
	    case keys.downCode: keys.downPressed = false;
	    break;
	    case keys.leftCode: keys.leftPressed = false;
	    break;
	    case keys.rightCode: keys.rightPressed = false;
	    break;
	}
    }
})

var assets = new( function() {
    this.bgImage = new Image();
    this.bgImage.src = "bg1.png";
    this.bgCanvas = document.createElement('canvas');
})

var player = new( function() {
    this.x = 50;
    this.y = 100;
    this.width = 8;
    this.height = 20;
    this.feetSize = 5;
    this.speedUp = 0;
    this.speedRight = 0;
    this.standing = false;
})

// ------------------------------------------------------------------------
// CONTROL FUNCTIONS
function startGame() {
    if (!assetsLoaded())
	setTimeout(startGame(),500); // wait 500ms
    else {
	loadGame();
	gameControl.runInterval = setInterval(mainLoop, 1000/gameControl.fps);
    }
}

function stopGame() {
    clearInterval( gameControl.runInterval );
}

function assetsLoaded() {
    if (!assets.bgImage.complete)
	return false;
    return true;
}

function loadGame() {

    document.onkeydown = keys.keyPressed;
    document.onkeyup = keys.keyReleased;
    
    assets.bgContext = assets.bgCanvas.getContext('2d');
    assets.bgCanvas.width = assets.bgImage.width;
    assets.bgCanvas.height = assets.bgImage.height;
    assets.bgContext.drawImage(assets.bgImage,0,0);
    assets.bgData = myGetImageData( assets.bgContext, 0,0,1024,200 );
    
}

function mainLoop() {
    if (gameControl.skip)
	return;
    else
	gameControl.skip = true

    // control the time
    gameControl.stopTime = new Date().getTime();
    gameControl.elapsed = gameControl.stopTime - gameControl.startTime;
    gameControl.startTime = gameControl.stopTime;
    gameControl.dt = gameControl.dt + gameControl.elapsed;
	
    while(gameControl.dt > gameControl.step) {
	update( gameControl.step );
	gameControl.dt = gameControl.dt - gameControl.step;
    }
    
    // dt is passed for interpolation
    draw(gameControl.dt);
	
    gameControl.skip = false
}

//---------------------------------------
// GAME LOGIC + GAME GRAPHICS

// Note: dt is given in milliseconds
function update(dt) {
    var dts = dt/1000;
    var origx = player.x
    var origy = player.y
    
    // vertical movement
    if (keys.upPressed && player.standing)
	player.speedUp = 100;
    else 
	player.speedUp = player.speedUp - 10;
    
    player.y = player.y - player.speedUp * dts;
    
    if (playerCollidedVertical()) {
	if (player.speedUp < 0)
	    player.standing = true;
	player.speedUp = 0;
	player.y = origy;
    } else
	player.standing = false;
    
    // horizontal movement
    player.speedRight = 0;
    if (keys.rightPressed)
	player.speedRight = 100;
    if (keys.leftPressed)
	player.speedRight = -100;
	
    player.x = player.x + player.speedRight * dts;
    if (playerCollidedHorizontal()) {
	player.speedRight = 0;
	player.x = origx;
    }
    
    // (by now) stop the game if out of bounds
    if ((player.x < 0) || (player.x + player.width > 1024) || (player.y < 0) || (player.y+player.height > 200))
	stopGame(); 
}

function draw(dt) {
    var dts = dt/1000;
    var canvas = document.getElementById("canvas1");
    var context = canvas.getContext("2d");
    
    context.drawImage(assets.bgCanvas,0,0);
    
    context.fillStyle = "#FFFFFF";
    context.fillRect(player.x+player.speedRight*dts, player.y-player.speedUp*dts, player.width, player.height);
}

function myGetImageData(ctx, sx, sy, sw, sh) {
    try {
	return ctx.getImageData(sx, sy, sw, sh);
    } catch (e) {
    if (runningLocallyOnFirefox)
	try {
	    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
	    return ctx.getImageData(sx, sy, sw, sh);
    	} catch (e) {
	    throw new Error("Cannot access image data: " + e);
	}
    }
}

function checkImageData(sx,sy) {
    return ( assets.bgData.data[ ( Math.floor(sy) * assets.bgImage.width + Math.floor(sx) ) * 4 ] != 0 );
}

function playerCollidedVertical() {
    try {
	// (checking only red component)
	// check feet    
	if ((player.speedUp < 0) && checkImageData(player.x+player.width/2, player.y+player.height))
	    return true;
	
	// check head   
	if ((player.speedUp > 0) && checkImageData(player.x+player.width/2, player.y))
	    return true;
	    
	    
    } catch(e) { }
 
    return false;
}

function playerCollidedHorizontal() {
    
    try {
	// check right side
	if ((player.speedRight > 0) && checkImageData( player.x + player.width, player.y + player.height/2 ))
	    return true;
    
	// check left side
	if ((player.speedRight < 0) && checkImageData( player.x, player.y + player.height/2 ))
	    return true;
    
    } catch(e) {}
    return false;
}
