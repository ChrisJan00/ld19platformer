// ---------------------------------------------------------
// GLOBAL OBJECTS
var gameControl = new GameControl();

var playerKeys = GLOBAL.keyManager.appendMapping( [
		["up", 38],
		["down", 40],
		["left", 37],
		["right", 39],
		["action1", 75],
		["action2", 76]
	] );

var assets = new( function() {
    this.walkerImage = new Image();
    this.walkerImage.src = "graphics/walker.png";
    this.level1Image = new Image();
    this.level1Image.src = "graphics/map_1_1.png";
    this.bgCanvas = document.createElement('canvas');
    this.baseCanvas = document.createElement('canvas');
    this.levelCanvas = document.createElement('canvas');
    this.climbCanvas = document.createElement('canvas');
})

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

function loaderProgress() {
    if (!assets.walkerImage.complete)
	return 0;
    if (!assets.level1Image.complete)
	return 50;
    return 100;
}

function prepareGame() {
    graphics.init();
    assets.bgCanvas.width = graphics.canvasWidth;
    assets.bgCanvas.height = graphics.canvasHeight;

    loadLevel( assets.level1Image );
    
    // paint on screen
    graphics.paintBackground();
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
    
    var playerWasClimbing = playerIsClimbing();
    // vertical movement

    if (playerWasClimbing) {
    	if (!player.rejecting) {
	    	player.speedUp = 0;
	    	if (keys.upPressed)
	    		player.speedUp = player.horzSpeed;
	    	else if (keys.downPressed)
	    		player.speedUp = -player.horzSpeed;
    	}
    } else {
	    if (keys.upPressed && player.standing)
			player.speedUp = player.jumpStrength;
	    else 
			player.speedUp = player.speedUp - player.gravityStrength * dts;
    }

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
	player.standing = playerWasClimbing;
    
    // horizontal movement
    if (!player.rejecting) {
	player.speedRight = 0;
	// if (keys.rightPressed)
	// if (keys.check(playerKeyIndex, "right"))
	if (playerKeys.check("right"))
	    player.speedRight = player.horzSpeed;
	// if (keys.leftPressed)
	if (playerKeys.check("left"))
	// if (keys.check(playerKeyIndex, "left"))
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
	
    // animation
    if ((player.speedRight != 0 && player.standing) || (player.speedUp !=0 && playerWasClimbing)) {
	    player.animationTimer = player.animationTimer - dt;
		while (player.animationTimer <= 0) {
		    player.frame = (player.frame+1)%4;
		    player.animationTimer = player.animationTimer + player.frameDelay;
		}
    }

}

function loadLevel( levelImage ) { 
    var gW = graphics.canvasWidth;   
    var gH = graphics.canvasHeight;
    assets.levelImage = levelImage;
    
    var levelContext = assets.levelCanvas.getContext('2d');
    assets.levelCanvas.width = assets.levelImage.width;
    assets.levelCanvas.height = assets.levelImage.height;
    levelContext.drawImage(assets.levelImage, 0, 0);
    

		    
    // drawing
    var baseContext = assets.baseCanvas.getContext('2d');
    assets.baseCanvas.width = gW;
    assets.baseCanvas.height = gH;
    baseContext.drawImage(assets.levelImage,0,gH * 0, gW, gH, 0,0, gW, gH);
    baseContext.drawImage(assets.levelImage,0,gH * 1, gW, gH, 0,0, gW, gH);
    baseContext.drawImage(assets.levelImage,0,gH * 2, gW, gH, 0,0, gW, gH);
    baseContext.drawImage(assets.levelImage,0,gH * 3, gW, gH, 0,0, gW, gH);
    assets.killData = myGetImageData( levelContext, 0, gH * 2, gW, gH );
    assets.wallData = myGetImageData( levelContext, 0, gH * 1, gW, gH );
    assets.climbData = myGetImageData( levelContext, 0, gH * 3, gW, gH );
    
    var bgContext = assets.bgCanvas.getContext('2d');
    bgContext.drawImage(assets.baseCanvas,0,0,gW, gH);
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
    if ((sx <= 0) || (sx >= graphics.canvasWidth) || (sy <= 0) || (sy >= graphics.canvasHeight))
		return true;
    var point = ( Math.floor(sy) * graphics.canvasWidth + Math.floor(sx) ) * 4 + 3;
    if ( assets.wallData.data[ point ] > 0 )
		return true;
    return false;
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
    if ((sx <= 0) || (sx >= graphics.canvasWidth) || (sy <= 0) || (sy >= graphics.canvasHeight))
	return false;
    return ( assets.killData.data[ ( Math.floor(sy) * graphics.canvasWidth + Math.floor(sx) ) * 4 + 3] > 0 );
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


function playerIsClimbing() {
	return checkClimbData(player.x+player.width/2, player.y+player.height );
}

function checkClimbData(sx, sy) {
	if ((sx <= 0) || (sx >= graphics.canvasWidth) || (sy <= 0) || (sy >= graphics.canvasHeight))
	return false;
    return ( assets.climbData.data[ ( Math.floor(sy) * graphics.canvasWidth + Math.floor(sx) ) * 4 + 3] > 0 );
}
