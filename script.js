var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var backgroundImages = [new Image(), new Image() ];
backgroundImages[0].src = "./images/cityscape_day_02.png";
backgroundImages[1].src = "./images/cityscape_night_02.png";

var getReadyBitmap = new Image();
getReadyBitmap.src = "./images/ready_01.png";

var gameOverBitmap = new Image();
gameOverBitmap.src = "./images/gameover_01.png";

var levelUpBitmap = new Image();
levelUpBitmap.src = "./images/levelup_01.png";

var grassBitmap = new Image();
grassBitmap.src = "./images/grass_02.png";

var grassOffsetX = 0;
var grassCounter = 0;

const numPipeStyles = 4; 

var pipeBitmaps = [ new Image(), new Image(), 
                    new Image(), new Image(), 
                    new Image(), new Image(), 
                    new Image(), new Image() ];

pipeBitmaps[ 0 ].src = "./images/PipeTopGreen_01.png";
pipeBitmaps[ 1 ].src = "./images/PipeBottomGreen_01.png"

pipeBitmaps[ 2 ].src = "./images/PipeTopBlue_01.png";
pipeBitmaps[ 3 ].src = "./images/PipeBottomBlue_01.png"

pipeBitmaps[ 4 ].src = "./images/PipeTopOrange_01.png";
pipeBitmaps[ 5 ].src = "./images/PipeBottomOrange_01.png"

pipeBitmaps[ 6 ].src = "./images/PipeTopRed_01.png";
pipeBitmaps[ 7 ].src = "./images/PipeBottomRed_01.png"

// load sounds
var sfxFlap = new Audio();
sfxFlap.src = "./sounds/sfx_wing.wav";

var sfxScore = new Audio(); 
sfxScore.src = "./sounds/sfx_point.wav";

var sfxCollision = new Audio();
sfxCollision.src = "./sounds/sfx_hit.wav";

var sfxDie = new Audio();
sfxDie.src = "./sounds/sfx_die.wav";

var sfxGameover = new Audio();
sfxGameover.src = "./sounds/sfx_die.wav";

var sfxNewLevel = new Audio();
sfxNewLevel.src = "./sounds/round_end.wav";

var bgMusic = new Audio();
bgMusic.src = "./sounds/Bouncing_Around_in_Pixel_Town.mp3";

var gravity = 0.1; 
var score = 0;
var gap = 200;
var level = 1; 
var gameRunning = false;
var gameInitialized = false; 
var pipes = [];
var frameCount = 0;
var drawNewLevelText = false;
var drawNewLevelframeCount = 0;

var bird = {
    x: 150,
    y: 200,
    vy: 0,
    width: 48,
    height: 32,
    color: 'yellow',
    animState: 0,
    frame: 0,
    frameCounter: 0,
    sprite: [new Image(), new Image(), new Image()],

    draw: function() {
        //ctx.fillStyle = this.color;
        //ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.sprite[this.frame], this.x, this.y, this.width, this.height);

        if (this.animState == 1) {
            if (++this.frameCounter > 2) {
                this.frameCounter = 0;
                if (++this.frame >= 3) {
                    this.frameCounter = 0;
                    this.frame = 0;
                    this.animState = 0;
                }
            }
        }

    },

    update: function() {
        this.vy += gravity;
        this.y += this.vy;
    }
}; 

bird.sprite[0].src = "./images/bluebird_01_frame_01.png";
bird.sprite[1].src = "./images/bluebird_01_frame_02.png";
bird.sprite[2].src = "./images/bluebird_01_frame_03.png";

///////////////////////////////////////////////////////////////////////////////

function Pipe() {
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - gap);
    this.width = 64;
    this.height = this.y;
    this.color = 'green'; 
    this.draw = function() 
    {
        //ctx.fillStyle = this.color;
        //ctx.fillRect(this.x, 0, this.width, this.y);
        ctx.drawImage(pipeBitmaps[ (((level-1) % numPipeStyles) * 2) ], this.x, this.y - 640, this.width, 640 );
        
        //ctx.fillRect(this.x, this.y + gap, this.width, canvas.height - this.y - gap);
        ctx.drawImage( pipeBitmaps[ (((level-1) % numPipeStyles) * 2) + 1 ], this.x, this.y + gap, this.width, 640 );
    }
    this.update = function() {
        this.x -= 2;
    }
}

///////////////////////////////////////////////////////////////////////////////

var backGroundIndex = 0;

function draw() {
  
    if ( level >= 4)
        backGroundIndex = 1;
    
    ctx.drawImage(backgroundImages[ backGroundIndex ], 0, 0, canvas.width, canvas.height);

    bird.draw();

    pipes.forEach(pipe => pipe.draw());

   ctx.drawImage( grassBitmap, grassOffsetX, 0,
                               canvas.width, grassBitmap.height,
                               0, canvas.height - 48,
                               canvas.width, grassBitmap.height ) ;
    
    if ( (grassOffsetX += 2) >= 12 )
        grassOffsetX = 0;
    
    // Display the score
    ctx.fillStyle = "#000000";
    ctx.font = "24px Fantasy";
    ctx.fillText("SCORE:  " + score, 10 + 2, 30 + 4);
    
    ctx.fillStyle = "#00FFFF";
    ctx.font = "24px Fantasy";
    ctx.fillText("SCORE:  " + score, 10, 30);

    // Display the level
    ctx.fillStyle = "#000000";
    ctx.font = "24px Fantasy";
    ctx.fillText("LEVEL:  " + level, 416 + 2, 30 + 4);
        
    ctx.fillStyle = "#FFCD61";
    ctx.font = "24px Fantasy";
    ctx.fillText("LEVEL:  " + level, 416, 30);

    if (frameCount < 120 && gameRunning )
    {
    ctx.drawImage( getReadyBitmap, canvas.width/2 - getReadyBitmap.width, 
                                   canvas.height/2 - getReadyBitmap.height,
                                   getReadyBitmap.width*2, getReadyBitmap.height*2);    
    } // end if

    // display new level text
    if (drawNewLevelText && frameCount < drawNewLevelframeCount)
    {
    ctx.drawImage(levelUpBitmap, canvas.width/2 - levelUpBitmap.width/2, 
                                 16, //canvas.height/2 - levelUpBitmap.height,
                                 levelUpBitmap.width, levelUpBitmap.height);    
        
    } // end if
    
} // draw

///////////////////////////////////////////////////////////////////////////////

function update() {
    bird.update();
    pipes.forEach(pipe => pipe.update());

    var numFramesSpawn = (225 - level*20);
    if ( numFramesSpawn < 100 ) numFramesSpawn = 100;
    
    if (frameCount % numFramesSpawn === 0) {
        let pipe = new Pipe();
        pipe.color = `rgb(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)})`; // New color each pipe
        pipes.push(pipe);
    }
    if (pipes.length > 0 && pipes[0].x + pipes[0].width < 0) {
        pipes.shift();
        score++;
        sfxScore.play();
    }

    const birdPlay = 10;
    
    pipes.forEach(pipe => {
        if (bird.y + birdPlay <= pipe.y || bird.y + bird.height - birdPlay >= pipe.y + gap) {
            if (bird.x + bird.width - birdPlay >= pipe.x && bird.x + birdPlay <= pipe.x + pipe.width) {
                gameRunning = false;
                sfxCollision.play(); // Play collision sound
                sfxDie.play(); // Play die sound as well
                gameInitialized = false;  // The game can now be re-initialized

                // display Game Over
                ctx.drawImage( gameOverBitmap, canvas.width/2 - gameOverBitmap.width, 
                                               canvas.height/2 - gameOverBitmap.height,
                                               gameOverBitmap.width*2, gameOverBitmap.height*2);    
                
                bgMusic.volume = 0.4;
            }
        }
    });

    // Update difficulty
    if (score % 10 === 0 && score !== 0) {
        var newLevel = Math.floor(score / 10) + 1;
        if (newLevel > level) {
            level = newLevel;
            gap = 200 - (level * 16); 
            if ( gap < 64 )
                gap = 64;
            
            sfxNewLevel.volume = 0.3;
            sfxNewLevel.play();

            drawNewLevelText = true;
            drawNewLevelframeCount = frameCount + 100;
            
        }
    }
} 

///////////////////////////////////////////////////////////////////////////////

function loop() {
    draw();
    if (gameRunning) {
        update();
    }
    frameCount++;
    if (gameRunning) {
        requestAnimationFrame(loop);
    }
} 

///////////////////////////////////////////////////////////////////////////////

function resetGame() {
    bird.y = 200;
    bird.vy = 0;
    score = 0;
    pipes = [];
    gap = 200;
    frameCount = 0;
    drawNewLevelText = false;
    gravity = 0.1;
    level = 1;
} 

///////////////////////////////////////////////////////////////////////////////

function startGame() {
    if (!gameInitialized) {
        resetGame();
        gameRunning = true;
        gameInitialized = true;
        bgMusic.volume = 0.7;
        bgMusic.currentTime = 0;
        bgMusic.play(); 
        loop();
    }
} 

///////////////////////////////////////////////////////////////////////////////

window.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {

        bird.vy = -3 - level*(0.25);  

        sfxFlap.currentTime = 0;
        sfxFlap.play();
        bird.frame = 0;
        bird.frameCounter = 0;
        bird.animState = 1;

    }
});

document.getElementById("startButton").addEventListener('click', startGame);
