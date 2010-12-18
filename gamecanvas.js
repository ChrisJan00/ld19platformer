var gameControl = new( function() {
        // timer engine
	this.fps = 60;
	this.startTime = new Date().getTime();
	this.stopTime = this.startTime;
	this.elapsed = 0;
	this.dt = 0;
	this.step = 1000/this.fps;
	this.skip = false;
} )

function startGame() {
    loadGame();
    gameControl.runInterval = setInterval(mainLoop, 1000/gameControl.fps);
}

function loadGame() {
}

function mainLoop() {
    if (gameControl.skip)
	return;
    else
	gameControl.skip = true

    // control the time
    gameControl.stopTime = new Date().getTime();
    gameControl.elapsed = gameControl.stopTime - gameControl.startTime;
    gameControl.startTime = gameControl.stopTime;
    gameControl.dt = gameControl.dt + gameControl.elapsed;
	
    while(gameControl.dt > gameControl.step) {
	update( gameControl.step );
	gameControl.dt = gameControl.dt - gameControl.step;
    }
    
    // dt is passed for interpolation
    draw(gameControl.dt);
	
    gameControl.skip = false
}

//---------------------------------------

function update(dt) {
}

function draw(dt) {
    var canvas = document.getElementById("canvas1");
    var context = canvas.getContext("2d");
    context.fillStyle = "#FF00AA";
    context.fillRect(50, 25, 150, 100);
}
