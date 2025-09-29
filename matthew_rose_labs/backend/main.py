from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

images = []

origins = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/")
async def add_image(fileName: str = Form(...), file: UploadFile = File(...)):
    try:
        contents = await file.read()   # read file as bytes
        with open(fileName, "wb") as f:   # write in binary mode
            f.write(contents)
        images.append(fileName)
        return {"filename": fileName}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.get("/")
def view_images(limit: int = 10):
    return images[:limit]
