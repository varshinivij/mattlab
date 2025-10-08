from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from image import crop_image_with_coordinates
from io import BytesIO

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
        ext = fileName.split('.')[-1].lower()
        cropped_image = crop_image_with_coordinates(file, fileName, ext, ((x, y, x+200, y+200)))
        media_type = f"image/{ext}" if ext != "jpg" else "image/jpeg"
        return Response(content=cropped_image.getvalue(), media_type=media_type)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@app.get("/")
def view_images(limit: int = 10):
    return images[:limit]

