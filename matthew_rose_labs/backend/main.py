from fastapi import FastAPI, File, Form, UploadFile, HTTPException, Response
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from freeformimage import crop_image_with_coordinates
from io import BytesIO
import json
import zipfile

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
async def add_image(
    file: UploadFile = File(...),
    fileName: str = Form(...),
    regions: Optional[str] = Form(default=None),
    angle: Optional[float] = Form(default=None),
    transparent: Optional[bool] = Form(default=False),
    bg_color: Optional[str] = Form(default=None),
):
    """
    Process image with multiple crop regions.

    Args:
        file: Uploaded image file
        fileName: Output filename
        regions: JSON string of regions (list of coordinate lists)
                Example: "[[[x1,y1], [x2,y2]], [[x3,y3], [x4,y4]]]"
        angle: Rotation angle
        transparent: If True, use transparent background
        bg_color: RGB color as "R,G,B" string (e.g., "255,255,255")
    """
    try:
        # Parse regions from JSON
        parsed_regions = None
        if regions:
            parsed_regions = json.loads(regions)
            # Ensure it's a list of lists
            if parsed_regions and not isinstance(parsed_regions[0], list):
                # Single region format - wrap it
                parsed_regions = [parsed_regions]

        # Parse background color
        bg_color_tuple = (255, 255, 255)  # Default white
        if bg_color:
            try:
                rgb = [int(x.strip()) for x in bg_color.split(",")]
                if len(rgb) == 3:
                    bg_color_tuple = tuple(rgb)
            except ValueError:
                pass  # Use default if parsing fails

        # Process image - returns list of BytesIO objects
        output_images = crop_image_with_coordinates(
            file,
            angle,
            parsed_regions,
            transparent if transparent is not None else False,
            bg_color_tuple,
        )

        images.append(fileName)

        if len(output_images) == 1:
            # Single image - return directly as PNG
            return Response(
                content=output_images[0].getvalue(),
                media_type="image/png",
                headers={
                    "Content-Disposition": f"attachment; filename={fileName.replace('.', '_')}_cropped.png"
                },
            )
        else:
            # Multiple images - return as ZIP
            zip_buffer = BytesIO()
            with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
                for idx, img_buffer in enumerate(output_images):
                    # Generate filename for each region
                    base_name = fileName.rsplit(".", 1)[0]
                    region_filename = f"{base_name}_region_{idx + 1}.png"
                    zip_file.writestr(region_filename, img_buffer.getvalue())

            zip_buffer.seek(0)
            zip_filename = f"{fileName.rsplit('.', 1)[0]}_regions.zip"

            return Response(
                content=zip_buffer.getvalue(),
                media_type="application/zip",
                headers={"Content-Disposition": f"attachment; filename={zip_filename}"},
            )

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/")
def view_images(limit: int = 10):
    return images[:limit]
