// USAGE:  you have to overload these interface functions.  You will then get an object called gameControl.  Just call
// gameControl.start() to start the game, gameControl.stop() to finish it (it will just stop working, no restarting possible)
// at any time you can change the fps through gameControl.fps and the time per update in gameControl.updateStep

// Interface functions:

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
// control object
var gameControl = new( function() {
    this.fps = 60;
    this.updateStep = 10; // ms
    this.loadInterval = 500; // ms
    
    // private parts
    this.startTime = new Date().getTime();
    this.stopTime = this.startTime;
    this.elapsed = 0;
    this.dt = 0; // ms
    this.skip = false;
    this.start = function() {
	var progress = loaderProgress();
	if (progress < 100) {
	    setTimeout(gameControl.start(),gameControl.loadInterval); // wait 500ms
	    displayLoadScreen(progress);
	} else {
	    prepareGame();
	    gameControl.runInterval = setInterval(gameControl.mainLoop, 1000/gameControl.fps);
	}
    }
    this.stop = function() {
        clearInterval( gameControl.runInterval );
    }

    this.mainLoop = function() {
	if (gameControl.skip)
	    return;
	else
	    gameControl.skip = true

	// control the time
	gameControl.stopTime = new Date().getTime();
	gameControl.elapsed = gameControl.stopTime - gameControl.startTime;
	gameControl.startTime = gameControl.stopTime;
	gameControl.dt = gameControl.dt + gameControl.elapsed;
	
	while(gameControl.dt > gameControl.updateStep) {
	    update( gameControl.updateStep );
	    gameControl.dt = gameControl.dt - gameControl.updateStep;
	}
    
	// dt is passed for interpolation
	draw(gameControl.dt);
	
	gameControl.skip = false
    }
} )
