from PIL import Image, ImageDraw
from io import BytesIO
import numpy as np

def crop_image_with_coordinates(image_path, ext, coordinates):
    """
    Crops an image based on a user-drawn irregular shape (coordinates)
    and returns the masked color image as bytes.
    """
    try:
        img = Image.open(image_path.file).convert("RGB")
        width, height = img.size

        mask_img = Image.new("L", (width, height), 0)  # 0 = hidden for a BLANK MASK

        draw = ImageDraw.Draw(mask_img)
        draw.polygon(coordinates, fill=255)  # inside = 255 (keep) (creates a polygonal shape) 255 --> ACTS LIKE 1 

        masked_img = Image.composite(
            img,
            Image.new("RGB", img.size, (255, 255, 255)),  # white background --> easy for them to specify image
            mask_img
        )
        output_stream = BytesIO()
        masked_img.save(output_stream, format=ext)
        output_stream.seek(0)

        print("Image successfully cropped and masked")
        return output_stream.getvalue()

    except FileNotFoundError:
        print("Error: Image file not found")

    except Exception as e:
        print(f"An error occurred: {e}")
