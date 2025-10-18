// ============================================
// FILE 1: App.jsx
// ============================================

// READD:
// https://medium.com/@marcnealer/a-practical-guide-to-using-pydantic-8aafa7feebf6


import React, { useState, useEffect } from 'react';
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
  const [coordinates, setCoordinates] = useState();

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFileURL(url);
    setCoordinates([]);
    return () => {
      setFileURL(null);
      URL.revokeObjectURL(url);
    }
  }, [file]);

  async function postFileRequest() {
    const formData = new FormData();
    formData.append("coordinates", JSON.stringify(coordinates));
    formData.append("angle", angle);
    formData.append("fileName", fileName);
    formData.append("file", file);
    api.post('/', formData, {responseType:'blob'}) 
      .then((response) => {
        setBlobURL(URL.createObjectURL(response.data));
        setFileStatus('File Uploaded Successfully')
      })
      .catch(error => setFileStatus(`Error Encountered: ${error.message}`));
  }

  function clear() {
    setFile(null);
    setFileStatus('No File Chosen');
    setFileName(null);
    setFileNameStatus(null);
    setAngle(0.0);
    if (fileURL) {
      URL.revokeObjectURL(fileURL);
      URL.revokeObjectURL(blobURL);
      setFileURL(null);
      setBlobURL(null);
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
      setFileName(file.name);
      setFileNameStatus('Default');
    } else {
      setFileStatus("Error: Empty file");
    }
  }

  const handleFileName = (name) => {
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
    } else {
      setFileNameStatus("Error: Empty Name");
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
        disabled={!file || !fileName || fileNameStatus?.startsWith('Error')}
        onClick={() => postFileRequest()}>
        Submit
      </button>

      <button type="clear" onClick={() => clear()}>
        Clear
      </button>


    {fileURL && (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <img
          src={fileURL}
          alt="Preview"
          useMap="#cropmap"
          style={{ maxWidth: '300px', marginTop: '10px', cursor: 'pointer' }}
          onClick={handleCoordinateSelection}
        />
        {coordinates.map(([x, y], index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              backgroundColor: 'red',
              borderRadius: '50%',
              top: y,
              left: x,
              pointerEvents: 'none'
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