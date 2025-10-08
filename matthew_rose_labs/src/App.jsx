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

  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFileURL(url);
    return () => {
      setFileURL(null);
      URL.revokeObjectURL(url);
    }
  }, [file]);

  function postFileRequest() {
    const formData = new FormData();
    formData.append("x", x);
    formData.append("y", y);
    formData.append("file", file);
    formData.append("fileName", fileName);
    api.post('/', formData)
      .then((response) => {
        setFile(response)
        setFileStatus('File Uploaded Successfully')
      })
      .catch(error => setFileStatus(`Error Encountered: ${error.message}`));
  }

  function clear() {
    setFile(null);
    setFileStatus('No File Chosen');
    setFileName(null);
    setFileNameStatus(null);
    if (fileURL) {
      URL.revokeObjectURL(fileURL);
      setFileURL(null);
    }
  }

  const handleFileUpload = (e) => {
    if (e.target.files) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {  // clearer than 5000000
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
      </div>
    
      <input type='number' onChange={(e) => setX(e.target.value)}> Enter the X coordinates </input>
      <input type='number' onChange={(e) => setY(e.target.value)}> Enter the Y coordinates </input>

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
        <img
          src={fileURL}
          alt="Preview"
          style={{ maxWidth: '300px', marginTop: '10px' }}
        />
      )}

      {fileStatus == 'File Uploaded Successfully' && (
        <a download={fileName} href={file}> Download Output </a>
      )}

      <div className="status-container">
        <span className="status-icon"></span>
        <span className="status-text">{fileStatus}</span>
      </div>
    </div>
  );
}

export default App;
