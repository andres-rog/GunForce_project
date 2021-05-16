const controller = {
    left: false,
    right: false,
    jump: false,
    jumpReleased: true,
    fire: false,
    fireReleased: true,
}

function keyPressed(key) {
    switch(key) {
        case " ": 
            controller.jump = true;
            controller.jumpReleased = false;
            break;
        case "ArrowLeft": 
            controller.left = true;
            break;
        case "ArrowRight": 
            controller.right = true;
            break;
        case "z": 
            controller.fire = true;
            controller.fireReleased = false;
            break;
    }
};
  
function keyReleased(key) {
    switch(key) {
        case " ": 
            controller.jump = false;
            controller.jumpReleased = true;
            break;
        case "ArrowLeft": 
            controller.left = false;
            break;
        case "ArrowRight": 
            controller.right = false;
            break;
        case "z": 
            controller.fire = false;
            controller.fireReleased = true;
            break;
    }
};


addEventListener("keydown", (e)=>{
    keyPressed(e.key); 
});

addEventListener("keyup", (e) => {
    keyReleased(e.key);
});