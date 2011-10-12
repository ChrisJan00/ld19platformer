var Level = new( function () {
	var self = this;
	
	self.init = function() {
    	self.levelIndex = 1;
    	self.sublevelIndex = 1;
    	self.loadLevel();
	}
	
	self.loadLevel = function( ) { 
	    var gW = graphics.canvasWidth;   
	    var gH = graphics.canvasHeight;
	    
			    
	    // generate the background as composition of layers
	    var bgContext = graphics.bgCanvas.getContext('2d');
	    graphics.bgCanvas.width = gW;
	    graphics.bgCanvas.height = gH;
	    bgContext.drawImage(assets.levelImage,0,gH * 0, gW, gH, 0,0, gW, gH);
	    bgContext.drawImage(assets.levelImage,0,gH * 1, gW, gH, 0,0, gW, gH);
	    bgContext.drawImage(assets.levelImage,0,gH * 2, gW, gH, 0,0, gW, gH);
	    bgContext.drawImage(assets.levelImage,0,gH * 3, gW, gH, 0,0, gW, gH);

		// get the collision data
		var originalCanvas = document.createElement('canvas');
	    var originalContext = originalCanvas.getContext('2d');
	    originalCanvas.width = assets.levelImage.width;
	    originalCanvas.height = assets.levelImage.height;
	    originalContext.drawImage(assets.levelImage, 0, 0);

	    assets.killData = myGetImageData( originalContext, 0, gH * 2, gW, gH );
	    assets.wallData = myGetImageData( originalContext, 0, gH * 1, gW, gH );
	    assets.climbData = myGetImageData( originalContext, 0, gH * 3, gW, gH );

		// paint the background
	    graphics.paintBackground();
	    self.startLevelPreloading();
	}
	
	///////////// LEVEL LOAD (todo: simplify this)
	self.startLevelPreloading = function() {
		// start level loading
		assets.upLevel = {
			levelIndex : assets.levelIndex-1,
			sublevelIndex : assets.sublevelIndex+1,
			pending : true
		}
		assets.downLevel = {
			levelIndex : assets.levelIndex+1,
			sublevelIndex : assets.sublevelIndex,
			pending : true
		}
		assets.upLevel.levelImage = new Image();
		assets.upLevel.levelImage.src = "graphics/map_"+assets.upLevel.levelIndex+"_"+assets.upLevel.sublevelIndex+".png";
		assets.downLevel.levelImage = new Image();
		assets.downLevel.levelImage.src = "graphics/map_"+assets.downLevel.levelIndex+"_"+assets.downLevel.sublevelIndex+".png";
	}
	
	self.updateUpLevelPreloading = function() {
		if (assets.upLevel.levelImage.width > 0) {
			assets.upLevel.exists = true;
			assets.upLevel.pending = false;
		}
		else {
			assets.upLevel.sublevelIndex = assets.upLevel.sublevelIndex-1;
			if (assets.upLevel.sublevelIndex==0) {
				assets.upLevel.exists = false;
				assets.upLevel.pending = false;
			}
			assets.upLevel.levelImage = new Image();
			assets.upLevel.levelImage.src = "graphics/map_"+assets.upLevel.levelIndex+"_"+assets.upLevel.sublevelIndex+".png";
		}
	}
	
	self.updateDownLevelPreloading = function() {
		if (assets.downLevel.levelImage.width > 0) {
			assets.downLevel.exists = true;
			assets.downLevel.pending = false;
		}
		else {
			assets.downLevel.sublevelIndex = assets.downLevel.sublevelIndex-1;
			if (assets.downLevel.sublevelIndex==0) {
				assets.downLevel.exists = false;
				assets.downLevel.pending = false;
			}
			assets.downLevel.levelImage = new Image();
			assets.downLevel.levelImage.src = "graphics/map_"+assets.downLevel.levelIndex+"_"+assets.downLevel.sublevelIndex+".png";
		}
	}
	
	self.levelUp = function() {
		// leave level through the top
		if (!assets.upLevel.exists)
			return;
			
		// get the new canvas
		// load the level
		assets.levelImage = assets.upLevel.levelImage;
		assets.levelIndex = assets.upLevel.levelIndex;
		assets.sublevelIndex = assets.upLevel.sublevelIndex;
		graphics.getCanvas(assets.levelIndex);
		self.loadLevel();

	}
	
	self.levelDown = function() {
		if (!assets.downLevel.exists)
			return;
		// load the level
		assets.levelImage = assets.upLevel.levelImage;
		assets.levelIndex = assets.upLevel.levelIndex;
		assets.sublevelIndex = assets.upLevel.sublevelIndex;
		self.getCanvas();
		self.loadLevel(assets.levelIndex);
	}


})
