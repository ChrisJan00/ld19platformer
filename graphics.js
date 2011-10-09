function draw(dt) {
    graphics.draw(dt);
}

var graphics = new( function() {
    this.playerInterpolatedX = 0;
    this.playerInterpolatedY = 0;
    
    this.init = function() {
	graphics.currentCanvas = document.getElementById("canvas1");
	graphics.currentContext = graphics.currentCanvas.getContext("2d");
	graphics.canvasWidth = graphics.currentCanvas.width;
	graphics.canvasHeight = graphics.currentCanvas.height;
	
	graphics.playerInterpolatedX = player.x;
	graphics.playerInterpolatedY = player.y;
    }
    
    this.draw = function(dt) {
	var dts = dt/1000;
    
	if ((graphics.playerInterpolatedX >=0) && (graphics.playerInterpolatedX+player.width<=graphics.canvasWidth) && (graphics.playerInterpolatedY>=0) && (graphics.playerInterpolatedY+player.height<=graphics.canvasHeight))
	    graphics.currentContext.drawImage(assets.bgCanvas, graphics.playerInterpolatedX, graphics.playerInterpolatedY, player.width, player.height, graphics.playerInterpolatedX, graphics.playerInterpolatedY, player.width, player.height); 

	graphics.playerInterpolatedX = Math.floor(player.x+player.speedRight*dts + 0.5);
	graphics.playerInterpolatedY = Math.floor(player.y-player.speedUp*dts + 0.5);
    
	if ((graphics.playerInterpolatedX>=0) && (graphics.playerInterpolatedX+player.width<=graphics.canvasWidth) && (graphics.playerInterpolatedY>=0) && (graphics.playerInterpolatedY+player.height<=graphics.canvasHeight)) {
	    graphics.currentContext.drawImage(assets.walkerImage, player.frame*player.width, 0, player.width, player.height, graphics.playerInterpolatedX, graphics.playerInterpolatedY, player.width, player.height);
	}
    
    }

    this.paintBackground = function() {
		graphics.currentContext.drawImage(assets.bgCanvas,0,0);
    }
})
