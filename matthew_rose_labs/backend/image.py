from PIL import Image
from io import BytesIO

def crop_image_with_coordinates(image_path, angle, ext, coordinates):
    """
    Crops an image based on the provided coordinates and saves the result.
    """
    try:
        img = Image.open(image_path.file)
        img = img.crop(coordinates) 
        out = img.rotate(angle, expand=True)
        output_stream = BytesIO() #holds the memory as a temporary file 
        out.save(output_stream, format=ext)  
        output_stream.seek(0) #moves the byte counter back to index 0
        print(f"Image successfully cropped and saved")
        return output_stream.getvalue()
    
    except FileNotFoundError:
        print(f"Error: Image file not found")

    except Exception as e:
        print(f"An error occurred: {e}")


