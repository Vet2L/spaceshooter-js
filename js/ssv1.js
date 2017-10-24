var gameSSCanvas = document.getElementById('MainCanvasId');

var playerShip = new SSShip(385, 550, 30, 40, null, null, 8);
var playerGameOver = false;
var playerWin = false;
var playerScore = 0;

var playerPause = false; //if player clicked 'p'
var pState = false; //spesial state of 'p' key

var playerLvl = 1; //number of game loop
var sceneSpawnDelay = 0;
var sceneSpawnDelayMax = 30;

var enemyManager = new SSEnemyManager();
var ei;

/*
for (ei=0; ei<4*7; ei+=1){
    enemyManager.addEnemy();
}
//*/
var enemyLastCount = 28;
playerWin = true;
//enemyManager.addEnemy(new SSShip(30, 30, 50, 30, null, null, 10));
//enemyManager.addEnemy(new SSShip(100, 30, 50, 30, null, null, 10));
//enemyManager.addEnemy(new SSShip(170, 30, 50, 30, null, null, 10));
//var someShip = new SSShip(300, 100, 50, 30, null, null, 10);
var bulletManager = new SSBulletManager();
var playerDelay = 30;
var delayCount = 0;

var date = new Date();
var time = date.getTime();

function gameSSUpdate(canvas, timeDiff, keysState){
    var context = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;
    
    var playerPos = playerShip.position();
    var playerSize = playerShip.size();
    
    var enemyCurCount = enemyManager.enemyCount();
    
    //on keys
    if (keysState.k_left) {
        if (playerPos.x > 3) {
            playerShip.moveLeft();
        }
    }
    if (keysState.k_right) {
        if (playerPos.x+playerSize.w < width-3){
            playerShip.moveRight();
        }
    }
    if (keysState.k_up) {
        if (playerPos.y > 2*height/3){
            playerShip.moveUp();
        }
    }
    if (keysState.k_down) {
        if (playerPos.y+playerSize.h < height-10){
            playerShip.moveDown();
        }
    }
    if (keysState.k_space) {
        if (delayCount == 0){
            playerShip.shoot(bulletManager);
            delayCount = playerDelay;
        }
        //for fast test usage only
        //playerShip.shoot(bulletManager);
    }
    if (delayCount > 0){
        delayCount -= 1;
    }
    
    if (playerWin){
        delayCount += 1;
        if (sceneSpawnDelay > 0){
            sceneSpawnDelay -= 1;
        }
        else{
            if (enemyManager.addEnemy()){
                sceneSpawnDelayMax -= 3;
                sceneSpawnDelay = sceneSpawnDelayMax;
            }else{
                sceneSpawnDelayMax = 30;
                playerWin = false;
            }
        }
    } else {
        //update objects
        bulletManager.updateBullets();
        //bulletManager.checkHit(someShip);
        enemyManager.updateEnemies(width, height);
        enemyManager.checkHits(bulletManager);
        enemyManager.bulletManager().updateBullets();
        enemyManager.bulletManager().checkHit(playerShip);
        if (playerShip.health()==0){
            playerGameOver = true;
        }
        playerScore += (enemyLastCount - enemyCurCount)*10;
        if (enemyCurCount==0){
            playerWin = true; //Generate new Enemies
            bulletManager.removeAll();
            enemyManager.bulletManager().removeAll();
            playerLvl += 1;
            playerScore += 100;
        }
    }
    
    enemyLastCount = enemyCurCount;
}

function gameSSAnimate(canvas, lastTime, keysState){
    var context = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;
    
    //Check pause
    if (keysState.k_p&&(!pState)){
        pState = true;
    }
    if ((!keysState.k_p)&&pState){
        pState = false;
        playerPause = !playerPause;
    }
    //update
    var date = new Date();
    var time = date.getTime();
    var timeDiff = time - lastTime;
    if (!(playerGameOver||playerPause)){
        gameSSUpdate(canvas, timeDiff, keysState);
    }
    lastTime = time;
    
    //clear canvas
    //context.clearRect(0, 0, width, height);
    context.fillStyle = '#102030';
    context.fillRect(0, 0, width, height);
    
    
    //draw background
    context.strokeStyle = '#000000';
    context.lineWidth = 3.0;
    context.strokeRect(1.5, 1.5, width - 3, height - 3);
    context.lineWidth = 1.0;
    
    //draw main
    bulletManager.drawBullets(context);
    enemyManager.drawEnemies(context);
    enemyManager.bulletManager().drawBullets(context);
    
    if (!(playerGameOver||playerWin)){
        playerShip.draw(context);
        //draw score at top of screen
        context.font='72px monospace';
        context.textAlign = 'center';
        context.strokeStyle = 'grey';
        context.strokeText(playerScore, width/2, height/2);
    } else {
        context.font='72px monospace';
        context.textAlign = 'center';
        if (playerGameOver) {
            context.fillStyle = 'red';
            context.fillText('GAME OVER', width/2, height/2 - 74);
            context.font='64px monospace';
            context.fillStyle = 'white';
            context.fillText('Score: '+playerScore, width/2, height/2);
        }
        else if (playerWin) {
            context.fillStyle = 'white';
            context.fillText('Level '+playerLvl, width/2, height/2);
            playerShip.draw(context);
        }
    }
    
    //request new frame
    requestAnimFrame(function() {
        gameSSAnimate(canvas, lastTime, keysState);
    });
}

var kStates = {
    k_up: false,
    k_down: false,
    k_left: false,
    k_right: false,
    k_space: false,
    k_p: false
};

tF = document.getElementById('pText');
function onKeyDown(ev){
    switch (ev.keyCode){
        case 37: //LEFT ARROW
            kStates.k_left = true;
            break;
        case 38: //UP ARROW
            kStates.k_up = true;
            break;
        case 39: //RIGHT ARROW
            kStates.k_right = true;
            break;
        case 40: //DOWN ARROW
            kStates.k_down = true;
            break;
        case 32: //SPAAAACEbar
            kStates.k_space = true;
            break;
        case 80: //P
            kStates.k_p = true;
            break;
        default:
    }
}

function onKeyUp(ev){
    switch (ev.keyCode){
        case 37: //LEFT ARROW
            kStates.k_left = false;
            break;
        case 38: //UP ARROW
            kStates.k_up = false;
            break;
        case 39: //RIGHT ARROW
            kStates.k_right = false;
            break;
        case 40: //DOWN ARROW
            kStates.k_down = false;
            break;
        case 32: //SPAAAACEbar
            kStates.k_space = false;
            break;
        case 80: //P
            kStates.k_p = false;
            break;
        default:
    }
}

this.addEventListener('keydown', onKeyDown);

this.addEventListener('keyup', onKeyUp);

gameSSAnimate(gameSSCanvas, time, kStates);
