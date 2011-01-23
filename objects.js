// ---------------------------------------------------------
// GLOBAL OBJECTS

function loadLevel( levelImage ) { 
    var gW = graphics.canvasWidth;   
    var gH = graphics.canvasHeight;
    assets.levelImage = levelImage;
    
    var levelContext = assets.levelCanvas.getContext('2d');
    assets.levelCanvas.width = assets.levelImage.width;
    assets.levelCanvas.height = assets.levelImage.height;
    levelContext.drawImage(assets.levelImage, 0, 0);
    
    // objects
    assets.objects = new Array();
    if (assets.levelImage.height > gH * 3) {
	// count objects and their length
	var objectData = myGetImageData( levelContext, gW-1, gH * 4-1, 1, assets.levelCanvas.height - gH * 4 + 1); 
	var objectCount = 0;
	var ii;
	
	for (ii=0; ii < objectData.height; ii += gH) {
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
	    assets.objects[ii].activationData = myGetImageData(levelContext, 0, gH * screenCount, gW, gH);
	    // get animation layers in an object canvas
	    assets.objects[ii].frames = new Array();
	    assets.objects[ii].boundingBox = new Array();
	    assets.objects[ii].colliData = new Array();
	    for (var jj=0;jj<assets.objects[ii].count;jj++) {
		var objCanvas = document.createElement('canvas');
		objCanvas.width = gW;
		objCanvas.height = gH;
		var objCtx = objCanvas.getContext('2d');
		objCtx.drawImage( assets.levelCanvas, 0, gH * (screenCount + jj + 1), gW, gH, 0, 0, gW, gH);
		assets.objects[ii].frames[jj] = objCanvas;
		assets.objects[ii].colliData[jj] = myGetImageData( objCtx, 0, 0, gW, gH);
		assets.objects[ii].boundingBox[jj] = new ( function() {
		    this.x = 0;
		    this.y = 0;
		    this.w = gW;
		    this.h = gH;
		} )
	    }
	    screenCount += assets.objects[ii].count + 1;
	}
	
    }
    
    boundingBoxProcess.execute();
    
    // drawing
    var baseContext = assets.baseCanvas.getContext('2d');
    assets.baseCanvas.width = gW;
    assets.baseCanvas.height = gH;
    baseContext.drawImage(assets.levelImage,0,gH * 0, gW, gH, 0,0, gW, gH);
    baseContext.drawImage(assets.levelImage,0,gH * 1, gW, gH, 0,0, gW, gH);
    baseContext.drawImage(assets.levelImage,0,gH * 2, gW, gH, 0,0, gW, gH);
    assets.killData = myGetImageData( levelContext, 0, gH * 2, gW, gH );
    assets.wallData = myGetImageData( levelContext, 0, gH * 1, gW, gH );
    
    var bgContext = assets.bgCanvas.getContext('2d');
    bgContext.drawImage(assets.baseCanvas,0,0,gW, gH);
}

boundingBoxProcess = new (function() {
    this.done = false;
    this.isComputing = false;
    this.ii = 0;
    this.iiLimit = 1000;
    this.breathTime = 10;
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
	    if (b.objectIndex >= assets.objects.length) {
		b.stop();
		b.done = true;
	    }
	}
    }
    this.computation = function() {
	// since this is a heavy computation, do it in the background
	var b = boundingBoxProcess;
	if (b.done) return;
	
	// "only one can be executed"
	if (b.isComputing) return;
	b.isComputing = true;
	
	var gW = graphics.canvasWidth;
	var gH = graphics.canvasHeight;
	
	var frameData = assets.objects[b.objectIndex].colliData[b.frameIndex];
	switch( b.step ) {
	    case 0:
		for (var jj=0;jj<b.iiLimit;jj++) {
		    var x = Math.floor(b.ii / gH);
		    var y = Math.floor(b.ii % gH);
		    if (frameData.data[(y*gW + x) * 4 + 3] > 0) {
			assets.objects[b.objectIndex].boundingBox[b.frameIndex].x = x;
			b.ii = 0;
			b.step++;
			break;
		    }
		    b.ii++;
		    if (b.ii>=gW*gH) {
			// empty
			assets.objects[b.objectIndex].boundingBox[b.frameIndex].w = 0;
			assets.objects[b.objectIndex].boundingBox[b.frameIndex].h = 0;
			b.nextElement();
			break;
		    }
		}
	    break;
	    case 1:
		var x0 = assets.objects[b.objectIndex].boundingBox[b.frameIndex].x;
		var ix = gW - x0;
		for (var jj=0;jj<b.iiLimit;jj++) {
		    var x = Math.floor(b.ii % ix) + x0;
		    var y = Math.floor(b.ii / ix);
		    if (frameData.data[(y*gW + x) * 4 + 3] > 0) {
			assets.objects[b.objectIndex].boundingBox[b.frameIndex].y = y;
			b.ii = 0;
			b.step++;
			break;
		    }
		    b.ii++;
		    if (b.ii>=ix*gH)
			throw new Error("Computation out of bounds");
		}
	    break;	    
	    case 2:
		var y0 = assets.objects[b.objectIndex].boundingBox[b.frameIndex].y;
		var iy = gH - y0;
		for (var jj=0;jj<b.iiLimit;jj++) {
		    var x = Math.floor(gW - b.ii / iy - 1);
		    var y = Math.floor(b.ii % iy) + y0;
		    if (frameData.data[(y*gW + x) * 4 + 3] > 0) {
			assets.objects[b.objectIndex].boundingBox[b.frameIndex].w = x - assets.objects[b.objectIndex].boundingBox[b.frameIndex].x;
			b.ii = 0;
			b.step++;
			break;
		    }
		    b.ii++;
		    if (b.ii>=gW*iy)
			throw new Error("Computation out of bounds");
		}
	    break;
	    case 3:
		var x0 = assets.objects[b.objectIndex].boundingBox[b.frameIndex].x;
		var ix = assets.objects[b.objectIndex].boundingBox[b.frameIndex].w;
		for (var jj=0;jj<b.iiLimit;jj++) {
		    var x = Math.floor(b.ii % ix) + x0;
		    var y = Math.floor(gH - b.ii / ix - 1);
		    if (frameData.data[(y*gW + x) * 4 + 3] > 0) {
			assets.objects[b.objectIndex].boundingBox[b.frameIndex].h = y - assets.objects[b.objectIndex].boundingBox[b.frameIndex].y;
			b.nextElement();
			break;
		    }
		    b.ii++;
		    if (b.ii>=gW*gH)
			throw new Error("Computation out of bounds");
		}
	    break;
	    default:
	    break;
	}
	b.isComputing = false;
    }
    this.execute = function() {
	boundingBoxProcess.runControl = setInterval(boundingBoxProcess.computation, boundingBoxProcess.breathTime);
    }
    this.stop = function() {
	clearInterval(boundingBoxProcess.runControl);
    }
})

//---------------------------------------
// GAME LOGIC + GAME GRAPHICS

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
    var gW = graphics.canvasWidth;
    var gH = graphics.canvasHeight;
    if ((sx <= 0) || (sx >= gW) || (sy <= 0) || (sy >= gH))
	return false;
    return ( assets.objects[index].activationData.data[ ( Math.floor(sy) * gW + Math.floor(sx) ) * 4 + 3] > 0 );
}

