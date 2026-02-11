import React, { useState, useEffect, useRef } from 'react';
import api from './api';
import PolygonDrawer from './PolygonDrawer';

const allowedFiles = ['.jpeg', '.jpg', '.png'];
const invalidCharsList = ["<", ">", ":", "\"", "/", "\\", "|", "?", "*"];

// Predefined color options
const colorOptions = [
  { name: 'White', value: '255,255,255' },
  { name: 'Black', value: '0,0,0' },
  { name: 'Red', value: '255,0,0' },
  { name: 'Green', value: '0,255,0' },
  { name: 'Blue', value: '0,0,255' },
  { name: 'Yellow', value: '255,255,0' },
  { name: 'Cyan', value: '0,255,255' },
  { name: 'Magenta', value: '255,0,255' },
  { name: 'Gray', value: '128,128,128' },
];

function App() {
  const [file, setFile] = useState(null);
  const [fileStatus, setFileStatus] = useState('No File Chosen');
  const [fileName, setFileName] = useState(null);
  const [fileNameStatus, setFileNameStatus] = useState(null);
  const [fileURL, setFileURL] = useState(null);
  const [angle, setAngle] = useState(0.0);

  const [blobURL, setBlobURL] = useState(null);
  const [isZipFile, setIsZipFile] = useState(false);
  const [regions, setRegions] = useState([]);
  
  // Background options
  const [transparent, setTransparent] = useState(false);
  const [bgColor, setBgColor] = useState('255,255,255');
  
  // ZIP filename for multiple regions
  const [zipFileName, setZipFileName] = useState('');

  const [zoom, setZoom] = useState(1);

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
    formData.append("fileName", fileName || file.name);

    // Process multiple regions with scaling
    if (regions && regions.length > 0 && imgRef.current) {
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

      const scaledRegions = regions.map(region => 
        region.map(([x, y]) => [
          Math.round(x * scaleX),
          Math.round(y * scaleY)
        ])
      );

      formData.append("regions", JSON.stringify(scaledRegions));
    } else if (regions && regions.length > 0) {
      formData.append("regions", JSON.stringify(regions));
    }

    if (angle) formData.append("angle", angle);
    formData.append("transparent", transparent);
    if (!transparent && bgColor) {
      formData.append("bg_color", bgColor);
    }

    api.post('/', formData, { responseType: 'blob' })
      .then((response) => {
        const contentType = response.headers['content-type'];
        const isZip = contentType === 'application/zip';
        setIsZipFile(isZip);
        
        const url = URL.createObjectURL(response.data);
        setBlobURL(url);
        
        if (isZip) {
          setFileStatus(`Success! Created ${regions.length || 1} region(s). Download ZIP below.`);
        } else {
          setFileStatus('File processed successfully. Download below.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setFileStatus(`Error: ${error.response?.data?.detail || error.message}`);
      });
  }

  function clear() {
    setFile(null);
    setFileStatus('No File Chosen');
    setFileName(null);
    setFileNameStatus(null);
    setAngle(0.0);
    setRegions([]);
    setZoom(1);
    setTransparent(false);
    setBgColor('255,255,255');
    setIsZipFile(false);
    setZipFileName('');

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
      setRegions([]);
      setZoom(1);
      setBlobURL(null);
      setFileStatus('Image loaded. Define crop regions below.');
    } else {
      setFileStatus("Error: Empty file");
    }
  };

  const handleFileName = (name) => {
    if (file && !name) {
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      setFileName(`${baseName}_cropped`);
      setFileNameStatus('Default');
      return;
    }
    if (name) {
      if (invalidCharsList.some(char => name.includes(char))) {
        setFileNameStatus("Error: Invalid Characters");
        return;
      }
      setFileName(name);
      setFileNameStatus(null);
    }
  };

  return (
    <div>
      <p className='main-title'>Welcome to Matthew-Rose Labs</p>

      <div className="input-group">
        <label>Choose File:</label>
        <input type='file' onChange={handleFileUpload} accept="image/jpeg,image/jpg,image/png" />
      </div>

      <div className="input-group">
        <label>[OPTIONAL] Output Filename:</label>
        <input
          type='text'
          value={fileName || ''}
          onChange={(e) => setFileName(e.target.value)}
          onBlur={(e) => handleFileName(e.target.value)}
          placeholder="Enter filename"
        />
        {fileNameStatus && (
          <small style={{ color: fileNameStatus.startsWith('Error') ? '#ff4141' : '#00ff41' }}>
            {fileNameStatus}
          </small>
        )}
      </div>

      <div className="input-group">
        <label>Rotation Angle:</label>
        <input 
          type='number' 
          value={angle}
          onChange={(e) => setAngle(e.target.value)} 
          placeholder="0"
        />
      </div>

      <div className="input-group">
        <label>Background:</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '5px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={transparent}
              onChange={(e) => setTransparent(e.target.checked)}
            />
            Transparent
          </label>
          
          {!transparent && (
            <>
              <span>or</span>
              <select
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                style={{
                  padding: '5px',
                  backgroundColor: '#0a0a0a',
                  color: '#00ff41',
                  border: '1px solid #00ff41',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {colorOptions.map((color) => (
                  <option key={color.value} value={color.value}>
                    {color.name}
                  </option>
                ))}
              </select>
              <div
                style={{
                  display: 'inline-block',
                  width: '25px',
                  height: '25px',
                  border: '1px solid #00ff41',
                  backgroundColor: `rgb(${bgColor})`
                }}
              />
            </>
          )}
        </div>
      </div>

      {fileURL && (
        <div style={{ marginTop: '30px', border: '2px solid #00ff41', padding: '20px', borderRadius: '8px' }}>
          <div style={{ 
            backgroundColor: '#1a4d1a', 
            padding: '15px', 
            borderRadius: '5px', 
            marginBottom: '20px',
            border: '1px solid #00ff41'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#00ff41' }}>✂️ Multi-Region Crop Mode</h3>
            <p style={{ margin: '0', color: '#00ff41', fontSize: '14px' }}>
              <strong>Step 1:</strong> Click on the image to define points for a crop region<br/>
              <strong>Step 2:</strong> Click "✓ Finish Region" to save it<br/>
              <strong>Step 3:</strong> Repeat to add more regions, or click "Process Image" when done
            </p>
            {regions.length > 0 && (
              <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#0a2a0a', borderRadius: '4px' }}>
                <strong>📦 {regions.length} region(s) saved</strong>
                {regions.length > 1 && <span> - Will create ZIP file with all regions</span>}
              </div>
            )}
            {regions.length > 1 && (
              <div style={{ marginTop: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#00ff41' }}>
                  [OPTIONAL] ZIP Filename:
                </label>
                <input
                  type='text'
                  value={zipFileName}
                  onChange={(e) => setZipFileName(e.target.value)}
                  placeholder={`${(fileName || file.name).replace(/\.[^/.]+$/, '')}_regions`}
                  style={{
                    padding: '8px',
                    backgroundColor: '#0a0a0a',
                    color: '#00ff41',
                    border: '1px solid #00ff41',
                    borderRadius: '4px',
                    width: '250px'
                  }}
                />
                <small style={{ display: 'block', marginTop: '5px', color: '#888' }}>
                  Default: {(fileName || file.name).replace(/\.[^/.]+$/, '')}_regions.zip
                </small>
              </div>
            )}
          </div>
          
          {/* Zoom controls */}
          <div style={{ marginBottom: '10px' }}>
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>−</button>
            <span style={{ margin: '0 10px' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button onClick={() => setZoom(z => Math.min(3, z + 0.1))}>+</button>
          </div>

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
              onRegionsChange={setRegions}
            />
          </div>

          {/* Action Buttons - Moved after image */}
          <div style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              type="submit"
              disabled={!file || fileNameStatus?.startsWith('Error')}
              onClick={postFileRequest}
              style={{
                padding: '12px 30px',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: regions.length > 0 ? '#1a4d1a' : '#4d4d4d',
                color: '#00ff41',
                border: '2px solid #00ff41',
                borderRadius: '6px',
                cursor: !file || fileNameStatus?.startsWith('Error') ? 'not-allowed' : 'pointer',
                opacity: !file || fileNameStatus?.startsWith('Error') ? 0.5 : 1
              }}
            >
              {regions.length > 0 ? `🚀 Process ${regions.length} Region(s)` : '🚀 Process Image'}
            </button>

            <button 
              type="button" 
              onClick={clear}
              style={{
                padding: '12px 30px',
                fontSize: '16px',
                backgroundColor: '#4d1a1a',
                color: '#ff4141',
                border: '2px solid #ff4141',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🗑 Clear All
            </button>
          </div>
        </div>
      )}

      {blobURL && (
        <div style={{ marginTop: '20px' }}>
          <a 
            download={isZipFile 
              ? `${zipFileName || (fileName || file.name).replace(/\.[^/.]+$/, '')}_regions.zip` 
              : `${(fileName || file.name).replace(/\.[^/.]+$/, '')}_cropped.png`}
            href={blobURL}
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#1a4d1a',
              color: '#00ff41',
              border: '1px solid #00ff41',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            {isZipFile ? '⬇ Download ZIP (Multiple Regions)' : '⬇ Download PNG'}
          </a>
        </div>
      )}

      <div className="status-container" style={{ marginTop: '20px' }}>
        <span className="status-icon"></span>
        <span className="status-text">{fileStatus}</span>
      </div>
    </div>
  );
}

export default App;
