from PIL import Image
from io import BytesIO

def crop_image_with_coordinates(image_path, output_path, coordinates):
    """
    Crops an image based on the provided coordinates and saves the result.
    """
    try:
        buffer = BytesIO() #here, we create 
        buffer.read()
        img = Image.open(buffer)
        cropped_img = img.crop(coordinates)
        cropped_img.save(buffer, format="PNG")
        print(f"Image successfully cropped and saved")
        return output_path
    
    except FileNotFoundError:
        print(f"Error: Image file not found at {image_path}")
    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    crop_image_with_coordinates(
        "/Users/varshinivijay/Desktop/Projects/mattlab/matthew_rose_labs/backend/rose.png",
        "/Users/varshinivijay/Desktop/Projects/mattlab/matthew_rose_labs/backend/cropped_rose.png",
        (300, 50, 500, 500)
    )
