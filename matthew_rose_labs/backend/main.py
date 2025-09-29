from fastapi import FastAPI, File, Form, UploadFile, HTTPException

app = FastAPI()

images = []

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
