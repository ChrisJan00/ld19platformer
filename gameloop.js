// USAGE:  you have to overload these interface functions.  You will then get an object called gameControl.  Just call
// gameControl.start() to start the game, gameControl.stop() to finish it (it will just stop working, no restarting possible)
// at any time you can change the fps through gameControl.fps and the time per update in gameControl.updateStep

// Interface functions:

// This function is called once at the very beginning in order to start loading stuff
function load()
{ }

// This function is called periodically while the game is loading.  You should return an estimation of the percent loaded.
// The period is specified in gameControl.loadInterval.  You have to manually check that all content (images/sounds).
function loaderProgress()
{
    return 100;
}

// This function is called for you to display the load screen.  The percent returned by loaderProgress is given
function displayLoadScreen( progress )
{ }

// This function will be called when 100% content is loaded, once, at the start of the game.  You can assume that all content
// is available.
function prepareGame()
{ }

// Use this function to update the simulation.  dt will be the same as gameControl.updateStep, given in ms
function update(dt) 
{ }

// Use this function to update the graphics, using the game state computed in "update".  dt is given in milliseconds and represents
// elapsed time since the last call to dt.  Use it to interpolate the graphics and achieve a smoother simulation, although you can
// safely ignore it if you want (no interpolation at all).
function draw(dt)
{ }

//--------------------------------------------------------------------------------------------------
// control class
var GameControl = function() {
	var self = this;
    self.fps = 60;
    self.updateStep = 10; // ms
    self.loadInterval = 500; // ms
    self.forceDraw = true;
    
    // private parts
    var _priv = {}
    _priv.startTime = new Date().getTime();
    _priv.stopTime = self.startTime;
    _priv.elapsed = 0;
    _priv.dt = 0; // ms
    _priv.skip = false;
    _priv.firstRun = true;
    _priv.timerSkipped = false;
    self.start = function() {
    	if (_priv.firstRun) {
    		_priv.firstRun = false;
    		load();
    	}
    	
		var progress = loaderProgress();
		if (progress < 100) {
		    setTimeout(self.start,self.loadInterval); // wait 500ms
		    displayLoadScreen(progress);
		} else {
		    prepareGame();
		    self.runInterval = setInterval(self.mainLoop, 1000/self.fps);
		}
    }
    self.stop = function() {
        clearInterval( self.runInterval );
    }

    self.mainLoop = function() {
		if (_priv.skip)
		    return;
		else
		    _priv.skip = true
	
		// control the time
		_priv.stopTime = new Date().getTime();
		_priv.elapsed = _priv.stopTime - _priv.startTime;
		_priv.startTime = _priv.stopTime;
		_priv.dt = _priv.dt + _priv.elapsed;
		
		if (_priv.timerSkipped) {
			self.enableTimer();
		}
		
		while(_priv.dt > self.updateStep) {
		    update( self.updateStep );
		    if (self.forceDraw)
		    	draw(0);
		    _priv.dt = _priv.dt - self.updateStep;
		}
	    
		// dt is passed for interpolation
		if ((!self.forceDraw) || _priv.dt>0)
			draw(_priv.dt);
		
		_priv.skip = false
    }
    
    self.disableTimer = function() {
    	if (!_priv.timerSkipped) {
    		_priv.timerSkipTime = new Date().getTime();
    		_priv.timerSkipped = true;
    	}
    }
    
    self.enableTimer = function() {
    	_priv.timerSkipped = false;
    	_priv.dt -= new Date().getTime() - _priv.timerSkipTime;
    }
}
