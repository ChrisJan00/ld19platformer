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
    this.level1Image.src = "graphics/level1.png";
    this.bgCanvas = document.createElement('canvas');
    this.baseCanvas = document.createElement('canvas');
    this.levelCanvas = document.createElement('canvas');
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
    
    graphics.updateAnimations();
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
    // if (keys.upPressed && player.standing)
	// if (keys.check(playerKeyIndex, "up") && player.standing)
	if (playerKeys.check("up") && player.standing)
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
    
    checkActivatedObjects();
    
    if (playerDeathTouch())
	resetPlayer();
	
    // animation
    if ((player.speedRight != 0) && (player.standing)) {
    player.animationTimer = player.animationTimer - dt;
	while (player.animationTimer <= 0) {
	    player.frame = (player.frame+1)%4;
	    player.animationTimer = player.animationTimer + player.frameDelay;
	}
    }
    
    for (var ii=0; ii<assets.objects.length; ii++) 
	if (assets.objects[ii].activated) {
	    assets.objects[ii].timer -= dt;
	    while (assets.objects[ii].timer <= 0) {
		graphics.setUpdateAnimations();
		assets.objects[ii].timer += assets.objects[ii].frameDelay;
		assets.objects[ii].currentFrame++;
	    }
	    if (assets.objects[ii].currentFrame >= assets.objects[ii].count) {
		assets.objects[ii].currentFrame = assets.objects[ii].count-1;
		assets.objects[ii].activated = false;
	    }
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
    if ((sx <= 0) || (sx >= graphics.canvasWidth) || (sy <= 0) || (sy >= graphics.canvasHeight))
	return true;
    var point = ( Math.floor(sy) * graphics.canvasWidth + Math.floor(sx) ) * 4 + 3;
    if ( assets.wallData.data[ point ] > 0 )
	return true;
    // check the objects
    for (var ii=0;ii<assets.objects.length; ii++) {
	var frame = assets.objects[ii].currentFrame;
	if (assets.objects[ii].colliData[frame].data[point] > 0)
	    return true;
    }
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
