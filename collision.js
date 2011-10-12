
var Collision = new (function() {
	var self = this;
	
	// PUBLIC METHODS:
	// collidedVertical() returns true if collided against ceiling or floor
	// collidedHorizontal() returns true if collided against wall on a side
	// collidedDeath() returns true if touched a "death" spot
	// collidedClimb() returns true if feet over a climb area
	
	self.collidedVertical = function() {
	    // (checking only red component)
	    // check feet    
	    if ((player.speedUp < 0) && _private.checkWallData(player.x+player.width/2, player.y+player.height ))
	        return true;
	    
	    // check head   
	    if ((player.speedUp > 0) && _private.checkWallData(player.x+player.width/2, player.y ))
	        return true;
	 
	    return false;
	}
	
	self.collidedHorizontal = function() {
	    // check right side
	    if ((player.speedRight > 0) && _private.checkWallData( player.x + player.width, player.y + player.height/2 ))
	        return true;
	    
	    // check left side
	    if ((player.speedRight < 0) && _private.checkWallData( player.x, player.y + player.height/2 ))
	        return true;
	    
	    return false;
	}
	
	self.collidedDeath = function() {
	    if ((player.speedUp < 0) && _private.checkKillData(player.x+player.width/2, player.y+player.height ))
	        return true;
	    
	    // check head   
	    if ((player.speedUp > 0) && _private.checkKillData(player.x+player.width/2, player.y ))
	        return true;
	 
	     // check right side
	    if ((player.speedRight > 0) && _private.checkKillData( player.x + player.width, player.y + player.height/2 ))
	        return true;
	    
	    // check left side
	    if ((player.speedRight < 0) && _private.checkKillData( player.x, player.y + player.height/2 ))
	        return true;
	    
	    return false;
	}
	
	self.collidedClimb = function() {
		return _private.checkClimbData(player.x+player.width/2, player.y+player.height );
	}
	
	self.rejectVertically = function() {
		for (var ii=0; ii<player.height/2; ii++)
			if (!_private.checkWallData(player.x+player.width/2, player.y+(player.speedUp<0?player.height-ii:ii)))    
			    break;
		    player.y = player.y + (player.speedUp<0? -ii : ii);
	}
	
	self.rejectHorizontally = function() {
	    for (var ii=0;ii<player.width/2;ii++)
			if (!_private.checkWallData(player.x+(player.speedRight>0?player.width-ii:ii), player.y+player.height/2)) {   
			    player.rejecting = false;
			    break;
			}
	    player.x = player.x + (player.speedRight>0? -ii : ii );
	}
	
	
	////////////////////////////////////////// private functions
	var _private = {}
	
	_private.checkWallData = function(sx,sy) {
	    if ((sx <= 0) || (sx >= graphics.canvasWidth) || (sy <= 0) || (sy >= graphics.canvasHeight))
			return true;
	    var point = ( Math.floor(sy) * graphics.canvasWidth + Math.floor(sx) ) * 4 + 3;
	    if ( assets.wallData.data[ point ] > 0 )
			return true;
	    return false;
	}
	
	_private.checkKillData = function(sx,sy) {
	    if ((sx <= 0) || (sx >= graphics.canvasWidth) || (sy <= 0) || (sy >= graphics.canvasHeight))
			return false;
	    return ( assets.killData.data[ ( Math.floor(sy) * graphics.canvasWidth + Math.floor(sx) ) * 4 + 3] > 0 );
	}
		
	_private.checkClimbData = function(sx, sy) {
		if ((sx <= 0) || (sx >= graphics.canvasWidth) || (sy <= 0) || (sy >= graphics.canvasHeight))
			return false;
	    return ( assets.climbData.data[ ( Math.floor(sy) * graphics.canvasWidth + Math.floor(sx) ) * 4 + 3] > 0 );
	}
})