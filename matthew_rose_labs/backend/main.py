from fastapi import FastAPI, File, Form, UploadFile, HTTPException, Response
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from image import crop_image_with_coordinates
from io import BytesIO

app = FastAPI()

images = []

origins = ["http://localhost:5173", "http://127.0.0.1:5173"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/")
async def add_image(coordinates: List, fileName: str = Form(...), file: UploadFile = File(...)):
    try:
        ext = fileName.split('.')[-1].lower()
        x1, x2 = min(coordinates[:][0]), max(coordinates[:][0])
        y1, y2 = min(coordinates[:][0]), max(coordinates[:][0])
        cropped_image = crop_image_with_coordinates(file, ext, ((x1, y1, x2, y2)))
        media_type = f"image/{ext}"
        images.append(fileName)
        return Response(content=cropped_image, media_type=media_type)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.get("/")
def view_images(limit: int = 10):
    return images[:limit]

