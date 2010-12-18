// ---------------------------------------------------------
// GLOBAL OBJECTS
var runningLocallyOnFirefox = (location.href.substr(0,7) == "file://");

// timer engine
var gameControl = new( function() {
    this.fps = 60;
    this.startTime = new Date().getTime();
    this.stopTime = this.startTime;
    this.elapsed = 0;
    this.dt = 0;
    this.step = 10;
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
    this.bgVisible = false;
    this.bgImage = new Image();
    this.bgImage.src = "bg1_trans.png";
    this.wallImage = new Image();
    this.wallImage.src = "bg1_walls.png";
    this.killImage = new Image();
    this.killImage.src = "bg1_kill.png";
    this.bgCanvas = document.createElement('canvas');
})

var player = new( function() {
    this.startx = 50;
    this.starty = 100;
    this.x = this.startx;
    this.y = this.starty;
    this.width = 8;
    this.height = 20;
    this.feetSize = 5;
    this.speedUp = 0;
    this.speedRight = 0;
    this.standing = false;
    this.oldx = this.x;
    this.oldy = this.y;
    this.rejecting = false;
    this.jumpStrength = 200;
    this.horzSpeed = 100;
    this.gravityStrength = 500;
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
    if (!assets.wallImage.complete)
	return false;
    if (!assets.killImage.complete)
	return false;
    return true;
}

function loadGame() {

    document.onkeydown = keys.keyPressed;
    document.onkeyup = keys.keyReleased;
    
    assets.bgContext = assets.bgCanvas.getContext('2d');
    assets.bgCanvas.width = assets.bgImage.width;
    assets.bgCanvas.height = assets.bgImage.height;
    assets.bgContext.drawImage(assets.wallImage,0,0);
    assets.wallData = myGetImageData( assets.bgContext, 0,0,1024,200 );
    assets.bgContext.clearRect(0,0,assets.bgCanvas.width, assets.bgCanvas.height);
    assets.bgContext.drawImage(assets.killImage,0,0);
    assets.killData = myGetImageData( assets.bgContext, 0,0, 1024, 200 );
    assets.bgContext.clearRect(0,0,assets.bgCanvas.width, assets.bgCanvas.height);
    assets.bgContext.drawImage(assets.bgImage,0,0);
    assets.bgContext.drawImage(assets.wallImage,0,0);
    assets.bgContext.drawImage(assets.killImage,0,0);
    
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
    if (keys.upPressed && player.standing)
	player.speedUp = player.jumpStrength;
    else 
	player.speedUp = player.speedUp - player.gravityStrength * dts;
    
    player.y = player.y - player.speedUp * dts;
    
    if (playerCollidedVertical()) {
	player.y = origy;
	if (player.speedUp < 0) {
	    player.standing = true;
	}
	if (player.speedUp != 0) {
	    // "reject" the player
	    var ii;
	    for (ii=0;ii<player.height/2;ii++)
		if (!checkImageData(player.x+player.width/2, player.y+(player.speedUp<0?player.height-ii:ii)))    
		    break;
	    player.y = player.y + (player.speedUp<0? -ii : ii);
	}
	player.speedUp = 0;
	
    } else
	player.standing = false;
    
    // horizontal movement
    if (!player.rejecting) {
	player.speedRight = 0;
	if (keys.rightPressed)
	    player.speedRight = player.horzSpeed;
	if (keys.leftPressed)
	    player.speedRight = -player.horzSpeed;
    }
	
    player.x = player.x + player.speedRight * dts;
    if (playerCollidedHorizontal()) {
	player.rejecting = true;
        player.x = origx;
	// reject the player
	if (player.speedRight != 0) {
	    var ii;
	    for (ii=0;ii<player.width/2;ii++)
		if (!checkImageData(player.x+(player.speedRight>0?player.width-ii:ii), player.y+player.height/2)) {   
		    player.rejecting = false;
		    break;
		}
	    player.x = player.x + (player.speedRight>0? -ii : ii );
	}
	
	if (!player.rejecting)
	    player.speedRight = 0;
	
    }
    
    if (playerDeathTouch())
	resetPlayer();
}

function draw(dt) {
    var dts = dt/1000;
    var canvas = document.getElementById("canvas1");
    var context = canvas.getContext("2d");
    
    if (!assets.bgVisible) {
        context.drawImage(assets.bgCanvas,0,0);
	assets.bgVisible = true;
    }
    if ((player.oldx>=0) && (player.oldx+player.width<=1024) && (player.oldy>=0) && (player.oldy+player.height<=200))
        context.drawImage(assets.bgCanvas, player.oldx, player.oldy, player.width, player.height, player.oldx, player.oldy, player.width, player.height); 
    
    player.oldx = Math.floor(player.x+player.speedRight*dts + 0.5);
    player.oldy = Math.floor(player.y-player.speedUp*dts + 0.5);
    
    if ((player.oldx>=0) && (player.oldx+player.width<=1024) && (player.oldy>=0) && (player.oldy+player.height<=200)) {
	context.fillStyle = "#FFFFFF";
	context.fillRect(player.oldx, player.oldy, player.width, player.height);
    }
    
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
    if ((sx <= 0) || (sx >= 1024) || (sy <= 0) || (sy >= 200))
	return true;
    return ( assets.wallData.data[ ( Math.floor(sy) * assets.bgImage.width + Math.floor(sx) ) * 4 + 3] > 0 );
}

function playerCollidedVertical() {
    // (checking only red component)
    // check feet    
    if ((player.speedUp < 0) && checkImageData(player.x+player.width/2, player.y+player.height ))
        return true;
    
    // check head   
    if ((player.speedUp > 0) && checkImageData(player.x+player.width/2, player.y ))
        return true;
 
    return false;
}

function playerCollidedHorizontal() {
    // check right side
    if ((player.speedRight > 0) && checkImageData( player.x + player.width, player.y + player.height/2 ))
        return true;
    
    // check left side
    if ((player.speedRight < 0) && checkImageData( player.x, player.y + player.height/2 ))
        return true;
    
    return false;
}

function checkKillData(sx,sy) {
    if ((sx <= 0) || (sx >= 1024) || (sy <= 0) || (sy >= 200))
	return false;
    return ( assets.killData.data[ ( Math.floor(sy) * assets.bgImage.width + Math.floor(sx) ) * 4 + 3] > 0 );
}


function playerDeathTouch() {
    if ((player.speedUp < 0) && checkKillData(player.x+player.width/2, player.y+player.height ))
        return true;
    
    // check head   
    if ((player.speedUp > 0) && checkKillData(player.x+player.width/2, player.y ))
        return true;
 
     // check right side
    if ((player.speedRight > 0) && checkKillData( player.x + player.width, player.y + player.height/2 ))
        return true;
    
    // check left side
    if ((player.speedRight < 0) && checkKillData( player.x, player.y + player.height/2 ))
        return true;
    
    return false;
}

