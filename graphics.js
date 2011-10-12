
var graphics = new( function() {
	var self = this;
	
    self.playerInterpolatedX = 0;
    self.playerInterpolatedY = 0;
    
    self.init = function() {
    	// bgCanvas holds the background (used for draw updates)
    	self.bgCanvas = document.createElement('canvas');
    
		self.getDocumentCanvas(1);
		self.canvasWidth = self.levelCanvas.width;
		self.canvasHeight = self.levelCanvas.height;
		
		self.playerInterpolatedX = player.x;
		self.playerInterpolatedY = player.y;
    }
    
    self.draw = function(dt) {
	var dts = dt/1000;
    
	if ((self.playerInterpolatedX >=0) && (self.playerInterpolatedX+player.width<=self.canvasWidth) && (self.playerInterpolatedY>=0) && (self.playerInterpolatedY+player.height<=self.canvasHeight))
	    self.levelContext.drawImage(graphics.bgCanvas, self.playerInterpolatedX, self.playerInterpolatedY, player.width, player.height, self.playerInterpolatedX, self.playerInterpolatedY, player.width, player.height); 

	self.playerInterpolatedX = Math.floor(player.x+player.speedRight*dts + 0.5);
	self.playerInterpolatedY = Math.floor(player.y-player.speedUp*dts + 0.5);
    
	if ((self.playerInterpolatedX>=0) && (self.playerInterpolatedX+player.width<=self.canvasWidth) && (self.playerInterpolatedY>=0) && (self.playerInterpolatedY+player.height<=self.canvasHeight)) {
	    self.levelContext.drawImage(assets.walkerImage, player.frame*player.width, 0, player.width, player.height, self.playerInterpolatedX, self.playerInterpolatedY, player.width, player.height);
	}
    
    }

    self.paintBackground = function() {
		self.levelContext.drawImage(graphics.bgCanvas,0,0);
    }
    
    self.updateAnimation = function(dt) {
	    if ((player.speedRight != 0 && player.standing) || (player.speedUp !=0 && player.wasClimbing)) {
		    player.animationTimer = player.animationTimer - dt;
			while (player.animationTimer <= 0) {
			    player.frame = (player.frame+1)%4;
			    player.animationTimer = player.animationTimer + player.frameDelay;
			}
	    }
    }
    
    self.getDocumentCanvas = function(index) {
    	self.levelCanvas = document.getElementById("canvas_"+index);
		self.levelContext = self.levelCanvas.getContext("2d");
    }
})
