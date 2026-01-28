import React, { useState, useEffect, useRef } from 'react';
import api from './api';
import PolygonDrawer from './PolygonDrawer';

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

  const [zoom, setZoom] = useState(1); // ✅ zoom state

  const imgRef = useRef(null);

  useEffect(() => {
    if (!file) return;

    const fileURL = URL.createObjectURL(file);
    setFileURL(fileURL);

    return () => {
      URL.revokeObjectURL(fileURL);
      if (blobURL) URL.revokeObjectURL(blobURL);
    };
  }, [file]);

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

    api.post('/', formData, { responseType: 'blob' })
      .then((response) => {
        setBlobURL(URL.createObjectURL(response.data));
        setFileStatus('File Uploaded Successfully');
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
    setZoom(1); // ✅ reset zoom

    if (fileURL) {
      URL.revokeObjectURL(fileURL);
      setFileURL(null);
    }
    if (blobURL) {
      URL.revokeObjectURL(blobURL);
      setBlobURL(null);
    }
  }

  const handleFileUpload = (e) => {
    if (e.target.files) {
      const file = e.target.files[0];

      if (!file.type.startsWith('image/')) {
        setFileStatus("Error: Upload an image");
        return;
      } else if (!allowedFiles.some(ext => file.name.toLowerCase().endsWith(ext))) {
        setFileStatus("Error: File type not supported - upload PNG, JPEG or JPG");
        return;
      }

      setFile(file);
      setCoordinates([]);
      setZoom(1); // ✅ reset zoom on new file
    } else {
      setFileStatus("Error: Empty file");
    }
  };

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
  };

  return (
    <div>
      <p className='main-title'>Welcome to Matthew-Rose Labs</p>

      <div className="input-group">
        <label>Choose File:</label>
        <input type='file' onChange={handleFileUpload} />
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
          <input type='text' onChange={(e) => setAngle(e.target.value)} />
        </div>
      </div>

      <button
        type="submit"
        disabled={!file || fileNameStatus?.startsWith('Error')}
        onClick={postFileRequest}
      >
        Submit
      </button>

      <button type="clear" onClick={clear}>
        Clear
      </button>

      {/* ✅ Zoom controls */}
      {fileURL && (
        <div style={{ marginTop: '10px' }}>
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>−</button>
          <span style={{ margin: '0 10px' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={() => setZoom(z => Math.min(3, z + 0.1))}>+</button>
        </div>
      )}

      {fileURL && (
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            margin: '20px 0 0 0',
            transform: `scale(${zoom})`,
            transformOrigin: 'top left'
          }}
        >
          <img
            ref={imgRef}
            src={fileURL}
            alt="Preview"
            style={{
              maxWidth: '300px',
              maxHeight: '300px',
              width: 'auto',
              height: 'auto',
              display: 'block'
            }}
          />
          <PolygonDrawer
            imageUrl={fileURL}
            imageRef={imgRef}
            onCoordinatesChange={setCoordinates}
          />
        </div>
      )}

      {blobURL && (
        <a download={fileName} href={blobURL}>
          Download Output
        </a>
      )}

      <div className="status-container">
        <span className="status-icon"></span>
        <span className="status-text">{fileStatus}</span>
      </div>
    </div>
  );
}

export default App;
