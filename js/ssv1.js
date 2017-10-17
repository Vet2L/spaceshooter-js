//REQUEST ANIMATION FRAME -> for all browsers
window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000/60);
    };
})();

function getMousePos(canvas, evt) {
    //get canvas position
    var obj = canvas;
    var top = 0;
    var left = 0;
    while(obj.tagName != 'BODY') {
        top += obj.offsetTop;
        left += obj.offsetLeft;
        obj = obj.offsetParent;
    }
    // return relative mouse position
    var mouseX = evt.clientX - left + window.pageXOffset;
    var mouseX = evt.clientY - top + window.pageYOffset;
    return {
        x: mouseX,
        y: mouseY
    };
}

/* Base class for game objects
 * 
 */
function SSObject(x1, y1){
    this._SSPosition = (typeof(x1)=='number'&&typeof(y1)=='number') ? {x: x1, y: y1} : {x: 0, y: 0};
    this._SSColor = '#000000';
}

SSObject.prototype.position = function(){
    return this._SSPosition;
};

SSObject.prototype.moveTo = function(mx, my){
    this._SSPosition.x = mx;
    this._SSPosition.y = my;
};

SSObject.prototype.move = function(dx, dy){
    this._SSPosition.x += dx;
    this._SSPosition.y += dy;
};

SSObject.prototype.setColor = function(c){
    this._SSColor = c;
};

SSObject.prototype.color = function(){
    return this._SSColor;
};

SSObject.prototype.size = function(){
    return {w:1, h:1};
};

SSObject.prototype.draw = function(cc){ //Canvas context
    cc.fillStyle = this._SSColor;
    cc.fillRect(this._SSPosition.x, this._SSPosition.y, 1, 1);
};

/* Rectangle class
 * 
 */
SSRectObject.prototype = Object.create(SSObject.prototype);
function SSRectObject(x1, y1, width, height){
    SSObject.apply(this, arguments);
    this._SSwidth = width;
    this._SSheight = height;
}

SSRectObject.prototype.size = function(){
    return {w: this._SSwidth, h: this._SSheight};
};

SSRectObject.prototype.draw = function(cc){
    cc.fillStyle = this._SSColor;
    cc.fillRect(this._SSPosition.x, this._SSPosition.y, this._SSwidth, this._SSheight);
};

/* BULLETS
 * 
 */
SSBullet.prototype= Object.create(SSObject.prototype);
function SSBullet(x1, y1, dx1, dy1){
    SSObject.apply(this, arguments);
    this._SSSpeed = 7;
    this._SSColor = 'yellow';
    this._SSTime = 0;
    this._SSLifetime = 100;
    this._SSDirection = (typeof(dx1)=='number'&&typeof(dy1)=='number') ? {x: dx1, y: dy1} : {x: 0, y: 1};
}
SSBullet.prototype.update = function(){
    this._SSPosition.x += this._SSDirection.x * this._SSSpeed;
    this._SSPosition.y += this._SSDirection.y * this._SSSpeed;
    this._SSTime += 1;
};
SSBullet.prototype.isLegit = function(){
    return this._SSTime < this._SSLifetime;
};
SSBullet.prototype.draw = function(cc){
    cc.fillStyle = this._SSColor;
    cc.fillRect(this._SSPosition.x - 1, this._SSPosition.y, 3, 4);
};

/* Bullet manager
 * 
 */
function SSBulletManager(){
    this._bullets = [];
    this._bulletColor = false;
}

SSBulletManager.prototype.addBullet = function(x1, y1, dx1, dy1){
    var nbul = new SSBullet(x1, y1, dx1, dy1);
    if (this._bulletColor){
        nbul.setColor(this._bulletColor);
    }
    //add to array
    this._bullets.push(nbul);
};

SSBulletManager.prototype.setColor = function(c){
    this._bulletColor = c;
};

SSBulletManager.prototype.checkHit = function(ssobj){
    var i = 0;
    var bn = this._bullets.length;
    var hit = false;
    var objPos = ssobj.position();
    var objSize = ssobj.size();
    var cbul, iy, ix;
    for (i = 0; i < bn; i+=1){
        cbul = this._bullets.shift();
        iy = cbul.position().y - objPos.y;
        if ((iy > 0)&&(iy < objSize.h)){
            ix = cbul.position().x - objPos.x;
            if ((ix > 0)&&(ix < objSize.w)){
                hit = true;
            }
        }
        if (hit){
            hit = false;
            if (ssobj.onHit(1, cbul.position())){
                continue;
            }
        }
        this._bullets.push(cbul);
    }
};

SSBulletManager.prototype.updateBullets = function(){
    var i = 0;
    var bn = this._bullets.length;
    for (i = 0; i < bn; i+=1){
        var cbul = this._bullets.shift();
        cbul.update();
        if (cbul.isLegit()){
            this._bullets.push(cbul);
        }
    }
};

SSBulletManager.prototype.drawBullets = function(cc){
    var i = 0;
    var bn = this._bullets.length;
    for (i = 0; i < bn; i+=1){
        this._bullets[i].draw(cc);
    }
};

/* Ship class
 * 
 */
SSShip.prototype = Object.create(SSRectObject.prototype);
function SSShip(x1, y1, width, height, gunx, guny, speed){
    SSRectObject.apply(this, arguments);
    this._SSSpeed = (typeof(speed)=='number') ? speed : 10;
    this._SSGunPosition = (typeof(gunx)=='number'&&typeof(guny)=='number') ? {x:gunx, y:guny} : {x:x1+(width/2), y: y1};
    this._SSColor = 'red';
    this._SSShipHealth = 3;
}

SSShip.prototype.moveLeft = function(){
    this.move(-(this._SSSpeed), 0);
    this._SSGunPosition.x -= this._SSSpeed;
};
SSShip.prototype.moveRight = function(){
    this.move((this._SSSpeed), 0);
    this._SSGunPosition.x += this._SSSpeed;
};
SSShip.prototype.moveUp = function(){
    this.move(0, -(this._SSSpeed/2));
    this._SSGunPosition.y -= this._SSSpeed/2;
};
SSShip.prototype.moveDown = function(){
    this.move(0, (this._SSSpeed/2));
    this._SSGunPosition.y += this._SSSpeed/2;
};
SSShip.prototype.shoot = function(bulman){ //BulletManager
    bulman.addBullet(this._SSGunPosition.x, this._SSGunPosition.y, 0, -1);
};
SSShip.prototype.draw = function(cc){
    var x,y,w,h;
    x = this._SSPosition.x;
    y = this._SSPosition.y;
    w = this._SSwidth;
    h = this._SSheight;
    cc.fillStyle = this._SSColor;
    cc.beginPath();
    cc.moveTo(x+(w/2)-1.5, y); //1
    cc.lineTo(x+(w/2)+1.5, y); //2
    cc.lineTo(x+w, y+h); //3
    cc.lineTo(x, y+h); //4
    cc.fill();
    //draw health
    cc.strokeStyle = '#00FF00';
    cc.beginPath();
    cc.arc(x+w/2, y+0.75*h, 2*this._SSShipHealth, 0, 2 * Math.PI);
    cc.stroke();
};
SSShip.prototype.onHit = function(dmg, posAt){
    var bx, by, x, y, w, h;
    bx = posAt.x;
    by = posAt.y
    x = this._SSPosition.x;
    y = this._SSPosition.y;
    w = this._SSwidth;
    h = this._SSheight;
    //get point on ships line
    var lx = (by-y)*(-(w/2)+1.5)/h + x + (w/2)-1.5;
    //console.log(bx, by, x, y, x+w, y+h, lx, x+x+w-lx);
    if ((bx < lx)||(bx > x+x+w-lx)){
        return false;
    }
    //console.log('hit');
    if (this._SSShipHealth > 0){
        this._SSShipHealth -= dmg;
        return true;
    }
    return false;
};
SSShip.prototype.health = function(){
    return this._SSShipHealth;
};

//SSShip.prototype

SSEnemyShip.prototype = Object.create(SSShip.prototype);
function SSEnemyShip(x1, y1, width, height, gunx, guny, speed){
    SSShip.apply(this, arguments);
    this._SSGunPosition = (typeof(gunx)=='number'&&typeof(guny)=='number') ? {x:gunx, y:guny} : {x:x1+(width/2), y: y1+height};
    this._SSColor = 'green';
    this._SSShipHealth = 3;
    this._SSShipDirection = {dx:1, dy:0};
}
SSEnemyShip.prototype.shoot = function(bulman){
    bulman.addBullet(this._SSGunPosition.x, this._SSGunPosition.y, 0, 1);
};
SSEnemyShip.prototype.direction = function(){
    return this._SSShipDirection;
};
SSEnemyShip.prototype.swipeDirection = function(){
    this._SSShipDirection.dx *= -1;
    this._SSShipDirection.dy *= -1;
};
SSEnemyShip.prototype.shoot = function(bulman){
    bulman.addBullet(this._SSGunPosition.x, this._SSGunPosition.y, 0, 1);
};
SSEnemyShip.prototype.draw = function(cc){
    var x,y,w,h;
    x = this._SSPosition.x;
    y = this._SSPosition.y;
    w = this._SSwidth;
    h = this._SSheight;
    var sw = w/5;
    var sh = h/3;
    cc.fillStyle = this._SSColor;
    cc.beginPath();
    cc.moveTo(x+sw,y); //1
    cc.lineTo(x+4*sw, y); //2
    cc.lineTo(x+w, y+sh); //3
    cc.lineTo(x+w, y+2*sh); //4
    cc.lineTo(x+4*sw, y+h); //5
    cc.lineTo(x+3*sw, y+h); //6
    cc.lineTo(x+3*sw, y+2*sh); //7
    cc.lineTo(x+2*sw, y+2*sh); //8
    cc.lineTo(x+2*sw, y+h); //9
    cc.lineTo(x+sw, y+h); //10
    cc.lineTo(x, y+2*sh); //11
    cc.lineTo(x, y+sh); //12
    cc.fill();
    //draw health as circles on ship
    cc.fillStyle = 'blue';
    if (this._SSShipHealth>2){
        cc.beginPath();
        cc.arc(x+sw, y+h/2, 3, 0, 2 * Math.PI);
        cc.fill();
    }
    if (this._SSShipHealth>1){
        cc.beginPath();
        cc.arc(x+w-sw, y+h/2, 3, 0, 2 * Math.PI);
        cc.fill();
    }
    if (this._SSShipHealth>0){
        cc.beginPath();
        cc.arc(x+w/2, y+h/2, 3, 0, 2 * Math.PI);
        cc.fill();
    }
};
SSEnemyShip.prototype.onHit = function(dmg, posAt){
    var bx, by, x, y, w, h;
    bx = posAt.x;
    by = posAt.y
    x = this._SSPosition.x;
    y = this._SSPosition.y;
    w = this._SSwidth;
    h = this._SSheight;
    //there are 3 different area for calculation
    var sw,sh;
    sw = w/5;
    sh  = h/3;
    //1 - top
    if (by<y+sh){
        var lx = (-by+y+sh)*sw/sh + x;
        if ((bx<lx)||(bx>x+x+w-lx)){return false;}
        //console.log('top');
    }
    //2 - mid
    else if (by<y+2*sh){
        if ((bx-x<0)||(bx-x>w)){return false;}
        //console.log('mid');
    }
    //3 - bot
    else {
        var lx = (by-y-2*sh)*sw/sh + x;
        if ((bx<lx)||(bx>x+x+w-lx)){return false;}
        lx = bx-x;
        if ((lx>2*sw)&&(lx<3*sw)){return false;}
        //console.log('bot');
    }
    //hit
    if (this._SSShipHealth > 0){
        this._SSShipHealth -= dmg;
        return true;
    }
    return false;
};

/*
 * 
 */
function SSEnemyManager(){
    this._maxEnemyPerLine = 7;
    this._enemiesL = [[],[],[],[]];
    this._bulMan = new SSBulletManager();
    this._bulMan.setColor('orange');
    this._enemiesCount = 0;
}

SSEnemyManager.prototype.bulletManager = function(){ return this._bulMan;};

SSEnemyManager.prototype.addEnemy = function(){
    var ei = this._enemiesL[0].length;
    this._enemiesCount += 1;
    if (ei < this._maxEnemyPerLine){
        this._enemiesL[0].push(new SSEnemyShip(30+100*ei, 30, 50, 30, null, null, 4));
        return true;
    }
    ei = this._enemiesL[1].length;
    if (ei < this._maxEnemyPerLine){
        this._enemiesL[1].push(new SSEnemyShip(50+100*ei, 90, 50, 30, null, null, 2));
        return true;
    }
    ei = this._enemiesL[2].length;
    if (ei < this._maxEnemyPerLine){
        this._enemiesL[2].push(new SSEnemyShip(70+100*ei, 150, 50, 30, null, null, 1));
        return true;
    }
    ei = this._enemiesL[3].length;
    if (ei < this._maxEnemyPerLine){
        this._enemiesL[3].push(new SSEnemyShip(90+100*ei, 210, 50, 30, null, null, 3));
        return true;
    }
    this._enemiesCount -= 1;
    return false;
};

SSEnemyManager.prototype.enemyCount = function(){return this._enemiesCount;};

SSEnemyManager.prototype.updateEnemies = function(screenWidth, screenHeight){
    var l=0;
    for (l=0;l<4;l+=1){
        var i=0;
        var toShoot = 0;
        var enlen = this._enemiesL[l].length;
        var curen, curenPos, curenSize, curenDir;
        var lineChangeDir = false;
        for (i=0; i<enlen; i+=1){
            curen = this._enemiesL[l].shift();
            curenPos = curen.position();
            curenSize = curen.size();
            curenDir = curen.direction();
            //random or not moves
            if (curenDir.dx>0){
                curen.moveRight();
            }
            if (curenDir.dx<0){
                curen.moveLeft();
            }
            if ((curenPos.x < -20)||(curenPos.x + curenSize.w > screenWidth+20)){
                lineChangeDir = true;
            }
            //on death
            this._enemiesCount -= 1;
            if (curen.health() > 0){
                this._enemiesL[l].push(curen);
                this._enemiesCount += 1;
            }
            //random shooting
            toShoot = Math.floor((Math.random()*(10*this._enemiesCount))+1)
            if (toShoot == 1){
                curen.shoot(this._bulMan);
            }
        }
        if (lineChangeDir){
            lineChangeDir = false;
            enlen = this._enemiesL[l].length;
            for (i=0; i<enlen; i+=1){
                this._enemiesL[l][i].swipeDirection();
            }
        }
    }
};

SSEnemyManager.prototype.drawEnemies = function(cc){
    var l=0;
    for (l=0;l<4;l+=1){
        var i=0;
        var enlen = this._enemiesL[l].length;
        for (i=0; i<enlen; i+=1){
            this._enemiesL[l][i].draw(cc);
        }
    };
};

SSEnemyManager.prototype.checkHits = function(bulman){
    var l=0;
    for (l=0;l<4;l+=1){
        var i, enlen;
        enlen = this._enemiesL[l].length;
        for (i=0; i<enlen; i+=1){
            bulman.checkHit(this._enemiesL[l][i]);
        }
    }
};

var gameSSCanvas = document.getElementById('MainCanvasId');


var playerShip = new SSShip(385, 550, 30, 40, null, null, 8);
var playerGameOver = false;
var playerWin = false;
var enemyManager = new SSEnemyManager();
var ei;
for (ei=0; ei<4*7; ei+=1){
    enemyManager.addEnemy();
}
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
    }
    if (delayCount > 0){
        delayCount -= 1;
    }
    
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
    if (enemyManager.enemyCount()==0)
    {
        playerWin = true;
    }
}

function gameSSAnimate(canvas, lastTime, keysState){
    var context = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;
    
    //update
    var date = new Date();
    var time = date.getTime();
    var timeDiff = time - lastTime;
    if (!(playerGameOver||playerWin)){
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
    if (!(playerGameOver||playerWin)){
        playerShip.draw(context);
    } else {
        context.font='72px monospace';
        context.textAlign = 'center';
        context.fillStyle = 'white';
        if (playerGameOver) {
            context.fillText('GAME OVER', width/2, height/2);
        }
        else if (playerWin) {
            context.fillText('YOU WIN', width/2, height/2);
            playerShip.draw(context);
        }
    }
    
    bulletManager.drawBullets(context);
    enemyManager.drawEnemies(context);
    enemyManager.bulletManager().drawBullets(context);
    
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
    k_space: false
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
        default:
    }
}

this.addEventListener('keydown', onKeyDown);

this.addEventListener('keyup', onKeyUp);

gameSSAnimate(gameSSCanvas, time, kStates);
