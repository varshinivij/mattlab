import React, { useState } from 'react';

function App() {
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState('Initial');

  const handleFileChange = (e) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setStatus('Loading');
      setImage(file);
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

      const data = await result.json();
      setStatus('Completed');
    } catch (error) {
      setStatus('Error');
    }
  };

  return (
    <div>
      <p className='main-title'>Welcome to Matthew-Rose Labs</p>
      <input type='file' onChange={handleFileChange} />
      {image && (
        <img
          src={URL.createObjectURL(image)}
          style={{ maxWidth: '300px', marginTop: '10px' }}
        />
      )}
      <p>{status}</p>
    </div>
  );
}

export default App;
