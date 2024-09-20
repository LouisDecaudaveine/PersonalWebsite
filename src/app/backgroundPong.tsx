"use client";

import { MutableRefObject, useEffect, useRef, useState } from "react"



interface PongState {
    ballState: BallState;
    paddleLState: PaddleState;
    paddleRState: PaddleState;
}

interface PaddleState {
    width: number;
    height: number;
    x: number;
    y: number;

    dir: number; // -1, 1: up down or left right depending on orientation
}

interface BallState {
    radius: number;
    x: number;
    y: number;

    angle: number; //radiant value of the the direction the ball is going in 

    isOutOfBounds: boolean;
    isColliding: boolean;
}

interface PongWorld {
    ball: Ball;
    paddleL: Paddle;
    paddleR: Paddle;
    getColLines: (context: CanvasRenderingContext2D) => CollisionLine[];
}

type CollisionLine = {x1: number, y1: number, x2: number, y2: number}

type Ball = {
    state: BallState;

    getState: () => BallState;
    update: (colLines: CollisionLine[],context: CanvasRenderingContext2D) => void;
    show: (context: CanvasRenderingContext2D) => void;
}

type Paddle = {
    state: PaddleState;
    update: (ballState: BallState) => void;
    show: (context: CanvasRenderingContext2D) => void;
    getColLine: () => CollisionLine[];
}



let frameCount : number = 0;

const createBall = (initState: BallState) : Ball => {
    const state = initState;
    const ballSpeed = 1.5;

    const getState = () => {
        return state;
    }

    const update = (colLines: CollisionLine[], context: CanvasRenderingContext2D) => {
        const velocity: {dx:number, dy:number} = {dx: Math.cos(state.angle) * ballSpeed, dy: Math.sin(state.angle)*ballSpeed};
        const newPos = {x: state.x + velocity.dx/innerWidth, y: state.y + velocity.dy/innerHeight}
        const ballCenter = {x: newPos.x * window.innerWidth, y: newPos.y * window.innerHeight};
        
        colLines.forEach(line => {

            const dx = line.x2 - line.x1;
            const dy = line.y2 - line.y1;
        
            // Find the projection of the circle center onto the line
            const lenSq = dx * dx + dy * dy;
            let t = ((ballCenter.x - line.x1) * dx + (ballCenter.y - line.y1) * dy) / lenSq;
        

            // Clamp t to the range [0, 1] to ensure the projection falls on the segment
            t = Math.max(0, Math.min(1, t));
        
            // Get the closest point on the line segment to the circle
            const closestX = line.x1 + t * dx;
            const closestY = line.y1 + t * dy;
        
            // Calculate the distance from the circle center to the closest point
            const distX = ballCenter.x - closestX;
            const distY = ballCenter.y - closestY;
            const distance = Math.sqrt(distX * distX + distY * distY);
            const collisionDistance = distance - state.radius;

            let isColliding = 'red';

            if(collisionDistance <= 0){
                isColliding = 'green';
                state.isColliding = true;

                // Compute the normal of the line (perpendicular to the line)
                let nx = line.y2 - line.y1;
                let ny = -(line.x2 - line.x1);
                
                const length = Math.sqrt(nx * nx + ny * ny);
                nx /= length;
                ny /= length;
            
                // Calculate the dot product between the velocity vector and the normal
                const dotProduct = velocity.dx * nx + velocity.dy * ny;
            
                // Reflect the velocity vector across the normal
                const reflectedVx = velocity.dx - 2 * dotProduct * nx;
                const reflectedVy = velocity.dy - 2 * dotProduct * ny;

                //move the ball outside the collision zone
                state.x = state.x + (Math.cos(state.angle) * collisionDistance)/innerWidth;
                state.y = state.y + (Math.sin(state.angle)* collisionDistance)/innerHeight;

                state.angle = Math.atan2(reflectedVy,reflectedVx);
            }

           
            // //DEBUGGING
            // context.beginPath();
            // context.strokeStyle = isColliding;
            // context.moveTo(ballCenter.x , ballCenter.y)
            // context.lineTo(closestX, closestY);
            // context.stroke();

        });

        if(!state.isColliding){
            state.x = newPos.x;
            state.y = newPos.y;
        }
        state.isColliding = false;
        
        
    }

    const show = (context: CanvasRenderingContext2D) => {
        context.fillStyle = '#333';
        context.beginPath();
        context.arc(state.x * window.innerWidth, state.y * window.innerHeight,state.radius, 0, Math.PI * 2, true);
        context.fill()
    }


    const ball : Ball = {state, update, show, getState}
    return ball
}

const createPaddle = (initState: PaddleState, pos: "L" | "R" ) : Paddle => {
    const state: PaddleState = initState;
    const sinPos = Math.random() * 2 * Math.PI;


    const update = (ballCoords: BallState) => {
        const dx = ballCoords.x*window.innerWidth - state.x*window.innerWidth;
        const dy = ballCoords.y*window.innerHeight - state.y*window.innerHeight+state.width/2;
        const angle = Math.atan2(dy,dx)

        // state.y = 0.5 + (Math.sin(sinPos + frameCount/200))/8;

        
        if((pos==="L" && Math.cos(ballCoords.angle) <= 0 || pos==="R" && Math.cos(ballCoords.angle) >= 0) ){
            state.y = dy>0 ? state.y + Math.abs(Math.sin(angle))* 2/window.innerHeight : state.y +  Math.abs(Math.sin(angle))* -2/window.innerHeight;
        }

    }

    const show = (context: CanvasRenderingContext2D) => {
        context.fillStyle = '#333';
        context.fillRect(state.x * window.innerWidth - state.width/2, state.y * window.innerHeight - state.height/2, state.width  , state.height);
    }

    const getColLine = () : CollisionLine[] =>{
        let colLines: CollisionLine[] = [];
        const x = state.x*window.innerWidth - state.width/2;
        const y = state.y*window.innerHeight - state.height/2;
        
        colLines.push({x1:x, y1:y, x2: x+state.width, y2:y});
        colLines.push({x1:x, y1:y, x2: x, y2:y+state.height});
        colLines.push({x1:x, y1:y+state.height, x2: x+state.width, y2:y+state.height});
        colLines.push({x1:x+state.width, y1:y, x2: x+state.width, y2:y+state.height});

        return colLines
    }

    const paddle : Paddle = {state, update, show, getColLine}
    return paddle;
}

const initPongWorld = (canvasRef: MutableRefObject<HTMLCanvasElement | null>, initState: PongState) => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if(!canvas) return;

    const context = canvas.getContext('2d');
    if(!context) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const paddleL = createPaddle(initState.paddleLState, "L");
    const paddleR = createPaddle(initState.paddleRState, "R");
    const ball = createBall(initState.ballState);

    const getColLines = (context: CanvasRenderingContext2D) : CollisionLine[] => {
        const colLines =  [
            ...paddleL.getColLine(),
            ...paddleR.getColLine(),
            {x1:0, y1: 0, x2:window.innerWidth, y2:0},
            {x1:0, y1: window.innerHeight, x2:window.innerWidth, y2:window.innerHeight},
            {x1:0, y1: 0, x2:0, y2:window.innerHeight},
            {x1:window.innerWidth, y1: 0, x2:window.innerWidth, y2:window.innerHeight}
        ]


        // //DEBUGGING
        // colLines.forEach(line => {
        //     context.beginPath();
        //     context.strokeStyle = 'red';
        //     context.moveTo(line.x1, line.y1)
        //     context.lineTo(line.x2, line.y2);
        //     context.stroke();
        // })

        return colLines
    }

       

    const world : PongWorld = {paddleL: paddleL, paddleR: paddleR, ball: ball, getColLines};


    let animationFrameId: number;

    const render = () => {
        draw(context, world, canvas.width, canvas.height);
        animationFrameId = window.requestAnimationFrame(render);
    }

    render();

    return () => {
        window.cancelAnimationFrame(animationFrameId); // Cleanup animation frame
    }

}

const draw = (context: CanvasRenderingContext2D, world : PongWorld, width: number, height: number) => {
    context.clearRect(0,0,width,height);


    world.paddleL.update(world.ball.getState());
    world.paddleR.update(world.ball.getState());
    world.paddleL.show(context);
    world.paddleR.show(context);

    const colLines = world.getColLines(context);
    world.ball.update(colLines, context);
    world.ball.show(context);

 
    frameCount++;
    if(frameCount > 100000) frameCount = 0; 

}




export default function BackgroundPong() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [pongState,setState] = useState<PongState>({
        paddleRState:{width:50, height: 200, x: 0.85, y: 0.45, dir: 0}, 
        paddleLState:{width:50, height: 200, x: 0.15, y: 0.45, dir: 0}, 
        ballState:{radius: 30, x: 0.5, y: 0.5, isOutOfBounds: false, isColliding: false, angle:(Math.PI/4) * ((Math.random()-0.5)*2) + Math.PI}
    });


    
    useEffect(()=> {
        const cleanup = initPongWorld(canvasRef, pongState)
        
        const handleResize = () => {
            const canvas: HTMLCanvasElement | null = canvasRef.current;
            if(canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        }

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            if(cleanup) cleanup();
        }

    }, []);


    return <canvas  className="absolute left-0 top-0 -z-10" ref={canvasRef} />
}