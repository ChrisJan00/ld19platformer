var Level = new( function () {
	var self = this;
	var _private = {}
	
	self.firstIndex = 1;
    self.lastIndex = 1;
    self.levelIndex = 1;
    self.sublevelIndex = 1;
    self.min_dist = 100; // entrances are 100 pixels wide
	
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
	    
	    // generate the top layer
	    var topContext = graphics.topCanvas.getContext('2d');
	    graphics.topCanvas.width = gW;
	    graphics.topCanvas.height = gH;
	    topContext.drawImage(assets.levelImage,0,gH*4, gW, gH, 0,0, gW, gH);

		// get the collision data
		var originalCanvas = document.createElement('canvas');
	    var originalContext = originalCanvas.getContext('2d');
	    originalCanvas.width = assets.levelImage.width;
	    originalCanvas.height = assets.levelImage.height;
	    originalContext.drawImage(assets.levelImage, 0, 0);

	    assets.killData = originalContext.getImageData(0, gH * 2, gW, gH );
	    assets.wallData = originalContext.getImageData(0, gH * 1, gW, gH );
	    assets.climbData = originalContext.getImageData(0, gH * 3, gW, gH );

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
		_levelImage.onerror = function() {
			_levelImage.isLoading = false;
		}
		_levelImage.isLoading = true;
		_levelImage.src = "graphics/map_"+index+"_"+subindex+".png";
		return _levelImage;
	}
	
	_private.checkLevelLoaded = function( levelInfo ) {
		if (!levelInfo.pending)
			return true;
	    if (levelInfo.levelImage.complete || !levelInfo.levelImage.isLoading) {
	    	if (levelInfo.levelImage.width > 0) {
	    		if (_private.continueCaching(levelInfo)) {
					levelInfo.exists = true;
					levelInfo.pending = false;
					return true;
				}
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
    
    _private.continueCaching = function( levelInfo ) {
    	if (!levelInfo.cachingStep)
    		levelInfo.cachingStep = 0;
    	var gW = graphics.canvasWidth;   
	    var gH = graphics.canvasHeight;
    	switch (levelInfo.cachingStep) {
    		case 0: {
    			levelInfo.bgCanvas = document.createElement("canvas");
    			levelInfo.bgContext = levelInfo.bgCanvas.getContext("2d");
    			levelInfo.bgCanvas.width = gW;
    			levelInfo.bgCanvas.height = gH;
    			levelInfo.cachingStep = 1;
    			return false;
    		}
    		case 1: {
    			levelInfo.bgContext.drawImage(levelInfo.levelImage, 0, gH*0, gW, gH, 0, 0, gW, gH);
    			levelInfo.cachingStep = 2;
    			return false;
    		}
    		case 2: {
    			levelInfo.bgContext.drawImage(levelInfo.levelImage, 0, gH*1, gW, gH, 0, 0, gW, gH);
    			levelInfo.cachingStep = 3;
    			return false;
    		}
    		case 3: {
    			levelInfo.bgContext.drawImage(levelInfo.levelImage, 0, gH*2, gW, gH, 0, 0, gW, gH);
    			levelInfo.cachingStep = 4;
    			return false;
    		}
    		case 4: {
    			levelInfo.bgContext.drawImage(levelInfo.levelImage, 0, gH*3, gW, gH, 0, 0, gW, gH);
    			levelInfo.cachingStep = 5;
    			return false;
    		}
    		case 5: {
    			levelInfo.topCanvas = document.createElement("canvas");
    			levelInfo.topContext = levelInfo.topCanvas.getContext("2d");
    			levelInfo.topCanvas.width = gW;
    			levelInfo.topCanvas.height = gH;
    			levelInfo.cachingStep = 6;
    			return false;
    		}
    		case 6: {
    			levelInfo.topContext.drawImage(levelInfo.levelImage, 0, gH*4, gW, gH, 0, 0, gW, gH);
    			levelInfo.cachingStep = 7;
    			return false;
    		}
    		case 7: {
    			levelInfo.originalCanvas = document.createElement("canvas");
    			levelInfo.originalContext = levelInfo.originalCanvas.getContext("2d");
    			levelInfo.originalCanvas.width = levelInfo.levelImage.width;
    			levelInfo.originalCanvas.height = levelInfo.levelImage.height;
    			levelInfo.cachingStep = 8;
    			return false;
    		}
    		case 8: {
    			levelInfo.originalContext.drawImage(levelInfo.levelImage, 0, 0);
    			levelInfo.cachingStep = 9;
    			return false;
    		}
    		case 9: {
    			levelInfo.killData = levelInfo.originalContext.getImageData(0, gH * 2, gW, gH );
    			levelInfo.cachingStep = 10;
    			return false;
    		}
    		case 10: {
    			levelInfo.wallData = levelInfo.originalContext.getImageData(0, gH * 1, gW, gH );
    			levelInfo.cachingStep = 11;
    			return false;
    		}
    		case 11: {
    			levelInfo.climbData = levelInfo.originalContext.getImageData(0, gH * 3, gW, gH );
    			levelInfo.cachingStep = 12;
    			return false;
    		}
			case 12:
				return true;
    	}
    	return false;
    }

		
	_private.activateLevel = function( levelInfo ) {	
		// leave level through the top
		if (!levelInfo.exists)
			return;
			
		gameControl.disableTimer();
		
		// remove player from view
		graphics.undrawPlayer();
			
		// load the level
		assets.levelImage = levelInfo.levelImage;
		self.levelIndex = levelInfo.levelIndex;
		self.sublevelIndex = levelInfo.sublevelIndex;
		graphics.getDocumentCanvas(self.levelIndex);
		
		graphics.bgCanvas = levelInfo.bgCanvas;
		graphics.bgContext = levelInfo.bgContext;
	    graphics.topCanvas = levelInfo.topCanvas;
	    graphics.topContext = levelInfo.topContext;
	    
	    // generate the top layer
	    
	    assets.killData = levelInfo.killData;
	    assets.wallData = levelInfo.wallData;
	    assets.climbData = levelInfo.climbData;
		
		// set the start and stop positions (and velocities!)
		// but the actual positions should be stored when the player is standing or climbing (that is, on a velocity of 0)
		if (player.y < 0)
			player.y = graphics.canvasHeight - player.height - 1;
		else
			player.y = 0;
		player.startx = player.x;
		player.starty = player.y
		// but only when going up!
		
		// TODO: this is slow, should be done gradually during preload
		//self.loadLevel();
		// paint the background
	    graphics.paintBackground();
	    self.startLevelPreloading();
	}

})
