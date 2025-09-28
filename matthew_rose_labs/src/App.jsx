import React, { useState } from 'react';
import api from './api.jsx';  
import axios from 'axios';

const allowedFiles = ['.jpeg', '.jpg', '.png'];

function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('Initial');

  function postRequest(newFile) {
    const formData = new FormData();
    //standard JS object for file uploads
    formData.append("File", newFile);
    axios.post('api', formData)
      .then( (response) => setStatus(`File uploaded: ${response.data}`))
      .catch( (error) => setStatus(`Error Encountered: ${error.message}`))
  };


  const handleFileChange = (e) => {
    if (e.target.files) {
      const file = e.target.files[0];
      if (file.size > 5000000) {
        setStatus("Error: File size larger than 5MB");
        return;
      } else if (!file.type.startsWith('image/')){
        setStatus("Error: Upload an image");
        return;
      } else if (!allowedFiles.some(ext => file.name.toLowerCase().endsWith(ext))) {
        setStatus("Error: File type not supported - upload PNG, JPEG or JPG");
        return;
      }
      setFile(file); 
      postRequest(file);
    } else {
      setStatus("Error: Empty file");
    }
    }



    return (
      <div>
        <p className='main-title'>Welcome to Matthew-Rose Labs</p>
        <input type='file' onChange={handleFileChange} />
        {file && (
          <img
            src={URL.createObjectURL(file)}
            style={{ maxWidth: '300px', marginTop: '10px' }}
          />
        )}
        <p>{status}</p> 
      </div>
    );
};


export default App;

