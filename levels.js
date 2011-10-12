var Level = new( function () {
	var self = this;
	var _private = {}
	
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
	
	self.startLevelPreloading = function() {
		// start level loading
		_private.preloadingDone = false;
		_private.upLevel = _private.generateLevelInfo(self.levelIndex-1, self.sublevelIndex+1);
		_private.downLevel = _private.generateLevelInfo(self.levelIndex+1, self.sublevelIndex);
	}
	
	self.updatePreloading = function() {
		if (_private.preloadingDone)
			return;
		if (_private.checkLevelLoaded(_private.upLevel) && 
			_private.checkLevelLoaded(_private.downLevel)) {
				_private.preloadingDone = true;
		}
	}
	
	self.levelUp = function() {
		_private.activateLevel( _private.upLevel );
	}
	
	self.levelDown = function() {
		_private.activateLevel( _private.downLevel );
	}
	
	
	///////////// PRIVATE METHODS
	
	_private.generateLevelInfo = function(index, subindex) {
		return {
			levelIndex : index,
			sublevelIndex : subindex,
			pending : true,
			exists : false,
			levelImage : _private.getLevelImage(index, subindex)
		};
	}
	
	_private.getLevelImage = function(index, subindex) {
		var _levelImage = new Image();
		_levelImage.src = "graphics/map_"+index+"_"+subindex+".png";
		return _levelImage;
	}
	
	_private.checkLevelLoaded = function( levelInfo ) {
		if (!levelInfo.pending)
			return true;
	    if (levelInfo.levelImage.complete) {
	    	if (levelInfo.levelImage.width > 0) {
				levelInfo.exists = true;
				levelInfo.pending = false;
				return true;
			}
			else {
				levelInfo.sublevelIndex = levelInfo.sublevelIndex-1;
				if (levelInfo.sublevelIndex==0) {
					levelInfo.exists = false;
					levelInfo.pending = false;
					return true;
				} else {
					levelInfo.levelImage = _private.getLevelImage(levelInfo.levelIndex, levelInfo.sublevelIndex);
				}
			}
	    }
	    return false;
    }

		
	_private.activateLevel = function( levelInfo ) {	
		// leave level through the top
		if (!levelInfo.exists)
			return;
			
		// load the level
		assets.levelImage = levelInfo.levelImage;
		self.levelIndex = levelInfo.levelIndex;
		self.sublevelIndex = levelInfo.sublevelIndex;
		graphics.getCanvas(self.levelIndex);
		self.loadLevel();

	}

})