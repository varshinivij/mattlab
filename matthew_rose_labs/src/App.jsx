import React, { useState, useEffect } from 'react';
import axios from 'axios';

const allowedFiles = ['.jpeg', '.jpg', '.png'];


function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('No File Chosen');
  const [fileName, setFileName] = useState('output.png');
  const [fileURL, setFileURL] = useState(null);

  useEffect( () => {
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
    formData.append("file", file);
    formData.append("fileName", fileName);
    axios.post('/api', formData)
      .then(response => setStatus(`File uploaded: ${response.data}`))
      .catch(error => setStatus(`Error Encountered: ${error.message}`));
  }

  const handleFileUpload = (e) => {
    if (e.target.files) {
      const file = e.target.files[0];
      if (file.size > 5000000) {
        setStatus("Error: File size larger than 5MB");
        return;
      } else if (!file.type.startsWith('image/')) {
        setStatus("Error: Upload an image");
        return;
      } else if (!allowedFiles.some(ext => file.name.toLowerCase().endsWith(ext))) {
        setStatus("Error: File type not supported - upload PNG, JPEG or JPG");
        return;
      }
      setFile(file);
    } else {
      setStatus("Error: Empty file");
    }
  }

  return (
    <div>
      <p className='main-title'>Welcome to Matthew-Rose Labs</p>

      <label> Choose File:
        <input type='file' onChange={handleFileUpload}/>
      </label>
      <label > FileName:
        <input type='text' onChange={(e => setFileName(e.target.value))}/>
      </label>
      <button
        type="submit"
        onClick={() => {
          if (file && fileName) {
            postFileRequest();
          }
        }}>
        Submit
      </button>

      {fileURL && (
        <img
          src={fileURL}
          style={{ maxWidth: '300px', marginTop: '10px' }}
        />
      )}
      <p>{status}</p>
    </div>
  );
}

export default App;
