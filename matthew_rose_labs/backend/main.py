from fastapi import FastAPI, File, UploadFile, HTTPException

app = FastAPI()

images = []

@app.post("/file")
async def add_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()   # read file as bytes
        with open(filename, "wb") as f:   # write in binary mode
            f.write(contents)
        images.append(filename)
        return {"filename": filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/")
def view_images(limit: int = 10):
    return images[:limit]
