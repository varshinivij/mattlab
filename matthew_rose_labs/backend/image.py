from PIL import Image
from io import BytesIO

def crop_image_with_coordinates(image_path, output_name, coordinates):
    """
    Crops an image based on the provided coordinates and saves the result.
    """
    try:
        with open(image_path, 'rb') as f:  # 'rb' opens in binary read mode
            image_bytes = f.read()
        image_stream = BytesIO(image_bytes) 
        img = Image.open(image_stream)
        cropped_img = img.crop(coordinates)
        cropped_img.name = output_name
        output_stream = BytesIO()
        cropped_img.save(output_stream, format=output_name[-3]) #i think maybe write to buffer 
        print(f"Image successfully cropped and saved")
        return output_stream
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
