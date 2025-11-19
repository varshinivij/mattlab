from PIL import Image, ImageDraw
from io import BytesIO
import numpy as np

def crop_image_with_coordinates(image_path, ext, angle, coordinates):
    """
    Crops an image based on a user-drawn irregular shape (coordinates)
    and returns the masked color image as bytes.
    """
    try:
        img = Image.open(image_path.file).convert("RGB")
        width, height = img.size

        mask_img = Image.new("L", (width, height), 0)  # create a blank black mask 

        draw = ImageDraw.Draw(mask_img)
        draw.polygon(coordinates, fill=255)  # white inside the polygon 

        masked_img = Image.composite(
            img,
            Image.new("RGB", img.size, (255, 255, 255)),  # white background --> easy for them to specify image
            mask_img
        )

        if angle:
            img = img.rotate(float(angle), expand=True)

        output_stream = BytesIO()
        masked_img.save(output_stream, format=ext) 
        output_stream.seek(0) #moves the buffer to 0

        print("Image successfully cropped and masked")
        return output_stream.getvalue() 

    except FileNotFoundError:
        print("Error: Image file not found")

    except Exception as e:
        print(f"An error occurred: {e}")
