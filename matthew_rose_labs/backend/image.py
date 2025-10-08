from PIL import Image
from io import BytesIO

def crop_image_with_coordinates(image_path, ext, coordinates):
    """
    Crops an image based on the provided coordinates and saves the result.
    """
    try:
        img = Image.open(image_path.file)
        cropped_img = img.crop(coordinates)

        output_stream = BytesIO() #holds the memory as a temporary file 
        cropped_img.save(output_stream, format=ext)  
        output_stream.seek(0) #moves the byte counter back to index 0
        print(f"Image successfully cropped and saved")
        return output_stream.getvalue()
    
    except FileNotFoundError:
        print(f"Error: Image file not found")

    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    crop_image_with_coordinates(
        "/Users/varshinivijay/Desktop/Projects/mattlab/matthew_rose_labs/backend/rose.png",
        "/Users/varshinivijay/Desktop/Projects/mattlab/matthew_rose_labs/backend/cropped_rose.png",
        (300, 50, 500, 500)
    )
