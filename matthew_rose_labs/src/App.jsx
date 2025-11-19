// ============================================
// FILE 1: App.jsx
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import api from './api';
const allowedFiles = ['.jpeg', '.jpg', '.png'];
const invalidCharsList = ["<", ">", ":", "\"", "/", "\\", "|", "?", "*"];

function App() {
  const [file, setFile] = useState(null);
  const [fileStatus, setFileStatus] = useState('No File Chosen');
  const [fileName, setFileName] = useState(null);
  const [fileNameStatus, setFileNameStatus] = useState(null);
  const [fileURL, setFileURL] = useState(null);
  const [angle, setAngle] = useState(0.0); 
  
  const [blobURL, setBlobURL] = useState(null);
  const [coordinates, setCoordinates] = useState([]);

  const imgRef = useRef(null);
  const contextRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      contextRef.current = context;
      context.strokeStyle = 'red';
      context.lineWidth = 2;
    }
  }, [fileURL]);

  useEffect(() => {
    if (!file) return;

    const fileURL = URL.createObjectURL(file);
    setFileURL(fileURL);

    return () => {
      URL.revokeObjectURL(fileURL);
      if (blobURL) URL.revokeObjectURL(blobURL);
    };
  }, [file]);

  const startPath = (e) => {
    if (!contextRef.current) return;
    const {offsetX, offsetY} = e;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
    e.preventDefault();
  }

  const draw = (e) => {
    if (!contextRef.current || e.buttons !== 1) return;
    const {offsetX, offsetY} = e;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
    e.preventDefault();
  }

  const closePath = () => {
    if (contextRef.current) {
      contextRef.current.closePath();
    }
  }

  async function postFileRequest() {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);

    if (coordinates && coordinates.length > 0 && imgRef.current) {
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
      
      const scaledCoordinates = coordinates.map(([x, y]) => [
        Math.round(x * scaleX),
        Math.round(y * scaleY)
      ]);
      
      formData.append("coordinates", JSON.stringify(scaledCoordinates));
    } else if (coordinates && coordinates.length > 0) {
      formData.append("coordinates", JSON.stringify(coordinates));
    }
    
    if (angle) formData.append("angle", angle);

    api.post('/', formData, {responseType:'blob'}) 
      .then((response) => {
        setBlobURL(URL.createObjectURL(response.data));
        setFileStatus('File Uploaded Successfully')
      })
      .catch(error => setFileStatus(`Error Encountered: ${error}`));
  }

  function clear() {
    setFile(null);
    setFileStatus('No File Chosen');
    setFileName(null);
    setFileNameStatus(null);
    setAngle(0.0);
    setCoordinates([]);
    if (fileURL) {
      URL.revokeObjectURL(fileURL);
      setFileURL(null);
    }
    if (blobURL) {
      URL.revokeObjectURL(blobURL);
      setBlobURL(null);
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }
  
  const handleCoordinateSelection = (e) => {
    if (e) {
      e.preventDefault();
      const rec = e.target.getBoundingClientRect()
      const x = e.clientX - rec.left;
      const y = e.clientY - rec.top;
      setCoordinates((prev) => [...prev, [x, y]]);
    }
  }

  const handleFileUpload = (e) => {
    if (e.target.files) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setFileStatus("Error: File size larger than 5MB");
        return;
      } else if (!file.type.startsWith('image/')) {
        setFileStatus("Error: Upload an image");
        return;
      } else if (!allowedFiles.some(ext => file.name.toLowerCase().endsWith(ext))) {
        setFileStatus("Error: File type not supported - upload PNG, JPEG or JPG");
        return;
      }
      setFile(file);
    } else {
      setFileStatus("Error: Empty file");
    }
  }

  const handleFileName = (name) => {
    if (file && !name) {
      setFileName(file.name);
      setFileNameStatus('Default');
      return;
    }
    if (name) {
      if (!allowedFiles.some(ext => name.toLowerCase().endsWith(ext))) {
        setFileNameStatus("Error: Extension must be PNG, JPEG or JPG");
        return;
      } else if (invalidCharsList.some(char => name.includes(char))) {
        setFileNameStatus("Error: Invalid Characters");
        return;
      }
      setFileName(name);
      setFileNameStatus('Valid');
    }
  }

  return (
    <div>
      <p className='main-title'>Welcome to Matthew-Rose Labs</p>

      <div className="input-group">
        <label>Choose File:</label>
        <input type='file' onChange={handleFileUpload}/>
      </div>

      <div className="input-group">
        <label>[OPTIONAL] Change FileName:</label>
        <input
          type='text'
          value={fileName || ''}
          onChange={(e) => setFileName(e.target.value)} 
          onBlur={(e) => handleFileName(e.target.value)}
        />

        <div>
          <label>Enter Angle</label>
          <input type='text' onChange={(e) => setAngle(e.target.value)}/> 
        </div>
      </div>
    
      <button
        type="submit"
        disabled={!file || fileNameStatus?.startsWith('Error')}
        onClick={() => postFileRequest()}>
        Submit
      </button>

      <button type="clear" onClick={() => clear()}>
        Clear
      </button>

      {fileURL && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            ref={imgRef}
            src={fileURL}
            alt="Preview"
            style={{ maxWidth: '300px', marginTop: '10px', cursor: 'pointer', display: 'block' }}
            onClick={handleCoordinateSelection}
          />
          <canvas 
            ref={canvasRef}
            width={imgRef.current?.width || 300}
            height={imgRef.current?.height || 300}
            style={{
              position: 'absolute',
              top: '10px',
              left: 0,
              pointerEvents: 'all',
              cursor: 'crosshair'
            }}
            onMouseDown={startPath} 
            onMouseMove={draw} 
            onMouseUp={closePath}
          />

          {coordinates.map(([x, y], index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                width: '8px',
                height: '8px',
                backgroundColor: 'red',
                borderRadius: '50%',
                top: y + 10,
                left: x,
                pointerEvents: 'none',
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
        </div>
      )}

      {blobURL && (
        <a download={fileName} href={blobURL}> Download Output </a>
      )}

      <div className="status-container">
        <span className="status-icon"></span>
        <span className="status-text">{fileStatus}</span>
      </div>
    </div>
  );
}

export default App;