//Images to load
let images = [
  "Game Assets/Images/Sprites/Player Character/Dying/spritesheet.png",
  "Game Assets/Images/Sprites/Player Character/IdleGun/spritesheet.png",
  "Game Assets/Images/Sprites/Player Character/IdleLong/spritesheet.png",
  "Game Assets/Images/Sprites/Player Character/JumpingGun/spritesheet.png",
  "Game Assets/Images/Sprites/Player Character/StopGun/spritesheet.png",
  "Game Assets/Images/Sprites/Player Character/WalkingGun/spritesheet.png",
  "Game Assets/Images/Sprites/Player Character/ShootGun/spritesheet.png",
  "Game Assets/Images/Sprites/Player Character/ReloadGun/spritesheet.png",
  "Game Assets/Images/Sprites/Ui Sprites/keySpritesheet.png",
  "Game Assets/Images/Sprites/Ui Sprites/HealthBar.png",
  "Game Assets/Images/Sprites/Ui Sprites/ammoSpritesheet.png",
  "Game Assets/Images/Sprites/Ui Sprites/AmmoIcon.png",
  "Game Assets/Images/Sprites/Ui Sprites/Volume.png",
  "Game Assets/Images/Sprites/Ui Sprites/darkOverlay.png",
  "Game Assets/Images/Sprites/Ui Sprites/StartMenu.png",
  "Game Assets/Images/Sprites/EnemyBullet/spritesheet.png",
  "Game Assets/Images/Sprites/PlayerBullet/spritesheet.png",
  "Game Assets/Images/Sprites/Enviroment/environmentSpritesheet.png",
  "Game Assets/Images/Sprites/Enviroment/sky.png",
  "Game Assets/Images/Sprites/Enviroment/clouds.png",
  "Game Assets/Images/Sprites/Range Enemy 1/Alert/spritesheet.png",
  "Game Assets/Images/Sprites/Range Enemy 1/Dying/spritesheet.png",
  "Game Assets/Images/Sprites/Range Enemy 1/Idle/spritesheet.png",
  "Game Assets/Images/Sprites/Range Enemy 1/Walking/spritesheet.png",
  "Game Assets/Images/Sprites/Range Enemy 1/Shooting/spritesheet.png",
  "Game Assets/Images/Sprites/Range Enemy 2/Alert/spritesheet.png",
  "Game Assets/Images/Sprites/Range Enemy 2/Dying/spritesheet.png",
  "Game Assets/Images/Sprites/Range Enemy 2/Idle/spritesheet.png",
  "Game Assets/Images/Sprites/Range Enemy 2/Walking/spritesheet.png",
  "Game Assets/Images/Sprites/Range Enemy 2/Shooting/spritesheet.png",
  "Game Assets/Images/Sprites/Enviroment/water.png"
]
let loadedImages={};

//Player object
const player = new Player(
  401, 100,
  120, 120,
  100, 100,
);

//Game toggles
let mute=true;
let tutorial=true;
let initialScreen = true;
let pause = false;
let win = false;

//Controls conditions
let canJump;
let playerProjectileTick;
let longIdleTick;

//Location of the player on the last frame
let oldPlayerX = 0;
let oldPlayerY = 0;

//UI
let keysSpriteSheet;
let healthbar;
let ammobar;
let ammoicon;
let volumeicon;
let darkOverlay;
let initialScreenImage;

function update(){
  //New frame
  frames ++;
  ctx.clearRect(0,0,canvas.width,canvas.height);

  //If the player is on the tutorial, draw the control keys
  if(tutorial) {
    ctx.fillStyle = 'white';
    ctx.font = "60px ArcadeClassic";
    ctx.fillText("Press 'S' to continue", 850, 200);
    //Left Key
    if(controller.left) ctx.drawImage(keysSpriteSheet,288,0,32,32,1150,450,80,80);
    else ctx.drawImage(keysSpriteSheet,256,0,32,32,1150,450,80,80);
    ctx.fillText("Move:", 1030, 510);
    //Right key
    if(controller.right) ctx.drawImage(keysSpriteSheet,352,0,32,32,1300,450,80,80);
    else ctx.drawImage(keysSpriteSheet,320,0,32,32,1300,450,80,80);
    //Fire Key
    if(controller.fire) ctx.drawImage(keysSpriteSheet,96,0,32,32,600,300,80,80);
    else ctx.drawImage(keysSpriteSheet,64,0,32,32,600,300,80,80);
    ctx.fillText("Shoot:", 470, 350);
    //Reload Key
    if(controller.reload) ctx.drawImage(keysSpriteSheet,32,0,32,32,600,400,80,80);
    else ctx.drawImage(keysSpriteSheet,0,0,32,32,600,400,80,80);
    ctx.fillText("Reload:", 455, 450);
    //Jump Key
    if(controller.jump) ctx.drawImage(keysSpriteSheet,160,0,32,32,600,500,80,80);
    else ctx.drawImage(keysSpriteSheet,128,0,32,32,600,500,80,80);
    ctx.fillText("Jump:", 490, 550);
    //Pause Key
    if(pause) ctx.drawImage(keysSpriteSheet,224,0,32,32,600,600,80,80);
    else ctx.drawImage(keysSpriteSheet,192,0,32,32,600,600,80,80);
    ctx.fillText("Pause:", 475, 650);
  }

  //Draw skybox
  sky.forEach(element => {
    element.draw();
  });

  //Draw clouds
  clouds.forEach(element => {
    element.draw();
  });

  //Draw water
  water.forEach(element => {
    element.draw();
  });

  if(player.hp>0 && !initialScreen) {
    //Left listener
    if(controller.left){
      if(player.action!="shootGun") {
        player.switchAction("walk");
      }
      if(player.jumping) player.speedX-=0.2;
      else player.speedX-=0.35;

      //Reset idle timer
      longIdleTick = frames;
    } 

    //Right listener
    if (controller.right){
      if(player.speedX<0.4 && player.action!="shootGun") {
        player.switchAction("walk");
      }
      if(player.jumping) player.speedX+=0.2;
      else player.speedX+=0.35;

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
        if(player.ammo>0) {
          player.switchAction("shoot");
          invokePlayerBullet("gun");
          lightShotSound.currentTime = 0;
          lightShotSound.play();
          player.ammo--;
        }
        else {
          player.switchAction("stopShooting")
          dryShotSound.currentTime = 0;
          dryShotSound.play();
        }

        //Set the next frame that the player will be able to shoot again
        playerProjectileTick=frames;
        //Reset idle timer
        longIdleTick = frames;
      }
    }
    if(controller.fireReleased) playerProjectileTick=20; //if the player releases the fire button, can shoot again in less time

    //Reload listener
    if (controller.reload) {
      if(player.ammo<player.maxAmmo && player.action!="gunReload" && !player.jumping) {
        player.switchAction("reload");
        reloadStart.play();
      }
    }

    //Change player action to idleLong after 600 frames of inactivity
    if(frames-longIdleTick>600) {
      if(player.action!="idleLong") player.switchAction("idleLong");
    }    
  }

  //Draw background objects

  //Draw non interactable objects
  nonSolidObjects.forEach(object => {
    object.draw();
  });

  //Draw interactable objects
  solidObjects.forEach(object => {
    object.draw();
  });

  //Draw player
  player.draw();

  //Draw player health
  ctx.fillStyle = 'red';
  ctx.fillRect(72, 25, 171 * player.hp/player.maxHp, 51);
  ctx.drawImage(healthbar,10,10,300,80);
  ctx.fillStyle = 'black';
  ctx.textAlign = "center";
  ctx.font = "36px ArcadeClassic";
  ctx.fillText(player.hp, 270, 62);

  //Draw player ammo
  ctx.drawImage(ammobar, Math.ceil(player.ammo/(player.maxAmmo/5))*192, 0,192,64,100,110,215,64);
  ctx.drawImage(ammoicon,15,112,76,60);

  //Draw volume icon
  if(mute) ctx.drawImage(volumeicon,0,0,300,512,1480,10,59,100);
  else ctx.drawImage(volumeicon,0,0,512,512,1480,10,100,100);

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

  if(requestID && !player.gameOver && !pause){
     requestID = requestAnimationFrame(update);
  }
  else {
    if(player.gameOver) {
      ctx.drawImage(darkOverlay,0,0,canvas.width,canvas.height);
      ctx.fillStyle = 'white';
      ctx.font = "100px ArcadeClassic";
      ctx.fillText("Game Over", 800, 350);
      ctx.font = "70px ArcadeClassic";
      ctx.fillText("Press 's' to continue", 800, 550);

    }
    else if(pause) {
      ctx.drawImage(darkOverlay,0,0,canvas.width,canvas.height);
      ctx.fillStyle = 'white';
      ctx.font = "150px ArcadeClassic";
      ctx.fillText("PAUSE", 800, 450);
    }
    
  }
}

function invokePlayerBullet(bulletType) {
  let bulletSpeed=7;
  let gunPosition = 30;
  if(player.lookingDirection==="left") {
    bulletSpeed *= -1;
    gunPosition *= -1;
  }
  playerProjectiles.push(new PlayerProjectile(player.positionX+gunPosition,player.positionY,60,60,bulletSpeed,0,player.lookingDirection,bulletType,loadedImages["Game Assets/Images/Sprites/PlayerBullet/spritesheet.png"]));
}

function createSolidObject(type, positionX, positionY, width, length) {
  solidObjects.push(new enviromentObject(positionX,positionY,width,length,type,loadedImages["Game Assets/Images/Sprites/Enviroment/environmentSpritesheet.png"]));
}

function createNonSolidObject(type, positionX, positionY, width, length) {
  nonSolidObjects.push(new enviromentObject(positionX,positionY,width,length,type,loadedImages["Game Assets/Images/Sprites/Enviroment/environmentSpritesheet.png"]));
}

function createSkyBoxObject(positionX, positionY, width, length){
  sky.push(new backgroundObject(positionX,positionY,width,length,"sky",loadedImages["Game Assets/Images/Sprites/Enviroment/sky.png"]));
}

function createCloudsObject(positionX, positionY, width, length){
  clouds.push(new backgroundObject(positionX,positionY,width,length,"clouds",loadedImages["Game Assets/Images/Sprites/Enviroment/clouds.png"]));
}

function createWaterObjects(positionX, positionY, width, length){
  water.push(new backgroundObject(positionX,positionY,width,length,"water",loadedImages["Game Assets/Images/Sprites/Enviroment/water.png"]));
}

function createEnemy(posX, posY, width, height, hp, ammo, type, patrolDistanceTarget, speedX, sightLength) {
  enemiesArray.push(new SoldierEnemy(posX,posY,width,height,hp,ammo,type,player,patrolDistanceTarget,sightLength, speedX,
        loadedImages[`Game Assets/Images/Sprites/${type}/Alert/spritesheet.png`],
        loadedImages[`Game Assets/Images/Sprites/${type}/Dying/spritesheet.png`],
        loadedImages[`Game Assets/Images/Sprites/${type}/Idle/spritesheet.png`],
        loadedImages[`Game Assets/Images/Sprites/${type}/Walking/spritesheet.png`],
        loadedImages[`Game Assets/Images/Sprites/${type}/Shooting/spritesheet.png`]));
}

function initialScrenSetup() {
  //Give player spritesheets
  player.dyingSpriteSheet = loadedImages["Game Assets/Images/Sprites/Player Character/Dying/spritesheet.png"],
  player.idleGunSpriteSheet = loadedImages["Game Assets/Images/Sprites/Player Character/IdleGun/spritesheet.png"],
  player.idleLongSpriteSheet = loadedImages["Game Assets/Images/Sprites/Player Character/IdleLong/spritesheet.png"],
  player.jumpingGunSpriteSheet = loadedImages["Game Assets/Images/Sprites/Player Character/JumpingGun/spritesheet.png"],
  player.stopGunSpriteSheet = loadedImages["Game Assets/Images/Sprites/Player Character/StopGun/spritesheet.png"],
  player.walkingGunSpritesheet = loadedImages["Game Assets/Images/Sprites/Player Character/WalkingGun/spritesheet.png"],
  player.shootGunSpriteSheet = loadedImages["Game Assets/Images/Sprites/Player Character/ShootGun/spritesheet.png"],
  player.reloadGunSpriteSheet = loadedImages["Game Assets/Images/Sprites/Player Character/ReloadGun/spritesheet.png"]

  //UI Images
  keysSpriteSheet = loadedImages["Game Assets/Images/Sprites/Ui Sprites/KeySpritesheet.png"];
  healthbar = loadedImages["Game Assets/Images/Sprites/Ui Sprites/HealthBar.png"];
  ammobar = loadedImages["Game Assets/Images/Sprites/Ui Sprites/ammoSpritesheet.png"];
  ammoicon = loadedImages["Game Assets/Images/Sprites/Ui Sprites/AmmoIcon.png"];
  volumeicon = loadedImages["Game Assets/Images/Sprites/Ui Sprites/Volume.png"];
  darkOverlay = loadedImages["Game Assets/Images/Sprites/Ui Sprites/darkOverlay.png"];
  initialScreenImage = loadedImages["Game Assets/Images/Sprites/Ui Sprites/StartMenu.png"];

  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(initialScreenImage,0,0,canvas.width,canvas.height);
}

function tutorialSetup() {
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
    sky=[];
    clouds=[];
  
    //Set player conditions
    player.hp=100;
    player.ammo=15;
    player.gameOver=false;
    player.oldPositionX = 401;
    player.oldPositionY = 100;
    player.positionX = 410;
    player.positionY = 100;      
    player.frameIndex = 0;
    player.spriteSheetLength = 0;
    player.currentTick = 0;   
    player.jumping = true;
    player.switchAction("jump");
    player.gravitySpeed = 0;
    player.speedY=0;

    //Map for tutorial
    //Create boundaries so player cannot exit the canvas
    createSolidObject("void",0,canvas.height-10,canvas.width,10);
    createSolidObject("void",400,0,10,canvas.height);
    createSolidObject("void",canvas.width-400,0,10,canvas.height);
    createSolidObject("void",0,0,10,canvas.width);
}


function gameSetup() {
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
  sky=[];
  clouds=[];
  water=[];

  //Set player conditions
  player.hp=100;
  player.ammo=15;
  player.gameOver=false;
  player.oldPositionX = 100;
  player.oldPositionY = 700;
  player.positionX = 100;
  player.positionY = 700;      
  player.frameIndex = 0;
  player.spriteSheetLength = 0;
  player.currentTick = 0;   
  player.jumping = true;
  player.switchAction("jump");
  player.gravitySpeed = 0;
  player.speedY=0;

  //Create map
  //Map for game
  //Create Sky box
  createSkyBoxObject(-100,0,canvas.width,canvas.height*2.5);
  createSkyBoxObject(canvas.width-100,0,canvas.width,canvas.height*2.5);
  createSkyBoxObject(canvas.width*2-100,0,canvas.width,canvas.height*2.5);
  createSkyBoxObject(canvas.width*3-100,0,canvas.width,canvas.height*2.5);

  //Create clouds
  createCloudsObject(0,192,1632,708)
  createCloudsObject(1632,192,1632,708)
  createCloudsObject(1632,192,1632,708)
  createCloudsObject(3264,192,1632,708)
  createCloudsObject(4896,192,1632,708)
  createCloudsObject(6528,192,1632,708)

  //Create map
  //--SECTION 1--
  //BorderWall
  createSolidObject("platform1_1",-100,336,200,90);
  createSolidObject("platform1_2",-100,420,200,90);
  createSolidObject("platform1_2",-100,504,200,90);
  createSolidObject("platform1_2",-100,588,200,90);
  createSolidObject("platform1_2",-100,672,200,90);
  createSolidObject("platform1_2",-100,756,200,90);
  createSolidObject("platform1_2",-100,840,200,90);

  //Ground
  createSolidObject("platform1_1",90,850,200,70);
  createSolidObject("platform1_1",270,850,200,70);
  createSolidObject("platform1_1",460,850,200,70);

  //Water
  createWaterObjects(660,850,200,70);

  //Platforms
  createSolidObject("platform2",200,650,150,45);
  createSolidObject("platform2",550,500,150,45);
  createSolidObject("platform2",1300,500,150,45);

  //Trap
  createSolidObject("spikes",650,463,50,40);
  createSolidObject("spikes",1049,820,120,90);
  createSolidObject("spikes",1168,820,120,90);
  createSolidObject("spikes",1287,820,120,90);
  createSolidObject("spikes",1406,820,120,90);
  createSolidObject("spikes",1525,820,120,90);

  //Hill
  createSolidObject("platform1_2",850,820,200,90);
  createSolidObject("platform1_2",850,736,200,90);
  createSolidObject("platform1_2",850,652,200,90);
  createSolidObject("platform1_1",850,582,200,70);


  //Enemies
  //createEnemy(550,405,120,120,7,1,"Range Enemy 2",180,0.7,500);
  createEnemy(170,535,120,120,7,3,"Range Enemy 1",110,0.7,300);

  //--SECTION 2--
  //Hill
  createSolidObject("platform1_2",1644,870,200,90);
  createSolidObject("platform1_2",1644,786,200,90);
  createSolidObject("platform1_2",1644,702,200,90);
  createSolidObject("platform1_1",1644,632,200,70);

  //Ground
  createSolidObject("platform1_1",1834,830,200,70);
  createSolidObject("platform1_1",2024,830,200,70);
  createSolidObject("platform1_1",2214,830,200,70);
  createSolidObject("platform1_1",2404,830,200,70);

  //Enemies
  /*createEnemy(1600,520,120,120,4,1,"Range Enemy 2",160,0.7,500);
  createEnemy(2320,715,120,120,4,1,"Range Enemy 2",200,0.7,500);
  createEnemy(2200,715,120,120,4,3,"Range Enemy 2",200,0.7,300);
  createEnemy(2000,715,120,120,7,3,"Range Enemy 1",200,0.7,300);*/

  //--SECTION 3--
  //water
  createWaterObjects(2594,850,300,105);
  createWaterObjects(2893,850,300,105);
  createWaterObjects(3192,850,300,105);
  createWaterObjects(3491,850,300,105);

  //water platforms
  createSolidObject("waterPlatform1_3",2800,810,200,70);
  createSolidObject("waterPlatform1_2",2800,740,200,70);
  createSolidObject("waterPlatform1_1",2800,670,200,70);

  createSolidObject("waterPlatform1_3",3200,800,200,70);
  createSolidObject("waterPlatform1_2",3200,730,200,70);
  createSolidObject("waterPlatform1_2",3200,660,200,70);
  createSolidObject("waterPlatform1_2",3200,590,200,70);
  createSolidObject("waterPlatform1_1",3200,520,200,70);

  //platforms
  //createSolidObject("platform2",200,650,150,45);
  //createSolidObject("platform2",550,500,150,45);
  //createSolidObject("platform2",1300,500,150,45);

  //Section 4

    
  //ground
  /*createSolidObject("platform2",200,650,200,60);
  createSolidObject("platform1_1",600,520,200,70);
  createSolidObject("platform1_2",600,600,200,91);
  createSolidObject("platform1_3",600,700,200,42);

  createSolidObject("waterPlatform1_1",1200,520,200,70);
  createSolidObject("waterPlatform1_2",1200,600,200,91);
  createSolidObject("waterPlatform1_3",1200,700,200,42);

    

  

  createSolidObject("platform1_1",0,890,4000,100);

  createNonSolidObject("tree1",1500,500,270,330);
  createNonSolidObject("tree2",1900,500,270,315);
  createNonSolidObject("tree3",2300,500,186,282);

  createNonSolidObject("arrowSign",2600,700,100,100);

  createNonSolidObject("lampost",2800,500,105,195);*/
}

//Secret debug controls
addEventListener("keyup", (e) => {
  if(e.key==="s") {
    if(initialScreen) {
      initialScreen=false;
      tutorialSetup();
      requestID = requestAnimationFrame(update);
    }
    else if(tutorial) {
      tutorial=false;
      startGameSound.play();
      gameSetup();
    }
    else if(player.gameOver) {
      gameSetup();
      startGameSound.play();
      update();
    }
  }
  if(e.key==="p" && !player.gameOver && !initialScreen) {
    if(!pause) {
      pause = true;
      pauseGameSound.play();
      continueSound.volume=0;
      dryShotSound.volume=0;
      reloadStart.volume=0;
      reloadFinish.volume=0;
      enemyAlertSound.volume=0;
      enemyShotSound.volume=0;
      gameOverSound.volume=0;
      lightShotSound.volume = 0;
      lightShotSound.volume = 0;
      menuMusicSound.volume=0;
      gameMusic.volume=0;
      gameMusic.pause();
    }
    else {
      pause=false;
  
      if(!mute) {
        continueSound.volume=0.3;
        pauseGameSound.volume = 0.2;
        dryShotSound.volume=0.04;
        reloadStart.volume=0.2;
        reloadFinish.volume=0.2;
        enemyAlertSound.volume=0.07;
        enemyShotSound.volume=0.15;
        gameOverSound.volume=0.2;
        lightShotSound.volume = 0.25;
        lightShotSound.volume = 0.25;
        menuMusicSound.volume=0.5;
        gameMusic.volume=0.07;
        gameMusic.play();
      }

      pauseGameSound.play();
      update();
    }
  }
});

//Click coordinates
canvas.addEventListener('mousedown', function(e) {
  if(e.clientX > 1480 && e.clientY<100 && !gameOver && !pause  && !win) {
    if(mute) {
      continueSound.volume=0.3;
      pauseGameSound.volume = 0.2;
      dryShotSound.volume=0.04;
      reloadStart.volume=0.2;
      reloadFinish.volume=0.2;
      enemyAlertSound.volume=0.07;
      enemyShotSound.volume=0.15;
      gameOverSound.volume=0.2;
      lightShotSound.volume = 0.25;
      lightShotSound.volume = 0.25;
      menuMusicSound.volume=0.5;
      gameMusic.volume=0.07;
      gameMusic.play();
      mute=false;
    }
    else {
      continueSound.volume=0;
      pauseGameSound.volume = 0;
      dryShotSound.volume=0;
      reloadStart.volume=0;
      reloadFinish.volume=0;
      enemyAlertSound.volume=0;
      enemyShotSound.volume=0;
      gameOverSound.volume=0;
      lightShotSound.volume = 0;
      lightShotSound.volume = 0;
      menuMusicSound.volume=0;
      gameMusic.volume=0;
      gameMusic.pause();
      mute=true;
    }
  }
});

function loadImages(images, onComplete) {

    var loaded = 0;

    function onLoad() {
        loaded++;
        if (loaded == images.length) {
            onComplete();
        }
    }

    for (var i = 0; i < images.length; i++) {
        var img = new Image();
        img.addEventListener("load", onLoad);
        img.src = images[i];
        imageObjects.push(img);
    }
}

//Load all images then start game
var promiseArray = images.map(function(imgurl){
  var prom = new Promise(function(resolve){
      var img = new Image();
      img.onload = function(){
          loadedImages[imgurl] = img;
          resolve();
      };
      img.src = imgurl;
  });
  return prom;
});

Promise.all(promiseArray).then(initialScrenSetup);

