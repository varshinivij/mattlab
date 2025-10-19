from PIL import Image
from io import BytesIO

def crop_image_with_coordinates(image_path, ext, angle, coordinates):
    """
    Crops an image based on the provided coordinates and saves the result.
    """
    try:
        img = Image.open(image_path.file)
        if coordinates:
            x = [coords[0] for coords in coordinates]
            y = [coords[1] for coords in coordinates]
            x1, x2 = min(x), max(x)
            y1, y2 = min(y), max(y)
            img = img.crop((x1,y1,x2,y2)) 
        if angle: 
            img = img.rotate(float(angle), expand=True)

        output_stream = BytesIO() #holds the memory as a temporary file 
        img.save(output_stream, format=ext)  
        output_stream.seek(0) #moves the byte counter back to index 0
        print(f"Image successfully cropped, rotated and saved")
        return output_stream.getvalue()
    
    
    except FileNotFoundError:
        print(f"Error: Image file not found")

    except Exception as e:
        print(f"An error occurred: {e}")


