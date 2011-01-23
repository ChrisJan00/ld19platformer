// worker

// so, the idea is that I receive a postmessage with the whole Level structure, which is not completed
// then I start computing, periodically responding with an update function that returns the whole (updated) structure
// the reply should not include the images, only the computed data

// the caller checks if webworkers are available, using them if they are, or the alternative "pseudothread" structure if not.

function checkWorkersAvailable() 
{
    return false;
    return !!window.Worker;
}

if (checkWorkersAvailable()) {
    var levelworker = self;
    onmessage = function(event) {
 	boundingBoxProcess.start(event.data);
    }
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
	if (b.frameIndex >= b.inputData[b.objectIndex].count) {
	    b.frameIndex = 0;
	    b.objectIndex++;
	    if (b.objectIndex >= b.inputData.length) {
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
	
// 	b.processedData = b.inputData;
	
// 	var gW = graphics.canvasWidth;
// 	var gH = graphics.canvasHeight;
	var gW = b.inputData[b.objectIndex].frames[0].width;
	var gH = b.inputData[b.objectIndex].frames[0].height;
	
	var frameData = b.inputData[b.objectIndex].colliData[b.frameIndex].data;
	switch( b.step ) {
	    case 0:
		for (var jj=0;jj<b.iiLimit;jj++) {
		    var x = Math.floor(b.ii / gH);
		    var y = Math.floor(b.ii % gH);
		    if (frameData[(y*gW + x) * 4 + 3] > 0) {
			b.processedData[b.objectIndex].boundingBox[b.frameIndex].x = x;
			b.ii = 0;
			b.step++;
			b.sendUpdate();
			break;
		    }
		    b.ii++;
		    if (b.ii>=gW*gH) {
			// empty
			b.processedData[b.objectIndex].boundingBox[b.frameIndex].w = 0;
			b.processedData[b.objectIndex].boundingBox[b.frameIndex].h = 0;
			b.nextElement();
			b.sendUpdate();
			break;
		    }
		}
	    break;
	    case 1:
		var x0 = b.processedData[b.objectIndex].boundingBox[b.frameIndex].x;
		var ix = gW - x0;
		for (var jj=0;jj<b.iiLimit;jj++) {
		    var x = Math.floor(b.ii % ix) + x0;
		    var y = Math.floor(b.ii / ix);
		    if (frameData[(y*gW + x) * 4 + 3] > 0) {
			b.processedData[b.objectIndex].boundingBox[b.frameIndex].y = y;
			b.ii = 0;
			b.step++;
			b.sendUpdate();
			break;
		    }
		    b.ii++;
		    if (b.ii>=ix*gH)
			throw new Error("Computation out of bounds");
		}
	    break;	    
	    case 2:
		var y0 = b.processedData[b.objectIndex].boundingBox[b.frameIndex].y;
		var iy = gH - y0;
		for (var jj=0;jj<b.iiLimit;jj++) {
		    var x = Math.floor(gW - b.ii / iy - 1);
		    var y = Math.floor(b.ii % iy) + y0;
		    if (frameData[(y*gW + x) * 4 + 3] > 0) {
			b.processedData[b.objectIndex].boundingBox[b.frameIndex].w = x - b.processedData[b.objectIndex].boundingBox[b.frameIndex].x;
			b.ii = 0;
			b.step++;
			b.sendUpdate();
			break;
		    }
		    b.ii++;
		    if (b.ii>=gW*iy)
			throw new Error("Computation out of bounds");
		}
	    break;
	    case 3:
		var x0 = b.processedData[b.objectIndex].boundingBox[b.frameIndex].x;
		var ix = b.processedData[b.objectIndex].boundingBox[b.frameIndex].w;
		for (var jj=0;jj<b.iiLimit;jj++) {
		    var x = Math.floor(b.ii % ix) + x0;
		    var y = Math.floor(gH - b.ii / ix - 1);
		    if (frameData[(y*gW + x) * 4 + 3] > 0) {
			b.processedData[b.objectIndex].boundingBox[b.frameIndex].h = y - b.processedData[b.objectIndex].boundingBox[b.frameIndex].y;
			b.nextElement();
			b.sendUpdate();
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
    
    this.start = function(exchangeData) {
	boundingBoxProcess.inputData = exchangeData.input;
	boundingBoxProcess.processedData = exchangeData.output;
	boundingBoxProcess.callBack = exchangeData.callback;
 	boundingBoxProcess.execute();
    }
//     this.setCallback = function( callBack ) {
// 	boundingBoxProcess.callBack = callBack;
//     }
    
    this.execute = function() {
	if (!checkWorkersAvailable())
	    boundingBoxProcess.runControl = setInterval(boundingBoxProcess.computation, boundingBoxProcess.breathTime);
	else {
	    while (!boundingBoxProcess.done)
		boundingBoxProcess.computation();
	}
    }
    this.stop = function() {
	if (!checkWorkersAvailable())
	    clearInterval(boundingBoxProcess.runControl);
    }
    this.sendUpdate = function() {
	if (!checkWorkersAvailable())
	    boundingBoxProcess.callBack( boundingBoxProcess.processedData );
	else
	    self.postMessage( boundingBoxProcess.processedData );
    }
})