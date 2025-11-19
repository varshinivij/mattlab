import React, { useRef, useEffect, useState } from 'react';

function PolygonDrawer({ imageUrl, imageRef, onCoordinatesChange }) {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);

  // Setup canvas when image loads
  useEffect(() => {
    if (!imageRef.current || !canvasRef.current || !imageUrl) return;

    const img = imageRef.current;
    const canvas = canvasRef.current;

    const setupCanvas = () => {
      // Wait a bit for image to fully render with correct dimensions
      setTimeout(() => {
        const rect = img.getBoundingClientRect();
        canvas.width = img.offsetWidth;
        canvas.height = img.offsetHeight;
        canvas.style.width = `${img.offsetWidth}px`;
        canvas.style.height = `${img.offsetHeight}px`;
        redrawCanvas();
      }, 100);
    };

    if (img.complete) {
      setupCanvas();
    } else {
      img.addEventListener('load', setupCanvas);
      return () => img.removeEventListener('load', setupCanvas);
    }
  }, [imageUrl, imageRef]);

  // Redraw canvas when points change
  useEffect(() => {
    redrawCanvas();
  }, [points]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (points.length > 0) {
      // Draw polygon lines
      ctx.strokeStyle = 'red';
      ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
      }

      // Close and fill if we have at least 3 points
      if (points.length >= 3) {
        ctx.closePath();
        ctx.fill();
      }
      
      ctx.stroke();

      // Draw point markers
      points.forEach(([x, y], index) => {
        ctx.fillStyle = 'red';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Draw point number
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(index + 1, x, y);
      });
    }
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    console.log('Click at:', x, y);
    const newPoints = [...points, [x, y]];
    setPoints(newPoints);
    onCoordinatesChange(newPoints);
  };

  const handleClearPolygon = (e) => {
    e.stopPropagation();
    setPoints([]);
    onCoordinatesChange([]);
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          cursor: 'crosshair',
          pointerEvents: 'all',
          margin: '0',
          padding: '0',
          border: 'none',
          zIndex: 10
        }}
        onClick={handleCanvasClick}
      />
      {points.length > 0 && (
        <button
          onClick={handleClearPolygon}
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            padding: '5px 10px',
            backgroundColor: '#1a4d1a',
            color: '#00ff41',
            border: '1px solid #00ff41',
            borderRadius: '4px',
            cursor: 'pointer',
            zIndex: 20,
            fontFamily: 'inherit',
            fontSize: '12px'
          }}
        >
          Clear Polygon ({points.length} points)
        </button>
      )}
    </>
  );
}

export default PolygonDrawer;