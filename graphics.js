
var graphics = new( function() {
	var self = this;
	
    self.playerInterpolatedX = 0;
    self.playerInterpolatedY = 0;
    
    self.init = function() {
    	// bgCanvas holds the background (used for draw updates)
    	self.bgCanvas = document.createElement('canvas');
    	self.topCanvas = document.createElement('canvas');
    
		self.getDocumentCanvas(1);
		self.canvasWidth = self.levelCanvas.width;
		self.canvasHeight = self.levelCanvas.height;
		
		self.playerInterpolatedX = player.x;
		self.playerInterpolatedY = player.y;
    }
    
    self.draw = function(dt) {
		var dts = dt/1000;
		
		var newX = Math.floor(player.x+player.speedRight*dts + 0.5);
	    var newY = Math.floor(player.y-player.speedUp*dts + 0.5);
	    
	    if (newX != self.playerInterpolatedX || newY != self.playerInterpolatedY) {
			if ((self.playerInterpolatedX >=0) && (self.playerInterpolatedX+player.width<=self.canvasWidth) && (self.playerInterpolatedY>=0) && (self.playerInterpolatedY+player.height<=self.canvasHeight)) {
			    self.levelContext.drawImage(graphics.bgCanvas, self.playerInterpolatedX, self.playerInterpolatedY, player.width, player.height, self.playerInterpolatedX, self.playerInterpolatedY, player.width, player.height);
			    self.levelContext.drawImage(graphics.topCanvas, self.playerInterpolatedX, self.playerInterpolatedY, player.width, player.height, self.playerInterpolatedX, self.playerInterpolatedY, player.width, player.height);
			}
			
			self.playerInterpolatedX = newX;
			self.playerInterpolatedY = newY;
		    
			if ((self.playerInterpolatedX>=0) && (self.playerInterpolatedX+player.width<=self.canvasWidth) && (self.playerInterpolatedY>=0) && (self.playerInterpolatedY+player.height<=self.canvasHeight)) {
			    self.levelContext.drawImage(assets.walkerImage, player.frame*player.width, 0, player.width, player.height, self.playerInterpolatedX, self.playerInterpolatedY, player.width, player.height);
				self.levelContext.drawImage(graphics.topCanvas, self.playerInterpolatedX, self.playerInterpolatedY, player.width, player.height, self.playerInterpolatedX, self.playerInterpolatedY, player.width, player.height);
			}
		}
    
    }
    
    self.undrawPlayer = function() {
    	if ((self.playerInterpolatedX >=0) && (self.playerInterpolatedX+player.width<=self.canvasWidth) && (self.playerInterpolatedY>=0) && (self.playerInterpolatedY+player.height<=self.canvasHeight)) {
			self.levelContext.drawImage(graphics.bgCanvas, self.playerInterpolatedX, self.playerInterpolatedY, player.width, player.height, self.playerInterpolatedX, self.playerInterpolatedY, player.width, player.height);
			self.levelContext.drawImage(graphics.topCanvas, self.playerInterpolatedX, self.playerInterpolatedY, player.width, player.height, self.playerInterpolatedX, self.playerInterpolatedY, player.width, player.height);
		}
    }

    self.paintBackground = function() {
		self.levelContext.drawImage(graphics.bgCanvas,0,0);
		self.levelContext.drawImage(graphics.topCanvas,0,0);
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
    	
    	if (!self.levelCanvas) {
    		// adding just one, at the top or at the bottom of the current one
    		var newCanvas = document.createElement('canvas');
    		newCanvas.setAttribute('id','canvas_'+index);
    		newCanvas.setAttribute('style','image-rendering: optimizespeed ! important;');
    		newCanvas.setAttribute('moz-opaque','');
    		newCanvas.setAttribute('width','1000');
    		newCanvas.setAttribute('height','160');
    		
    		var levelContainer = document.getElementById("canvaslist");
    		if (index < Level.firstIndex) {
    			Level.firstIndex--;
    			levelContainer.insertBefore(newCanvas,levelContainer.firstChild);
    		} else if (index > Level.lastIndex) {
    			Level.lastIndex++;
    			levelContainer.appendChild(newCanvas); 
    		}
    		self.levelCanvas = newCanvas;
    	}
    	
		self.levelContext = self.levelCanvas.getContext("2d");
    }
})
