// ---------------------------------------------------------
// GLOBAL OBJECTS

function loadLevel( levelImage ) {    
    
    assets.levelImage = levelImage;
    
    var levelContext = assets.levelCanvas.getContext('2d');
    assets.levelCanvas.width = assets.levelImage.width;
    assets.levelCanvas.height = assets.levelImage.height;
    levelContext.drawImage(assets.levelImage, 0, 0);
    
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
		    this.oldFrame = -1;
		    this.activated = false;
		    this.timer = 0;
		    this.frameDelay = 100;
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
	    assets.objects[ii].boundingBox = new Array();
	    assets.objects[ii].colliData = new Array();
	    for (var jj=0;jj<assets.objects[ii].count;jj++) {
		var objCanvas = document.createElement('canvas');
		objCanvas.width = canvasWidth;
		objCanvas.height = canvasHeight;
		var objCtx = objCanvas.getContext('2d');
		objCtx.drawImage( assets.levelCanvas, 0, canvasHeight * (screenCount + jj + 1), canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);
		assets.objects[ii].frames[jj] = objCanvas;
		assets.objects[ii].colliData[jj] = myGetImageData( objCtx, 0, 0, canvasWidth, canvasHeight);
		assets.objects[ii].boundingBox[jj] = new ( function() {
		    this.x = 0;
		    this.y = 0;
		    this.w = canvasWidth;
		    this.h = canvasHeight;
		} )
	    }
	    screenCount += assets.objects[ii].count + 1;
	}
	
    }
    
    boundingBoxProcess.execute();
    
    // drawing
    var baseContext = assets.baseCanvas.getContext('2d');
    assets.baseCanvas.width = canvasWidth;
    assets.baseCanvas.height = canvasHeight;
    baseContext.drawImage(assets.levelImage,0,canvasHeight * 0, canvasWidth, canvasHeight, 0,0, canvasWidth, canvasHeight);
    baseContext.drawImage(assets.levelImage,0,canvasHeight * 1, canvasWidth, canvasHeight, 0,0, canvasWidth, canvasHeight);
    baseContext.drawImage(assets.levelImage,0,canvasHeight * 2, canvasWidth, canvasHeight, 0,0, canvasWidth, canvasHeight);
    assets.killData = myGetImageData( levelContext, 0, canvasHeight * 2, canvasWidth, canvasHeight );
    assets.wallData = myGetImageData( levelContext, 0, canvasHeight * 1, canvasWidth, canvasHeight );
    
    var bgContext = assets.bgCanvas.getContext('2d');
    bgContext.drawImage(assets.baseCanvas,0,0,canvasWidth, canvasHeight);
}

boundingBoxProcess = new (function() {
    this.done = false;
    this.ii = 0;
    this.iiLimit = 40;
    this.objectIndex = 0;
    this.frameIndex = 0;
    this.step = 0;
    this.nextElement = function() {
	var b = boundingBoxProcess;
	b.ii = 0;
	b.step = 0;
	b.frameIndex++;
	if (b.frameIndex >= assets.objects[b.objectIndex].count) {
	    b.frameIndex = 0;
	    b.objectIndex++;
	    if (b.objectIndex >= assets.objects.length)
		b.done = true;
	}
    }
    this.computation = function() {
	// since this is a heavy computation, do it in the background
	var b = boundingBoxProcess;
	if (b.done) return;
	var frameData = assets.objects[b.objectIndex].colliData[b.frameIndex];
	switch( b.step ) {
	    case 0:
		for (var jj=0;jj<b.iiLimit;jj++) {
		    var x = Math.floor(b.ii / canvasHeight);
		    var y = Math.floor(b.ii % canvasHeight);
		    if (frameData.data[(y*canvasWidth + x) * 4 + 3] > 0) {
			assets.objects[b.objectIndex].boundingBox[frameIndex].x = x;
			b.ii = 0;
			b.step++;
			break;
		    }
		    b.ii++;
		    if (b.ii>=canvasWidth*canvasHeight) {
			// empty
			assets.objects[b.objectIndex].boundingBox[frameIndex].w = 0;
			assets.objects[b.objectIndex].boundingBox[frameIndex].h = 0;
			b.nextElement();
			break;
		    }
		}
	    break;
	    case 1:
		for (var jj=0;jj<b.iiLimit;jj++) {
		    var x = Math.floor(canvasWidth - b.ii / canvasHeight - 1);
		    var y = Math.floor(b.ii % canvasHeight);
		    if (frameData.data[(y*canvasWidth + x) * 4 + 3] > 0) {
			assets.objects[b.objectIndex].boundingBox[frameIndex].w = x - assets.objects[b.objectIndex].boundingBox[frameIndex].x;
			b.ii = 0;
			b.step++;
			break;
		    }
		    b.ii++;
		    if (b.ii>=canvasWidth*canvasHeight)
			throw new Error("Computation out of bounds");
		}
	    break;
	    case 2:
		for (var jj=0;jj<b.iiLimit;jj++) {
		    var x = Math.floor(b.ii % canvasWidth);
		    var y = Math.floor(b.ii / canvasWidth);
		    if (frameData.data[(y*canvasWidth + x) * 4 + 3] > 0) {
			assets.objects[b.objectIndex].boundingBox[frameIndex].y = y;
			b.ii = 0;
			b.step++;
			break;
		    }
		    b.ii++;
		    if (b.ii>=canvasWidth*canvasHeight)
			throw new Error("Computation out of bounds");
		}
	    break;
	    case 3:
		for (var jj=0;jj<b.iiLimit;jj++) {
		    var x = Math.floor(b.ii % canvasWidth);
		    var y = Math.floor(canvasHeight - b.ii / canvasHeight - 1);
		    if (frameData.data[(y*canvasWidth + x) * 4 + 3] > 0) {
			assets.objects[b.objectIndex].boundingBox[frameIndex].h = y - assets.objects[b.objectIndex].boundingBox[frameIndex].y;
			b.nextElement();
			break;
		    }
		    b.ii++;
		    if (b.ii>=canvasWidth*canvasHeight)
			throw new Error("Computation out of bounds");
		}
	    break;
	    default:  return;
	    break;
	}
	b.execute();
    }
    this.execute = function() {
	setTimeout( "boundingBoxProcess.computation()", 100 ); 
    }
})

//---------------------------------------
// GAME LOGIC + GAME GRAPHICS

function updateAnimations() {

    // background
    var bgContext = assets.bgCanvas.getContext('2d');
    // foreground
    var canvas = document.getElementById("canvas1");
    var fgContext = canvas.getContext("2d");
    
    // objects
    for (var ii=0; ii<assets.objects.length; ii++) {
	var oldFrame = assets.objects[ii].oldFrame;
	var frame = assets.objects[ii].currentFrame;
	if (oldFrame == frame)
	    continue;
	if (oldFrame >= 0) {
	    var box = assets.objects[ii].boundingBox[oldFrame];
	    if ((box.w > 0) && (box.h > 0)) {
		bgContext.drawImage(assets.baseCanvas, box.x, box.y, box.w, box.h, box.x, box.y, box.w, box.h);
		fgContext.drawImage(assets.baseCanvas, box.x, box.y, box.w, box.h, box.x, box.y, box.w, box.h);
	    }
	}
	assets.objects[ii].oldFrame = frame;
	var objectCanvas = assets.objects[ii].frames[frame];
	var box = assets.objects[ii].boundingBox[frame];
	if ((box.w > 0) && (box.h > 0)) {
	    bgContext.drawImage(objectCanvas, box.x, box.y, box.w, box.h, box.x, box.y, box.w, box.h);
	    fgContext.drawImage(objectCanvas, box.x, box.y, box.w, box.h, box.x, box.y, box.w, box.h);
	}
    }
	
    assets.updateAnimations = false;
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

