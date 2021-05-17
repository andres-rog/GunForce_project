//Controls conditions
let canJump;
let playerProjectileTick;
let longIdleTick;

//Location of the player on the last frame
let oldPlayerX = 0;
let oldPlayerY = 0;

//UI
const healthbar = new Image();
healthbar.src = "Game Assets/Images/Sprites/Ui Sprites/HealthBar.png";


const player = new Player(
  401, 100,
  120, 120,
  100, 100,
  "Game Assets/Images/Sprites/Player Character/Dying/spritesheet.png",
  "Game Assets/Images/Sprites/Player Character/IdleGun/spritesheet.png",
  "Game Assets/Images/Sprites/Player Character/IdleLong/spritesheet.png",
  "Game Assets/Images/Sprites/Player Character/JumpingGun/spritesheet.png",
  "Game Assets/Images/Sprites/Player Character/StopGun/spritesheet.png",
  "Game Assets/Images/Sprites/Player Character/WalkingGun/spritesheet.png",
  "Game Assets/Images/Sprites/Player Character/ShootGun/spritesheet.png"
);

function update(){
  //New frame
  frames ++;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.beginPath();
  ctx.rect(0,0,canvas.width,canvas.height);
  ctx.stroke();

  if(player.hp>0) {
    //Left listener
    if(controller.left){
      if(player.action!="shootGun") {
        player.switchAction("walk");
      }
      if(player.jumping) player.speedX-=0.3;
      else player.speedX-=0.5;

      //Reset idle timer
      longIdleTick = frames;
    } 

    //Right listener
    if (controller.right){
      if(player.speedX<0.4 && player.action!="shootGun") {
        player.switchAction("walk");
      }
      if(player.jumping) player.speedX+=0.3;
      else player.speedX+=0.5;

      //Reset idle timer
      longIdleTick = frames;
    }

    //Jump Listener
    if (controller.jump) {
      if(!player.jumping && canJump) {
        player.speedY = -7;
        player.gravitySpeed=0;
        canJump = false;

        //Reset idle timer
        longIdleTick = frames;
      }
    }
    if(controller.jumpReleased && !player.jumping) canJump=true;

    //Fire listener
    if (controller.fire){
      //Player stops then shoots
      player.speedX =0;
      //Can only shoot after 60 frames or after pressing fire again
      if(frames-playerProjectileTick > 60 || controller.fireReleased) {
        player.switchAction("shoot");
        invokePlayerBullet("gun");

        //Set the next frame that the player will be able to shoot again
        playerProjectileTick=frames;
        
        //Reset idle timer
        longIdleTick = frames;
      }
    }
    if(controller.fireReleased) playerProjectileTick=20; //if the player releases the fire button, can shoot again in less time

    //Change player action to idleLong after 600 frames of inactivity
    if(frames-longIdleTick>600) {
      if(player.action!="idleLong") player.switchAction("idleLong");
    }    
  }

  //Draw interactable objects and find collitions
  solidObjects.forEach(object => {
    object.draw();
  });

  //Draw player
  player.draw();

  //Draw player health
  ctx.fillStyle = 'red';
  ctx.fillRect(62, 15, 171 * player.hp/player.maxHp, 51);
  ctx.drawImage(healthbar,0,0,300,80);
  ctx.fillStyle = 'black';
  ctx.textAlign = "center";
  ctx.font = "35px Arial";
  ctx.fillText(player.hp, 262, 52);

  //Update last frame playerPositions
  player.oldPositionX = player.positionX;
  player.oldPositionY = player.positionY;

  //Draw enemy projectiles
  enemyProjectiles.forEach((bullet, index, object) => {
    if(bullet.destroy) {
      object.splice(index,1);
    }
    else if (bullet.positionX < 0 || bullet.positionX > canvas.width) {
      object.splice(index,1);
    }
    else {
      bullet.fly();
    }
  });

  //Draw player projectiles
  playerProjectiles.forEach((bullet, index, object) => {
    if(bullet.destroy) {
      object.splice(index,1);
    }
    else if (bullet.positionX < 0 || bullet.positionX > canvas.width) {
      object.splice(index,1);
    }
    else {
      bullet.fly();
    }
  });

  //Draw enemies
  enemiesArray.forEach((enemy, index, object) => {
    if(enemy.dead) {
      object.splice(index,1);
    }
    else{ 
      enemy.draw();
    }
  });

  if(requestID && !player.gameOver){
     requestID = requestAnimationFrame(update);
  }
  else {
    console.log("gameover");
  }
}

function start(){
  asd();
  requestID = requestAnimationFrame(update);
}

function invokePlayerBullet(bulletType) {
  let bulletSpeed=7;
  if(player.lookingDirection==="left") bulletSpeed *= -1;
  playerProjectiles.push(new PlayerProjectile(player.positionX,player.positionY,60,60,bulletSpeed,0,player.lookingDirection,bulletType,"Game Assets/Images/Sprites/PlayerBullet/spritesheet.png"));
}

function createSolidObject(type, positionX, positionY, width, length) {
  solidObjects.push(new solidObject(positionX,positionY,width,length,type,"Game Assets/Images/Sprites/Enviroment/environmentSpritesheet.png"));
}

function createEnemyType1(posX, posY, width, height, hp, patrolDistanceTarget, speedX, sightLength) {
  enemiesArray.push(new SoldierEnemy(posX,posY,width,height,hp,player,patrolDistanceTarget,sightLength, speedX,
                      "Game Assets/Images/Sprites/Range Enemy 1/Alert/spritesheet.png",
                      "Game Assets/Images/Sprites/Range Enemy 1/Dying/spritesheet.png",
                      "Game Assets/Images/Sprites/Range Enemy 1/Idle/spritesheet.png",
                      "Game Assets/Images/Sprites/Range Enemy 1/Walking/spritesheet.png",
                      "Game Assets/Images/Sprites/Range Enemy 1/Shooting/spritesheet.png"));
}

function asd() {
  //Set variables
  canJump = true;
  playerProjectileTick = 0;
  longIdleTick = 0;

  //Clear arrays
  nonSolidObjects=[];
  nonSolidObjects=[];
  solidObjects=[];
  enemiesArray=[];
  playerProjectiles=[];
  enemyProjectiles=[];

  //Set player conditions
  player.hp=100; 
  player.gameOver=false;
  player.oldPositionX = 401;
  player.oldPositionY = 100;
  player.positionX = 401;
  player.positionY = 100;      
  player.frameIndex = 0;
  player.spriteSheetLength = 0;
  player.currentTick = 0;   
  player.jumping = true;
  player.action = "jumpingGun";
  player.gravitySpeed = 0;

  //Create enemies
  createEnemyType1(550,405,120,120,7,180,0.7,300);

  //Create map
  createSolidObject("platform2",200,650,200,60);
  createSolidObject("platform1_1",600,520,200,70);
  createSolidObject("platform1_2",600,600,200,91);
  createSolidObject("platform1_3",600,700,200,42);

  createSolidObject("waterPlatform1_1",1200,520,200,70);
  createSolidObject("waterPlatform1_2",1200,600,200,91);
  createSolidObject("waterPlatform1_3",1200,700,200,42);

  createSolidObject("wall",650,200,81,90);

  createSolidObject("flippedSpikes",1000,650,93,63);

  createSolidObject("platform1_1",0,890,2000,100);
}
start();

//Secret debug controls
addEventListener("keyup", (e) => {
  if(e.key==="g" && player.gameOver) {
    asd();
    update();
  }
});