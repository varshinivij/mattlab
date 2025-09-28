import React, { useState } from 'react';
import api from '/api.jsx';

const files = ['.jpeg', '.jpg', '.png'];

function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('Initial');

  function postRequest() {
    axios.post('api', file)
      .then( (response) => setStatus("File uploaded: ${response}"))
      .catch( (error) => setStatus("Error Encountered: ${error}"))
  };


  const handleFileChange = (e) => {
    if (e.target.files) {
      const file = e.target.files[0];
      if (file.size > 5000000) {
        setStatus("Error: File size larger than 5MB");
      } else if (file.type.startsWith != '/image'){
        setStatus("Error: Please upload an image");
      } else if (file.name )
      setStatus('Loading');
      setFile(file);
      handleUpload(file);
    }
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await fetch('http://localhost:5173/matthew_rose_labs', {
        method: 'POST',
        body: formData,
      });

      if (!result.ok) {
        throw new Error(`Server error: ${result.status}`);
      }

      const data = await result.json().catch(() => null); // fallback if not JSON
      console.log("Upload success:", data);
      setStatus('Completed ');
    } catch (error) {
      console.error("Upload failed:", error);
      setStatus('Error');
    }
  };


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
}

export default App;

