from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

images = []

@app.post("/", response_model=formData())
def add_image(img):
    images.append(img)
    return img

@app.get("/")
def view_images(limit=len(images)):
    return images[:limit]
    