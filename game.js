const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let frames = 0;
let requestID;
let enemyProjectiles = [];
let enemiesArray = [];
let gameOver = false;

class GameObject {
    constructor(positionX, positionY, width, height) {
        this.positionX = positionX;
        this.positionY = positionY;
        this.width = width;
        this.height = height;
    }
}

class Player extends GameObject {
    constructor(positionX, positionY, width, height, oldPositionX, oldPositionY, solidObjectsArray, dyingSpriteSheet, idleGunSpriteSheet, idleLongSpriteSheet, jumpingGunSpriteSheet, stopGunSpriteSheet, walkingGunSpritesheet, shootGunSpriteSheet) {
        super(positionX,positionY,width,height);

        this.speedX = 0;
        this.speedY = 0;
        this.gravity = 0.03;
        this.gravitySpeed = 0;
        this.hp = 100;
        this.lookingDirection = "right";
        this.oldPositionX = oldPositionX;
        this.oldPositionY = oldPositionY;
        this.solidObjects = solidObjectsArray;

        this.dyingSpriteSheet = new Image();
        this.dyingSpriteSheet.src = dyingSpriteSheet;
        this.idleGunSpriteSheet = new Image();
        this.idleGunSpriteSheet.src = idleGunSpriteSheet;
        this.idleLongSpriteSheet = new Image();
        this.idleLongSpriteSheet.src = idleLongSpriteSheet;
        this.jumpingGunSpriteSheet = new Image();
        this.jumpingGunSpriteSheet.src = jumpingGunSpriteSheet;
        this.stopGunSpriteSheet = new Image();
        this.stopGunSpriteSheet.src = stopGunSpriteSheet;
        this.walkingGunSpritesheet = new Image();
        this.walkingGunSpritesheet.src = walkingGunSpritesheet;
        this.shootGunSpriteSheet = new Image();
        this.shootGunSpriteSheet.src = shootGunSpriteSheet;

        this.weapon = "gun";
        this.action = "jumpingGun";
        this.jumping = true;
        this.frameIndex = 0;
        this.spriteSheetLength = 0;
        this.currentTick = 0;   
    }

    draw() {
        //Set the player position
        //Vertically
        this.gravitySpeed += this.gravity;
        this.positionY += this.gravitySpeed+this.speedY;
        this.speedY += this.gravity; //Gravity

        //Horizontally
        this.positionX += this.speedX;
        this.speedX *= 0.9;// friction
        
        //set the player direction
        if(this.speedX > 0) {
            this.lookingDirection="right";
        }
        else if(this.speedX < 0) {
            this.lookingDirection="left";
        }

        //Collition player with solid objects
        this.findCollitionsWithSolidObjects();

        //check if the player should mover or the camera
        this.sideScroll();

        //------------------------------//
        //--Animation state conditions--//
        //------------------------------//
        //1.- if the player fells the world, game over
        if (this.positionY > canvas.height && this.hp>0) {
            this.takeDamage(this.hp);
        }

        if(this.hp>0) {
            //2.- if the player is not on ground and not jumping, switch action as jumping
            if(Math.abs(player.positionY-this.oldPositionY)>1 && !this.jumping) {
                this.switchAction("jump");
                this.jumping=true;
            }

            //3.- if the player is moving and not shoting/jumping, then switch action as walk
            if((this.speedX<-0.1 || this.speedX>0.1) && this.action!="shootGun" && !this.jumping){
                this.switchAction("walk");
            }

            //4.- if the player speed is too low, and is not jumping or shooting
            if(this.speedX>-0.4 && this.speedX<0.4 && (this.action==="walkingGun" || !this.jumping) && this.action!="stopGun" && this.action!="shootGun") {
                this.switchAction("idle");
            }
        }
        else if (this.action!=="dying") { //5.- if the player is dead, change to dying
            this.switchAction("dying");
            this.speedX=0;
        }
 
        //Draw animation
        if(this.spriteSheetLength>1) {
            //try to set the next sprite based on the frame tick-rate
            if(frames-this.currentTick > 12) {
                this.frameIndex++;
                this.currentTick = frames;
            }
        }

        switch (this.action) {
            case "dying":
                if(this.lookingDirection==="right") {
                    ctx.drawImage(this.dyingSpriteSheet,100*this.frameIndex,0,100,100,this.positionX,this.positionY,this.width,this.height);
                }
                else {
                    ctx.drawImage(this.dyingSpriteSheet,100*(this.frameIndex+this.spriteSheetLength+1),0,100,100,this.positionX,this.positionY,this.width,this.height);
                }
                
                break;
            case "idleGun":
                if(this.lookingDirection==="right") {
                    ctx.drawImage(this.idleGunSpriteSheet,100*this.frameIndex,0,100,100,this.positionX,this.positionY,this.width,this.height);
                }
                else {
                    ctx.drawImage(this.idleGunSpriteSheet,100*(this.frameIndex+this.spriteSheetLength),0,100,100,this.positionX,this.positionY,this.width,this.height);
                }
                
                break;
            case "idleLong":
                if(this.lookingDirection==="right") {
                    ctx.drawImage(this.idleLongSpriteSheet,100*this.frameIndex,0,100,100,this.positionX,this.positionY,this.width,this.height);
                }
                else {
                    ctx.drawImage(this.idleLongSpriteSheet,100*(this.frameIndex+this.spriteSheetLength+1),0,100,100,this.positionX,this.positionY,this.width,this.height);
                }
                
                break;
            case "jumpingGun":
                if(this.action!="shootGun") {
                    if(this.lookingDirection==="right") {
                        ctx.drawImage(this.jumpingGunSpriteSheet,100*this.frameIndex,0,100,100,this.positionX,this.positionY,this.width,this.height);
                    }
                    else {
                        ctx.drawImage(this.jumpingGunSpriteSheet,100*(this.frameIndex+this.spriteSheetLength),0,100,100,this.positionX,this.positionY,this.width,this.height);
                    }
                }
                break;
            case "stopGun":
                if(this.lookingDirection === "right") {
                    ctx.drawImage(this.stopGunSpriteSheet,100*this.frameIndex,0,100,100,this.positionX,this.positionY,this.width,this.height);
                }
                else {
                    ctx.drawImage(this.stopGunSpriteSheet,100*(this.frameIndex+this.spriteSheetLength),0,100,100,this.positionX,this.positionY,this.width,this.height);
                }
                break;
            case "walkingGun":
                if(this.lookingDirection === "right") {
                    ctx.drawImage(this.walkingGunSpritesheet,100*this.frameIndex,0,100,100,this.positionX,this.positionY,this.width,this.height);
                }
                else {
                    ctx.drawImage(this.walkingGunSpritesheet,100*(this.frameIndex+this.spriteSheetLength),0,100,100,this.positionX,this.positionY,this.width,this.height);
                }
                break;
            case "shootGun":
                if(this.lookingDirection === "right") {
                    ctx.drawImage(this.shootGunSpriteSheet,100*this.frameIndex,0,100,100,this.positionX,this.positionY,this.width,this.height);
                }
                else {
                    ctx.drawImage(this.shootGunSpriteSheet,100*(this.frameIndex+this.spriteSheetLength+1),0,100,100,this.positionX,this.positionY,this.width,this.height);
                }
                
                break;
        }

        //if the animation has more than one image
        if(this.spriteSheetLength>1) {
            //Reset frameIndex if we are at the last frame of the animation
            if(this.frameIndex >= this.spriteSheetLength) {
                //if the player was dying, gameover after finishing the animation
                if(this.action==="dying") {
                    this.gameOver = true;
                }
                else {
                    this.frameIndex = 0;
                    //if the player was shooting, return to idle after finished the shot
                    if(this.action==="shootGun") this.switchAction("stopShooting");
                }
            }
        }
    }

    //Switch player action
    switchAction(action) {
        //Define the action and the ammount of sprites per spritesheet
        switch (action) {
            case "dying":
                if(this.action!="dying") {
                    this.action = "dying";
                    this.spriteSheetLength = 5;
                    this.frameIndex = 0;
                    this.currentTick = frames;
                }
                break;
            case "idle":
                if(this.weapon === "gun") {
                    if(this.action!="idleGun" && this.action!="idleLong") {
                        this.action = "idleGun";
                        this.spriteSheetLength = 1;

                        this.frameIndex = 0;
                        this.currentTick = frames;
                    }
                }
                break;
            case "idleLong":
                if(this.action!="idleLong" && this.hp>0) {
                    this.action = "idleLong";
                    this.spriteSheetLength = 19;

                    this.frameIndex = 0;
                    this.currentTick = frames;
                }
                break;
            case "jump":
                if(this.weapon === "gun") {
                    if(this.action!="jumpingGun") {
                        this.action = "jumpingGun";
                        this.spriteSheetLength = 1;

                        this.frameIndex = 0;
                        this.currentTick = frames;
                    }
                }
                break;
            case "stopShooting":
                if(this.weapon === "gun") {
                    if(this.action!="stopGun") {
                        this.action = "stopGun";
                        this.spriteSheetLength = 1;

                        this.frameIndex = 0;
                        this.currentTick = frames;
                    }
                }
                break;
            case "walk":
                if(this.weapon === "gun") {
                    if(this.action!="walkingGun" && !this.jumping) {
                        this.action = "walkingGun";
                        this.spriteSheetLength = 6;

                        this.frameIndex = 0;
                        this.currentTick = frames;
                    }
                }
                break;
            case "shoot":
                if(this.weapon === "gun") {
                    if(this.action!="shootGun") {
                        this.action = "shootGun";
                        this.spriteSheetLength = 3;

                        this.frameIndex = 0;
                        this.currentTick = frames;
                    }
                }
                break;
        }
    }

    findCollitionsWithSolidObjects() {
        this.solidObjects.forEach(object => {
            //if the player is horizontally on the same position of this object
            if(this.positionX+this.width-20 > object.positionX && this.positionX+20 < object.positionX+object.width) {
                //Check for bottom collition
                if(this.positionY+10 < object.positionY+object.height && this.oldPositionY+10 > object.positionY+object.height) {
                    this.positionY = this.oldPositionY;
                    this.speedY=0;
                    this.gravitySpeed=0;
                }
                 //check for top collition
                else if(this.positionY+this.height > object.positionY && this.oldPositionY+this.height < object.positionY) {
                    this.positionY = this.oldPositionY;
                    this.speedY=0;
                    this.gravitySpeed=0;
                    this.jumping=false;
                }
            }
            //if the player is vertically on the same position of this object
            if(this.positionY+this.width > object.positionY && this.positionY+10 < object.positionY+object.height) {
                //Check for left collition
                if(this.positionX+this.width-40 > object.positionX && this.oldPositionX+this.width-40 < object.positionX) {
                    this.positionX = this.oldPositionX;
                    this.speedX=0;
                }
                //check for right collition
                if(this.positionX+40 < object.positionX+object.width && this.oldPositionX+40 > object.positionX+object.width) {
                    this.positionX = this.oldPositionX;
                    this.speedX=0;
                }
            }
        });
    }

    sideScroll() {
        if(this.positionX+this.width > canvas.width-400 || this.positionX < 100) {
            this.solidObjects.forEach(object => {
                this.positionX=this.oldPositionX;
                object.positionX -= this.speedX;
            });
        }
    }

    takeDamage(damage) {
        this.hp-=damage;
        //console.log(this.hp)
    }
}

class PlayerProjectile extends GameObject {
    constructor(positionX, positionY, width, height, speedX, speedY, direction, bulletType, solidObjectsArray, bulletSpriteSheet) {
        super(positionX,positionY,width,height);
        this.speedX = speedX;
        this.speedY = speedY;
        this.direction=direction;
        this.bulletType = bulletType
        this.bulletSpriteSheet = new Image();
        this.bulletSpriteSheet.src = bulletSpriteSheet;
        this.collition = false;
        this.solidObjects = solidObjectsArray;
        this.frameIndex = 1;
        this.destroy=false;
    }

    fly() {
        this.positionX+=this.speedX;
        this.findCollitions();

        if(!this.collition) {
            if(this.direction==="right") {
                ctx.drawImage(this.bulletSpriteSheet,0,0,100,100,this.positionX+50,this.positionY+20,this.width,this.height);
            }
            else {
                ctx.drawImage(this.bulletSpriteSheet,100*41,0,100,100,this.positionX,this.positionY+20,this.width,this.height);
            }
        }
        else{
            if(this.direction==="right") {
                ctx.drawImage(this.bulletSpriteSheet,100*this.frameIndex,0,100,100,this.positionX+50,this.positionY+20,this.width,this.height);
                this.frameIndex++;
                if(this.frameIndex > 40) this.destroy=true;
            }
            else {
                ctx.drawImage(this.bulletSpriteSheet,100*(this.frameIndex+40),0,100,100,this.positionX,this.positionY+20,this.width,this.height);
                this.frameIndex++;
                if(this.frameIndex > 40) this.destroy=true;
            }
        }
    }

    findCollitions(){
        if(!this.collition) {
            //Search for collitions with solid objects
            this.solidObjects.forEach(object => {
                if(this.positionX < object.positionX+object.width && 
                    this.positionX + this.width+40 > object.positionX &&
                    this.positionY+40 < object.positionY + object.height &&
                    this.positionY + this.height-40 > object.positionY) {
                        this.positionX-=this.speedX;
                        this.collition=true;
                        this.speedX=0;
                    }
            });

            //Search for collitions with enemies
            enemiesArray.forEach(enemy => {
                if(enemy.hp>0 && this.positionX < enemy.positionX+enemy.width-37 && 
                    this.positionX + this.width+40 > enemy.positionX+37 &&
                    this.positionY+40 < enemy.positionY + enemy.height &&
                    this.positionY + this.height-40 > enemy.positionY) {
                        enemy.takeDamage(1);
                        this.positionX-=this.speedX;
                        this.collition=true;
                        this.speedX=0;
                    }
            });
        }
    }
}

class EnemyProjectile extends GameObject {
    constructor(positionX, positionY, width, height, speedX, speedY, direction, bulletDamage, player, solidObjectsArray, enemyBulletSpriteSheet) {
        super(positionX,positionY,width,height);
        this.speedX = speedX;
        this.speedY = speedY;
        this.direction=direction;
        this.bulletDamage = bulletDamage
        this.player = player;
        this.enemyBulletSpriteSheet = new Image();
        this.enemyBulletSpriteSheet.src = enemyBulletSpriteSheet;
        this.collition = false;
        this.solidObjects = solidObjectsArray;
        this.frameIndex = 1;
        this.destroy=false;
    }

    fly() {
        this.positionX+=this.speedX;
        this.findCollitions();

        if(!this.collition) {
            if(this.direction==="right") {
                ctx.drawImage(this.enemyBulletSpriteSheet,0,0,100,100,this.positionX+50,this.positionY+20,this.width,this.height);
            }
            else {
                ctx.drawImage(this.enemyBulletSpriteSheet,100*41,0,100,100,this.positionX,this.positionY+20,this.width,this.height);
            }
        }
        else {
            if(this.direction==="right") {
                ctx.drawImage(this.enemyBulletSpriteSheet,100*this.frameIndex,0,100,100,this.positionX+50,this.positionY+20,this.width,this.height);
                this.frameIndex++;
                if(this.frameIndex > 40) this.destroy=true;
            }
            else {
                ctx.drawImage(this.enemyBulletSpriteSheet,100*(this.frameIndex+40),0,100,100,this.positionX,this.positionY+20,this.width,this.height);
                this.frameIndex++;
                if(this.frameIndex > 40) this.destroy=true;
            }
        }
    }

    findCollitions(){
        if(!this.collition) {
            //Search for collitions with solid objects
            this.solidObjects.forEach(object => {
                if(this.positionX < object.positionX+object.width && 
                    this.positionX + this.width+40 > object.positionX &&
                    this.positionY+45 < object.positionY + object.height &&
                    this.positionY + this.height-45 > object.positionY) {
                        this.positionX-=this.speedX; //back to original position
                        this.collition=true;
                        this.speedX=0;
                    }
            });
            //Search for collision with player
            if(player.hp > 0 && this.positionX < this.player.positionX+player.width-30 &&
               this.positionX+this.width+40 > this.player.positionX+40 &&
               this.positionY+40 < this.player.positionY + this.player.height &&
               this.positionY + this.height-45 > this.player.positionY) {
                   this.positionX-=this.speedX; //back to original position
                   this.collition=true;
                   this.speedX=0;
                   player.takeDamage(this.bulletDamage);
            }

        }
    }
}

class SoldierEnemy extends GameObject {
    constructor(positionX, positionY, width, height, hp, player, patrolDistanceTarget, sightLength, speedX, alertSpriteSheet, dyingSpriteSheet, idleSpriteSheet, walkingSpritesheet, shootSpriteSheet) {
        super(positionX,positionY,width,height);

        this.player=player;
        this.patrolDistance = patrolDistanceTarget;
        this.patrolledDistance = 0;
        this.speedX = speedX;
        this.speedXbackup = speedX;
        this.hp = hp;
        this.maxHp = hp;
        this.dead=false;
        this.lookingDirection = "right";
        this.sightLength = sightLength;

        this.alertSpriteSheet = new Image();
        this.alertSpriteSheet.src = alertSpriteSheet;
        this.dyingSpriteSheet = new Image();
        this.dyingSpriteSheet.src = dyingSpriteSheet;
        this.idleSpriteSheet = new Image();
        this.idleSpriteSheet.src = idleSpriteSheet;
        this.walkingSpritesheet = new Image();
        this.walkingSpritesheet.src = walkingSpritesheet;
        this.shootSpriteSheet = new Image();
        this.shootSpriteSheet.src = shootSpriteSheet;

        this.action = "patrolling";
        this.frameIndex = 0;
        this.spriteSheetLength = 4;
        this.currentTick = 0;
        this.ammo=3;
        this.maxAmmo=3;
    }

    draw() {
        //Set looking direction
        if(this.speedX>0) {
            this.lookingDirection="right";
        }
        else if(this.speedX<0) {
            this.lookingDirection="left";
        }

        if(this.hp>0) {
            //Set the enemy position position
            this.positionX += this.speedX;
            this.patrolledDistance += Math.abs(this.speedX);

            //try to find player
            this.findPlayer();

            //if the patrolled distance exceeds the patrolled distance target, then change the moving direction
            if(this.patrolledDistance >= this.patrolDistance) {
                this.patrolledDistance=0;
                this.speedX*=-1;  
            }
        }
        else {
            this.speedX=0;
            this.switchAction("dying");
        }

        //Draw lifebar
        ctx.fillStyle = 'red';
        ctx.fillRect(this.positionX+20, this.positionY, 60 * this.hp/this.maxHp, 10);

        //Draw animation
        if(this.spriteSheetLength>1) {
            //try to set the next sprite based on the frame tick-rate
            if(frames-this.currentTick > 12) {
                this.frameIndex++;
                this.currentTick = frames;
            }
        }

        switch (this.action) {
            case "dying":
                if(this.lookingDirection==="right") {
                    ctx.drawImage(this.dyingSpriteSheet,100*this.frameIndex,0,100,100,this.positionX,this.positionY,this.width,this.height);
                    this.frameIndex
                }
                else {
                    ctx.drawImage(this.dyingSpriteSheet,100*(this.frameIndex+this.spriteSheetLength+1),0,100,100,this.positionX,this.positionY,this.width,this.height);
                }
                
                break;
            case "idle":
                if(this.lookingDirection==="right") {
                    ctx.drawImage(this.idleSpriteSheet,100*this.frameIndex,0,100,100,this.positionX,this.positionY,this.width,this.height);
                }
                else {
                    ctx.drawImage(this.idleSpriteSheet,100*(this.frameIndex+this.spriteSheetLength),0,100,100,this.positionX,this.positionY,this.width,this.height);
                }
                
                break;
            case "patrolling":
                if(this.lookingDirection==="right") {
                    ctx.drawImage(this.walkingSpritesheet,100*this.frameIndex,0,100,100,this.positionX,this.positionY,this.width,this.height);
                }
                else {
                    ctx.drawImage(this.walkingSpritesheet,100*(this.frameIndex+this.spriteSheetLength),0,100,100,this.positionX,this.positionY,this.width,this.height);
                }
                    
                break;
            case "alert":
                if(this.lookingDirection==="right") {
                    ctx.drawImage(this.alertSpriteSheet,100*this.frameIndex,0,100,100,this.positionX,this.positionY,this.width,this.height);
                }
                else {
                    ctx.drawImage(this.alertSpriteSheet,100*(this.frameIndex+this.spriteSheetLength),0,100,100,this.positionX,this.positionY,this.width,this.height);
                }
                break;
            case "shoot":
                if(this.lookingDirection === "right") {
                    ctx.drawImage(this.shootSpriteSheet,100*this.frameIndex,0,100,100,this.positionX,this.positionY,this.width,this.height);
                }
                else {
                    ctx.drawImage(this.shootSpriteSheet,100*(this.frameIndex+this.spriteSheetLength),0,100,100,this.positionX,this.positionY,this.width,this.height);
                }
                if(frames-this.currentTick === 12 && this.action==="shoot" && this.frameIndex===1 ) this.shoot();
                break;
        }

        //if the animation has more than one image
        if(this.spriteSheetLength>1) {
            //Reset frameIndex if we are at the last frame of the animation
            if(this.frameIndex >= this.spriteSheetLength) {
                this.frameIndex = 0;
                //if the enemy finished the alert animation, switch to shooting
                if(this.action==="alert") {
                    this.switchAction("shoot");
                } //if the enemy is shooting, check ammo
                else if(this.action==="shoot") {
                    if(this.ammo<=0) { //Empty ammo, back to patrol
                        this.switchAction("patrolling");
                        this.ammo=this.maxAmmo;
                        if(this.lookingDirection==="right") {
                            this.speedX=this.speedXbackup;
                        }
                        else {
                            this.speedX=this.speedXbackup*-1;
                        }
                        
                    }
                }
                else if(this.action==="dying") {
                    this.dead=true;
                }
            }
        }
    }
    //Switch enemy action
    switchAction(action) {
        //Define the action and the ammount of sprites per spritesheet
        switch (action) {
            case "dying":
                if(this.action!="dying") {
                    this.action="dying";
                    this.spriteSheetLength = 4;

                    this.frameIndex = 0;
                    this.currentTick = frames;
                }       
                break;
            case "idle":
                if(this.action!="idle") {
                    this.action = "idle";
                    this.spriteSheetLength = 1;

                    this.frameIndex = 0;
                    this.currentTick = frames;
                }
                break;
            case "patrolling":
                if(this.action!="patrolling") {
                    this.action = "patrolling";
                    this.spriteSheetLength = 4;

                    this.frameIndex = 0;
                    this.currentTick = frames;
                }
                break;
            case "shoot":
                if(this.action!="shoot") {
                    this.action = "shoot";
                    this.spriteSheetLength = 3;

                    this.frameIndex = 0;
                    this.currentTick = frames;
                }
                break;
            case "alert":
                if(this.action!="alert") {
                    this.action = "alert";
                    this.spriteSheetLength = 2;

                    this.frameIndex = 0;
                    this.currentTick = frames+20;
                }
                break;
        }
       
    }

    //find player
    findPlayer() {
        if(this.action==="patrolling") {
            if(this.lookingDirection==="right") {
                if(this.positionX+this.width+this.sightLength > player.positionX &&
                    this.positionX < player.positionX &&
                    this.positionY < player.positionY+player.height &&
                    this.positionY+this.height/2 > player.positionY ) {
                    this.speedX=0;
                    this.switchAction("alert");
                }
            }
            else {
                if(this.positionX-this.sightLength < player.positionX+player.width &&
                    this.positionX > player.positionX &&
                    this.positionY < player.positionY+player.height &&
                    this.positionY+this.height/2 > player.positionY ) {
                        this.speedX=0;
                    this.switchAction("alert");
                }
            }
        }
    }

    shoot() {
        invokeEnemyBullet(10,this.lookingDirection, this.positionX, this.positionY, this.player);
        this.ammo--;
    }

    takeDamage(damage) {
        this.hp-=damage;
        //console.log(this.hp)
    }
}

class solidObject extends GameObject {
    constructor(positionX, positionY, width, height, type, environmentSpriteSheet) {
        super(positionX,positionY,width,height);
        this.image = new Image();
        this.image.src = environmentSpriteSheet;
        this.type = type;
    }

    draw() {
        switch (this.type) {
            case "platform1":
                ctx.drawImage(this.image,160,220,95,100,this.positionX,this.positionY,this.width,this.height);
                break;
        }
    }
}

function invokeEnemyBullet(bulletDamage, lookingDirection, posX, posY, player) {
    let bulletSpeed=4;
    if(lookingDirection==="left") bulletSpeed *= -1;
    enemyProjectiles.push(new EnemyProjectile(posX,posY+5,100,100,bulletSpeed,0,lookingDirection,10,player,solidObjects,"Game Assets/Images/Sprites/EnemyBullet/spritesheet.png"));
}