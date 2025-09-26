from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

images = []

@app.post("/")
def create_image(img):
    images.append(img)
    return img