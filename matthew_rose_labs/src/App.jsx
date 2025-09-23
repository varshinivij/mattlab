import { useState } from 'react';

function App() {
  const [image, setImage] = useState(null);

  const handleUpload = (file) => {
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <div>
      <p className='main-title'>Welcome to Matthew-Rose Labs</p>
      <input type='file' onChange={(e) => handleUpload(e.target.files[0])} />
      {image && <img src={image} alt="Uploaded" style={{ maxWidth: '300px', marginTop: '10px' }} />}
    </div>
  );
}

export default App;
