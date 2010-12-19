// ---------------------------------------------------------
// GLOBAL OBJECTS
var runningLocallyOnFirefox = (location.href.substr(0,7) == "file://");


var canvasWidth;
var canvasHeight;
// var canvasWidth = document.getElementById("canvas1").width;
// var canvasHeight = document.getElementById("canvas1").height;

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
    this.walkerImage = new Image();
    this.walkerImage.src = "graphics/walker.png";
    this.level1Image = new Image();
    this.level1Image.src = "graphics/level1.png";
    this.bgCanvas = document.createElement('canvas');
    this.levelCanvas = document.createElement('canvas');
    this.updateAnimations = false;
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
    this.oldx = this.x;
    this.oldy = this.y;
    this.rejecting = false;
    this.jumpStrength = 160;
    this.horzSpeed = 100;
    this.gravityStrength = 500;
    this.frame = 0;
    this.animationTimer = 0;
    this.frameDelay = 1000/18;
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
    if (!assets.walkerImage.complete)
	return false;
    if (!assets.level1Image.complete)
	return false;
    return true;
}

function loadGame() {

    document.onkeydown = keys.keyPressed;
    document.onkeyup = keys.keyReleased;
    
    canvasWidth = document.getElementById("canvas1").width;
    canvasHeight = document.getElementById("canvas1").height;
    assets.bgCanvas.width = canvasWidth;
    assets.bgCanvas.height = canvasHeight;
    
    assets.levelImage = assets.level1Image;
    
    var levelContext = assets.levelCanvas.getContext('2d');
    assets.levelCanvas.width = assets.levelImage.width;
    assets.levelCanvas.height = assets.levelImage.height;
    levelContext.drawImage(assets.levelImage, 0, 0);
//     assets.wallData = myGetImageData( levelContext, 0, canvasHeight * 1, canvasWidth, canvasHeight );
//     assets.killData = myGetImageData( levelContext, 0, canvasHeight * 2, canvasWidth, canvasHeight );
    
    // objects
    assets.objects = new Array();
    if (assets.levelImage.height > canvasHeight * 3) {
	// count objects and their length
	var objectData = myGetImageData( levelContext, canvasWidth-1, canvasHeight * 4-1, 1, assets.levelCanvas.height - canvasHeight * 4 + 1); 
	var objectCount = 0;
	var ii;
	
	for (ii=0; ii < objectData.height; ii += canvasHeight) {
	    if (objectData.data[ii*4+3] > 0) {
		objectCount++;
		assets.objects.push( new ( function() { 
		    this.count = 0; 
		    this.currentFrame = 0;
		    this.activated = false;
		    this.timer = 0;
		    this.frameDelay = 200;
		} ) )
	    }
	    else
	    if (objectCount > 0)
		assets.objects[ objectCount-1 ].count++;
	}
		
	var screenCount = 3;
	for (ii=0; ii<objectCount; ii++) {
	    assets.objects[ii].activationData = myGetImageData(levelContext, 0, canvasHeight * screenCount, canvasWidth, canvasHeight);
	    // get animation layers in an object canvas
	    assets.objects[ii].frames = new Array();
	    for (var jj=0;jj<assets.objects[ii].count;jj++) {
		var objCanvas = document.createElement('canvas');
		objCanvas.width = canvasWidth;
		objCanvas.height = canvasHeight;
		var objCtx = objCanvas.getContext('2d');
		objCtx.drawImage( assets.levelCanvas, 0, canvasHeight * (screenCount + jj + 1), canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);
		assets.objects[ii].frames[jj] = objCanvas;
	    }
	    screenCount += assets.objects[ii].count + 1;
	}
	
    }

    updateAnimations();
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
		assets.updateAnimations = true;
		assets.objects[ii].timer += assets.objects[ii].frameDelay;
		assets.objects[ii].currentFrame++;
	    }
	    if (assets.objects[ii].currentFrame >= assets.objects[ii].count) {
		assets.objects[ii].currentFrame = assets.objects[ii].count-1;
		assets.objects[ii].activated = false;
	    }
	}
}

function updateAnimations() {

    // drawing
    var bgContext = assets.bgCanvas.getContext('2d');
    bgContext.clearRect(0,0, canvasWidth, canvasHeight);
    bgContext.drawImage(assets.levelImage,0,canvasHeight * 0, canvasWidth, canvasHeight, 0,0, canvasWidth, canvasHeight);
    bgContext.drawImage(assets.levelImage,0,canvasHeight * 1, canvasWidth, canvasHeight, 0,0, canvasWidth, canvasHeight);
    bgContext.drawImage(assets.levelImage,0,canvasHeight * 2, canvasWidth, canvasHeight, 0,0, canvasWidth, canvasHeight);

    // kill layer
    var levelContext = assets.levelCanvas.getContext('2d');
    assets.killData = myGetImageData( levelContext, 0, canvasHeight * 2, canvasWidth, canvasHeight );
    
    // collision
    var colliCanvas = document.createElement('canvas');
    colliCanvas.width = canvasWidth;
    colliCanvas.height = canvasHeight;
    var colliContext = colliCanvas.getContext('2d');
    colliContext.drawImage(assets.levelImage,0,canvasHeight * 1, canvasWidth, canvasHeight, 0,0, canvasWidth, canvasHeight);
    // objects
    for (var ii=0; ii<assets.objects.length; ii++) {
	var objectCanvas = assets.objects[ii].frames[assets.objects[ii].currentFrame];
	bgContext.drawImage(objectCanvas, 0, 0, canvasWidth, canvasHeight);
	colliContext.drawImage(objectCanvas, 0, 0, canvasWidth, canvasHeight);
    }
    assets.wallData = myGetImageData( colliContext, 0, 0, canvasWidth, canvasHeight);
    
    // paint on screen
    var canvas = document.getElementById("canvas1");
    var context = canvas.getContext("2d");
    
    context.drawImage(assets.bgCanvas,0,0);
	
    assets.updateAnimations = false;
}

function draw(dt) {
    var dts = dt/1000;
    var canvas = document.getElementById("canvas1");
    var context = canvas.getContext("2d");
    
    if (assets.updateAnimations)
	updateAnimations();
	
    if (!assets.bgVisible) {
        context.drawImage(assets.bgCanvas,0,0);
	assets.bgVisible = true;
    }
    if ((player.oldx>=0) && (player.oldx+player.width<=canvasWidth) && (player.oldy>=0) && (player.oldy+player.height<=canvasHeight))
        context.drawImage(assets.bgCanvas, player.oldx, player.oldy, player.width, player.height, player.oldx, player.oldy, player.width, player.height); 
    
    player.oldx = Math.floor(player.x+player.speedRight*dts + 0.5);
    player.oldy = Math.floor(player.y-player.speedUp*dts + 0.5);
    
    if ((player.oldx>=0) && (player.oldx+player.width<=canvasWidth) && (player.oldy>=0) && (player.oldy+player.height<=canvasHeight)) {
	context.drawImage(assets.walkerImage, player.frame*player.width, 0, player.width, player.height, player.oldx, player.oldy, player.width, player.height);
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
    if ((sx <= 0) || (sx >= canvasWidth) || (sy <= 0) || (sy >= canvasHeight))
	return true;
    return ( assets.wallData.data[ ( Math.floor(sy) * canvasWidth + Math.floor(sx) ) * 4 + 3] > 0 );
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
    if ((sx <= 0) || (sx >= canvasWidth) || (sy <= 0) || (sy >= canvasHeight))
	return false;
    return ( assets.killData.data[ ( Math.floor(sy) * canvasWidth + Math.floor(sx) ) * 4 + 3] > 0 );
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

function checkActivatedObjects()
{
    for (var ii=0; ii<assets.objects.length; ii++) {
	if (assets.objects[ii].activated)
	    continue;
	if (assets.objects[ii].currentFrame != 0)
	    continue;
	if (playerTouchedObject(ii)) {
	    assets.objects[ii].activated = true;
	}
    }
}

function playerTouchedObject(index) {
    if ((player.speedUp < 0) && checkObjectData(index, player.x+player.width/2, player.y+player.height ))
        return true;
    
    // check head   
    if ((player.speedUp > 0) && checkObjectData(index, player.x+player.width/2, player.y ))
        return true;
 
     // check right side
    if ((player.speedRight > 0) && checkObjectData(index,  player.x + player.width, player.y + player.height/2 ))
        return true;
    
    // check left side
    if ((player.speedRight < 0) && checkObjectData(index,  player.x, player.y + player.height/2 ))
        return true;
    
    return false;
}

function checkObjectData(index, sx, sy) {
    if ((sx <= 0) || (sx >= canvasWidth) || (sy <= 0) || (sy >= canvasHeight))
	return false;
    return ( assets.objects[index].activationData.data[ ( Math.floor(sy) * canvasWidth + Math.floor(sx) ) * 4 + 3] > 0 );
}

