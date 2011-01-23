// worker

// the caller checks if webworkers are available, using them if they are, or the alternative "pseudothread" structure if not.

function checkWorkersAvailable() 
{
    // the DOM is not available from within the worker, if I have no access then I'll assume I am the worker
    try {
	// if the DOM is available, check if it supports workers
        return !!window.Worker;
    } catch(e) {
	return true;
    }
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
    this.step = 0;
    this.computation = function() {
	// since this is a heavy computation, do it in the background
	var b = boundingBoxProcess;
	if (b.done) return;
	
	// "only one can be executed"
	if (b.isComputing) return;
	b.isComputing = true;
	
	switch( b.step ) {
	    case 0:
		for (var jj=0;jj<b.iiLimit;jj++) {
		    var x = Math.floor(b.ii / b.gH);
		    var y = Math.floor(b.ii % b.gH);
		    if (b.frameData[(y*b.gW + x) * 4 + 3] > 0) {
			b.box.x = x;
			b.ii = 0;
			b.step++;
			break;
		    }
		    b.ii++;
		    if (b.ii>=b.gW*b.gH) {
			// empty
			b.box.w = 0;
			b.box.h = 0;
			b.sendUpdate();
			break;
		    }
		}
	    break;
	    case 1:
		var x0 = b.box.x;
		var ix = b.gW - x0;
		for (var jj=0;jj<b.iiLimit;jj++) {
		    var x = Math.floor(b.ii % ix) + x0;
		    var y = Math.floor(b.ii / ix);
		    if (b.frameData[(y*b.gW + x) * 4 + 3] > 0) {
			b.box.y = y;
			b.ii = 0;
			b.step++;
			break;
		    }
		    b.ii++;
		    if (b.ii>=ix*b.gH)
			throw new Error("Computation out of bounds");
		}
	    break;	    
	    case 2:
		var y0 = b.box.y;
		var iy = b.gH - y0;
		for (var jj=0;jj<b.iiLimit;jj++) {
		    var x = Math.floor(b.gW - b.ii / iy - 1);
		    var y = Math.floor(b.ii % iy) + y0;
		    if (b.frameData[(y*b.gW + x) * 4 + 3] > 0) {
			b.box.w = x - b.box.x;
			b.ii = 0;
			b.step++;
			break;
		    }
		    b.ii++;
		    if (b.ii>=b.gW*iy)
			throw new Error("Computation out of bounds");
		}
	    break;
	    case 3:
		var x0 = b.box.x;
		var ix = b.box.w;
		for (var jj=0;jj<b.iiLimit;jj++) {
		    var x = Math.floor(b.ii % ix) + x0;
		    var y = Math.floor(b.gH - b.ii / ix - 1);
		    if (b.frameData[(y*b.gW + x) * 4 + 3] > 0) {
			b.box.h = y - b.box.y;
			b.sendUpdate();
			break;
		    }
		    b.ii++;
		    if (b.ii>=b.gW*b.gH)
			throw new Error("Computation out of bounds");
		}
	    break;
	    default:
	    break;
	}
	b.isComputing = false;
    }
    
    this.start = function(exchangeData) {
	boundingBoxProcess.frameData = exchangeData.frameData;
	boundingBoxProcess.box = exchangeData.box;
	boundingBoxProcess.gW = exchangeData.box.w;
	boundingBoxProcess.gH = exchangeData.box.h;
	boundingBoxProcess.callBack = exchangeData.callback;
 	boundingBoxProcess.execute();
    }
    
    this.prepare = function() {
	boundingBoxProcess.ii = 0;
	boundingBoxProcess.step = 0;
	boundingBoxProcess.done = false;
        boundingBoxProcess.isComputing = false;
    }
    
    this.execute = function() {
	boundingBoxProcess.prepare();
	if (!checkWorkersAvailable())
	    boundingBoxProcess.runControl = setInterval(boundingBoxProcess.computation, boundingBoxProcess.breathTime);
	else {
	    while (!boundingBoxProcess.done)
		boundingBoxProcess.computation();
	}
    }
    this.stop = function() {
	boundingBoxProcess.done = true;
	if (!checkWorkersAvailable())
	    clearInterval(boundingBoxProcess.runControl);
    }
    this.sendUpdate = function() {
	boundingBoxProcess.stop();
	if (!checkWorkersAvailable())
	    boundingBoxProcess.callBack( boundingBoxProcess.box );
	else
	    self.postMessage( boundingBoxProcess.box );
    }
})