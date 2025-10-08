from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from image import crop_image_with_coordinates

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
async def add_image(x:int=0, y:int=0, fileName: str = Form(...), file: UploadFile = File(...)):
    try:
        cropped_image = crop_image_with_coordinates(file, fileName, ((x, y, x, y)))
        images.append(fileName)
        return {"filename": fileName}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.get("/")
def view_images(limit: int = 10):
    return images[:limit]
