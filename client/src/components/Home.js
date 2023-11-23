import React, { useEffect, useState } from 'react';
import Canvas from './Canvas';

const Home = ({ socket }) => {
  const [users, setUsers] = useState([]);
  const [first, setFirst] = useState(false);
  const [screenDetails, setScreenDetails] = useState({});

  const [boxes, setBoxes] = useState([]);
  const [time, setTime] = useState(new Date());
  const [canvasStarted, setCanvasStarted] = useState(false); // New state for canvas start

  useEffect(() => {
    const usersListener = (data) => {
      setUsers(data);
      if (first) {
        let tmpBoxList = []
        users.forEach((user) => {
          if (user.id !== socket.id) {
            user.position.x -= window.screenLeft;
            user.position.y -= window.screenTop;
            tmpBoxList.push(user.position);
            console.log(user.position);
          }
        });
        setBoxes(tmpBoxList);
      }
    };
    const firstListener = () => {setFirst(true)};
  
    socket.on('users', usersListener);
    socket.on('first', firstListener);
  
    return () => {
      socket.off('users', usersListener);
      socket.off('first', firstListener);
    };
  }, [socket, users, first]);

  const startCanvas = () => {
    setCanvasStarted(true); // Set canvasStarted to true when button is pressed
  };

  const draw = (ctx, frameCount, balls) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (first) {
      ctx.fillStyle = '#000000';


      if (frameCount % 20 === 0) {
        if (balls.length < 4 ) {
          const ball = {
              x: Math.random() * ctx.canvas.width,
              y: 0,
              velocity: {x: Math.random() - 0.5, y: 0},
              radius: 10 + Math.random()*5,
              speed: 2,
              color: '#FF0000'
          };
          balls.push(ball);
      }
    }
      for (let i = 0; i < balls.length; i++) {
        let ball = balls[i];

        // If ball collides with a box, stop it moving
        let collided = false;
        boxes.forEach((box) => {
          if (ball.x - ball.radius < box.x + box.width &&
              ball.x + ball.radius > box.x &&
              ball.y - ball.radius < box.y + box.height &&
              ball.y + ball.radius > box.y) {
            collided = true;
            ball.velocity.y = -ball.velocity.y;
            let boing = new Audio('boing.wav');
            boing.preservesPitch = false;
            boing.playbackRate = 0.9 + Math.random()*0.2;
            boing.play();
          }
        })
        ball.y += ball.velocity.y;
        if (!collided) {
          ball.velocity.y += 0.1;
          ball.x += ball.velocity.x;
        }

        ctx.beginPath()
        ctx.arc(ball.x, ball.y, ball.radius, 0, 2*Math.PI)
        ctx.fill()
        if (ball.y > ctx.canvas.height) {
            balls = [];
            setTime(new Date());
            let explosion = new Audio('explosion.wav');
            explosion.preservesPitch = false;
            explosion.playbackRate = 0.9 + Math.random()*0.2;
            explosion.play();
        }
        if (ball.x < 0 || ball.x > ctx.canvas.width) {
          ball.velocity.x = - ball.velocity.x;
        }
      }


      ctx.font = '20px Arial';
      ctx.fillText(`Time since last dropped: ${((new Date() - time) / 1000).toFixed(0)} s`, 10, 30);

    } else {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    let tempScreenDetails = {
      x: window.screenLeft,
      y: window.screenTop,
      width: window.innerWidth,
      height: window.innerHeight
    };
    if (
      tempScreenDetails.x !== screenDetails.x ||
      tempScreenDetails.y !== screenDetails.y ||
      tempScreenDetails.width !== screenDetails.width ||
      tempScreenDetails.height !== screenDetails.height
      ) {
      setScreenDetails(tempScreenDetails);
      socket.emit('windowChange', tempScreenDetails);
    }
    
    return balls
  }
  
  const width = typeof window !== 'undefined' ? window.innerWidth : 0;
  const height = typeof window !== 'undefined' ? window.innerHeight : 0;

  return (
    <div>
      {!canvasStarted && <button onClick={startCanvas}>Start Playing</button>} {/* Button to start canvas */}
      {canvasStarted && <Canvas draw={draw} width={width} height={height} />} {/* Render canvas when canvasStarted is true */}
    </div>
  );
};

export default Home;