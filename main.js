let canJump = true;
let playerProjectiles = [];
let playerProjectileTick=0;
let longIdleTick=frames;

let nonSolidObjects = [];
let solidObjects = [];
let enemyType1Array = [];

//Location of the player on the last frame
let oldPlayerX = 0;
let oldPlayerY = 0;

const player = new Player(
  100, 100,
  120, 120,
  100, 100,
  solidObjects,
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
  if(controller.jumpReleased) canJump=true;

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

  //Draw interactable objects and find collitions
  solidObjects.forEach(object => {
    object.draw();
  });

  //Draw player
  player.draw();

  //Update last frame playerPositions
  player.oldPositionX = player.positionX;
  player.oldPositionY = player.positionY;

  //Draw enemy projectiles
  enemyProjectiles.forEach((bullet, index, object) => {
    if(bullet.destroy) {
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
    else {
      bullet.fly();
    }
  });

  //Draw enemies
  enemyType1Array.forEach(enemy => {
    enemy.draw();
  });


  if(requestID){
     requestID =  requestAnimationFrame(update)
  }
}

function start(){

  //Create map
  createSolidObject("platform1",300,700,200,80);
  createSolidObject("platform1",0,890,1000,100);

  //Create enemies
  createEnemyType1(500,600,120,120,200,0.7,300);

  requestID = requestAnimationFrame(update);
}

function invokePlayerBullet(bulletType) {
  let bulletSpeed=7;
  if(player.lookingDirection==="left") bulletSpeed *= -1;
  playerProjectiles.push(new PlayerProjectile(player.positionX,player.positionY,60,60,bulletSpeed,0,player.lookingDirection,bulletType,solidObjects,"Game Assets/Images/Sprites/PlayerBullet/spritesheet.png", "Game Assets/Images/Sprites/EnemyBullet/spritesheet.png"));
}

function createSolidObject(type, positionX, positionY, width, length) {
  solidObjects.push(new solidObject(positionX,positionY,width,length,type,"game assets/Images/Sprites/Enviroment/environmentSpritesheet.png"));
  player.solidObjects = solidObjects;
}

function createEnemyType1(posX, posY, width, height, patrolDistanceTarget, speedX, sightLength) {
  enemyType1Array.push(new SoldierEnemy(posX,posY,width,height,player,patrolDistanceTarget,sightLength, speedX,
                      "game assets/Images/Sprites/Range Enemy 1/Alert/spritesheet.png",
                      "game assets/Images/Sprites/Range Enemy 1/Dying/spritesheet.png",
                      "game assets/Images/Sprites/Range Enemy 1/Idle/spritesheet.png",
                      "game assets/Images/Sprites/Range Enemy 1/Walking/spritesheet.png",
                      "game assets/Images/Sprites/Range Enemy 1/Shooting/spritesheet.png"));
}

start();