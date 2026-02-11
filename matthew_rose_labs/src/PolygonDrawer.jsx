import React, { useRef, useEffect, useState } from 'react';

function PolygonDrawer({ imageUrl, imageRef, onRegionsChange }) {
  const canvasRef = useRef(null);
  const [regions, setRegions] = useState([]); // Array of regions, each region is an array of points
  const [currentRegion, setCurrentRegion] = useState([]); // Points for the region being drawn

  // Setup canvas when image loads
  useEffect(() => {
    if (!imageRef.current || !canvasRef.current || !imageUrl) return;

    const img = imageRef.current;
    const canvas = canvasRef.current;

    const setupCanvas = () => {
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

  // Redraw canvas when regions change
  useEffect(() => {
    redrawCanvas();
  }, [regions, currentRegion]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw completed regions
    regions.forEach((region, regionIdx) => {
      if (region.length > 0) {
        const colors = ['red', 'blue', 'green', 'orange', 'purple', 'cyan'];
        const color = colors[regionIdx % colors.length];
        
        ctx.strokeStyle = color;
        ctx.fillStyle = color.replace(')', ', 0.2)').replace('rgb', 'rgba').replace(color, `${color === 'red' ? '255, 0, 0' : color === 'blue' ? '0, 0, 255' : color === 'green' ? '0, 255, 0' : color === 'orange' ? '255, 165, 0' : color === 'purple' ? '128, 0, 128' : '0, 255, 255'}, 0.2`);
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(region[0][0], region[0][1]);
        
        for (let i = 1; i < region.length; i++) {
          ctx.lineTo(region[i][0], region[i][1]);
        }

        if (region.length >= 3) {
          ctx.closePath();
          ctx.fillStyle = color === 'red' ? 'rgba(255, 0, 0, 0.2)' : 
                         color === 'blue' ? 'rgba(0, 0, 255, 0.2)' :
                         color === 'green' ? 'rgba(0, 255, 0, 0.2)' :
                         color === 'orange' ? 'rgba(255, 165, 0, 0.2)' :
                         color === 'purple' ? 'rgba(128, 0, 128, 0.2)' : 'rgba(0, 255, 255, 0.2)';
          ctx.fill();
        }
        
        ctx.stroke();

        // Draw point markers
        region.forEach(([x, y], index) => {
          ctx.fillStyle = color;
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
        
        // Draw region label
        if (region.length > 0) {
          const centroidX = region.reduce((sum, p) => sum + p[0], 0) / region.length;
          const centroidY = region.reduce((sum, p) => sum + p[1], 0) / region.length;
          ctx.fillStyle = color;
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`R${regionIdx + 1}`, centroidX, centroidY - 15);
        }
      }
    });

    // Draw current region being created
    if (currentRegion.length > 0) {
      ctx.strokeStyle = '#00ff41';
      ctx.fillStyle = 'rgba(0, 255, 65, 0.2)';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(currentRegion[0][0], currentRegion[0][1]);
      
      for (let i = 1; i < currentRegion.length; i++) {
        ctx.lineTo(currentRegion[i][0], currentRegion[i][1]);
      }

      if (currentRegion.length >= 3) {
        ctx.closePath();
        ctx.fill();
      }
      
      ctx.stroke();

      // Draw point markers
      currentRegion.forEach(([x, y], index) => {
        ctx.fillStyle = '#00ff41';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
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
    const newPoints = [...currentRegion, [x, y]];
    setCurrentRegion(newPoints);
  };

  const handleFinishRegion = (e) => {
    e.stopPropagation();
    if (currentRegion.length >= 3) {
      const newRegions = [...regions, currentRegion];
      setRegions(newRegions);
      setCurrentRegion([]);
      onRegionsChange(newRegions);
    } else {
      alert('Need at least 3 points to create a region!');
    }
  };

  const handleClearCurrent = (e) => {
    e.stopPropagation();
    setCurrentRegion([]);
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    setRegions([]);
    setCurrentRegion([]);
    onRegionsChange([]);
  };

  const handleRemoveLastRegion = (e) => {
    e.stopPropagation();
    if (regions.length > 0) {
      const newRegions = regions.slice(0, -1);
      setRegions(newRegions);
      onRegionsChange(newRegions);
    }
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
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          zIndex: 20,
        }}
      >
        {currentRegion.length > 0 && (
          <>
            <button
              onClick={handleFinishRegion}
              style={{
                padding: '5px 10px',
                backgroundColor: '#1a4d1a',
                color: '#00ff41',
                border: '1px solid #00ff41',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '12px'
              }}
            >
              ✓ Finish Region ({currentRegion.length} points)
            </button>
            <button
              onClick={handleClearCurrent}
              style={{
                padding: '5px 10px',
                backgroundColor: '#4d1a1a',
                color: '#ff4141',
                border: '1px solid #ff4141',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '12px'
              }}
            >
              ✗ Clear Current
            </button>
          </>
        )}
        {regions.length > 0 && (
          <>
            <button
              onClick={handleRemoveLastRegion}
              style={{
                padding: '5px 10px',
                backgroundColor: '#4d1a1a',
                color: '#ff4141',
                border: '1px solid #ff4141',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '12px'
              }}
            >
              − Remove Last Region ({regions.length} total)
            </button>
            <button
              onClick={handleClearAll}
              style={{
                padding: '5px 10px',
                backgroundColor: '#4d1a1a',
                color: '#ff4141',
                border: '1px solid #ff4141',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '12px'
              }}
            >
              ✗ Clear All Regions
            </button>
          </>
        )}
      </div>
      {regions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: '#00ff41',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 20,
          }}
        >
          {regions.length} region(s) defined
        </div>
      )}
    </>
  );
}

export default PolygonDrawer;
