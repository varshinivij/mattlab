import React, { useState } from 'react';

function App() {
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState('Initial');

  async function sendItem() {
    const res = await fetch("http://127.0.0.1:8000", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ text: "Buy pizza", is_done: false })
    });

    const data = await res.json();   // wait until it's converted to JSON
    console.log(data);               // use the JSON result
  }


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

