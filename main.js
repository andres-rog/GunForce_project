let canJump = true;
let playerProjectiles = [];
let playerProjectileTick=0;
let longIdleTick=frames;

let nonSolidObjects = [];
let solidObjects = [];

//Location of the player on the last frame
let oldPlayerX = 0;
let oldPlayerY = 0;

const player = new Player(
  401, 100,
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
        player.speedY = -5.5;
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
  enemiesArray.forEach((enemy, index, object) => {
    if(enemy.dead) {
      object.splice(index,1);
    }
    else{ 
      enemy.draw();
    }
  });


  if(requestID && !player.gameOver){
     requestID =  requestAnimationFrame(update);
  }
  else {
    console.log("gameover");
  }
}

function start(){
  //Set conditions
  player.hp=100;
  player.gameOver=false;
  //Create enemies
  createEnemyType1(550,405,120,120,7,180,0.7,300);

  //Create map
  createSolidObject("platform1",200,650,200,200);
  createSolidObject("platform1",600,520,200,200);
  createSolidObject("platform1",1000,570,200,80);
  createSolidObject("platform1",1300,450,200,80);
  createSolidObject("platform1",0,890,2000,100);



  requestID = requestAnimationFrame(update);
}

function invokePlayerBullet(bulletType) {
  let bulletSpeed=7;
  if(player.lookingDirection==="left") bulletSpeed *= -1;
  playerProjectiles.push(new PlayerProjectile(player.positionX,player.positionY,60,60,bulletSpeed,0,player.lookingDirection,bulletType,solidObjects,"Game Assets/Images/Sprites/PlayerBullet/spritesheet.png"));
}

function createSolidObject(type, positionX, positionY, width, length) {
  solidObjects.push(new solidObject(positionX,positionY,width,length,type,"Game Assets/Images/Sprites/Enviroment/environmentSpritesheet.png"));
  player.solidObjects = solidObjects;
}

function createEnemyType1(posX, posY, width, height, hp, patrolDistanceTarget, speedX, sightLength) {
  enemiesArray.push(new SoldierEnemy(posX,posY,width,height,hp,player,patrolDistanceTarget,sightLength, speedX,
                      "Game Assets/Images/Sprites/Range Enemy 1/Alert/spritesheet.png",
                      "Game Assets/Images/Sprites/Range Enemy 1/Dying/spritesheet.png",
                      "Game Assets/Images/Sprites/Range Enemy 1/Idle/spritesheet.png",
                      "Game Assets/Images/Sprites/Range Enemy 1/Walking/spritesheet.png",
                      "Game Assets/Images/Sprites/Range Enemy 1/Shooting/spritesheet.png"));
}

start();