from PIL import Image
from io import BytesIO

def crop_image_with_coordinates(image_path, ext, angle=0.0, coordinates=None):
    """
    Crops an image based on the provided coordinates and saves the result.
    """
    try:
        img = Image.open(image_path.file)
        if coordinates:
            img = img.crop(coordinates) 
        if angle: 
            img = img.rotate(angle, expand=True)
        output_stream = BytesIO() #holds the memory as a temporary file 
        img.save(output_stream, format=ext)  
        output_stream.seek(0) #moves the byte counter back to index 0
        print(f"Image successfully cropped, rotated and saved")
        return output_stream.getvalue()
    
    
    except FileNotFoundError:
        print(f"Error: Image file not found")

    except Exception as e:
        print(f"An error occurred: {e}")


