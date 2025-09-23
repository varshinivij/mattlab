import {useState, useEffect} from 'react';

function App() {
  const [image, setImage] = useState(None);

  const handleUpload = (file) => {
    if (file) {
      setImage(URL.createObjectURL(file))
    }
  }

  return (
    <div>
      <p className='main-title'>Welcome to Matthew-Rose Labs</p>
      <input type='file' onClick={(e) => handleUpload(e.target.files[0])}> Upload File </input>
      {image && <img src={image}></img>}
    </div>
  )
}