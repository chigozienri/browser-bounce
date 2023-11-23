import React, { useRef, useEffect, useState, useCallback } from 'react'

const Canvas = props => {
  const { draw, ...rest } = props
  const canvasRef = useRef(null)
  const [balls, setBalls] = useState([]);

  // Only recreate memoizedDraw if the draw function changes
  const memoizedDraw = useCallback((context, frameCount, balls) => {
    return draw(context, frameCount, balls);
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    let frameCount = 0
    let animationFrameId
    
    const render = () => {
      frameCount++
      setBalls(draw(context, frameCount, balls));
      animationFrameId = window.requestAnimationFrame(render)
    }
    render()
    
    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [memoizedDraw, balls, draw])

  return <canvas ref={canvasRef} {...rest}/>
}

export default Canvas