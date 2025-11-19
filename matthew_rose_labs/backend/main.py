from fastapi import FastAPI, File, Form, UploadFile, HTTPException, Response
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from freeformimage import crop_image_with_coordinates
from io import BytesIO
import json

app = FastAPI()

images = []

origins = ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/")
async def add_image(file: UploadFile = File(...), fileName: str = Form(...), coordinates: Optional[str] = Form(default=None), angle: Optional[float] = Form(default=None)):
    try:
        ext = fileName.split('.')[-1].lower()
        if ext == "jpg":
            ext = "jpeg"

        if coordinates:
            coordinates = json.loads(coordinates) 
        output_image = crop_image_with_coordinates(file, ext, angle, coordinates)
        images.append(fileName)
        return Response(
            content=output_image,
            media_type=f"image/{ext.lower()}",
            headers={"Content-Disposition": f"attachment; filename={fileName}"}
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    
@app.get("/")
def view_images(limit: int = 10):
    return images[:limit]