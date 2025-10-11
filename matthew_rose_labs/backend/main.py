from fastapi import FastAPI, File, Form, UploadFile, HTTPException, Response
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from image import crop_image_with_coordinates
from io import BytesIO
import json

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
async def add_image(coordinates: str = Form(...), angle: float = Form(...), fileName: str = Form(...), file: UploadFile = File(...)):
    try:
        ext = fileName.split('.')[-1].lower()
        coordinates = json.loads(coordinates)
        if coordinates:
            x = [px[0] for px in coordinates]
            y = [py[1] for py in coordinates]

            x1, x2 = min(x), max(x)
            y1, y2 = min(y), max(y)
            
        if coordinates and angle:
            output_image = crop_image_with_coordinates(file, angle, ext, ((x1, y1, x2, y2)))
        elif angle:
            output_image = crop_image_with_coordinates(file, ext, angle)
        else:
            output_image = crop_image_with_coordinates(file, ext, ((x1, y1, x2, y2)))
        images.append(fileName)
        return Response(content=output_image, media_type=f"image/{ext}", headers={"Content-Disposition": "attachment"})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.get("/")
def view_images(limit: int = 10):
    return images[:limit]