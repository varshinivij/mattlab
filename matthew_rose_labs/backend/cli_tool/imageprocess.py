from PIL import Image
from io import BytesIO

from pynput import mouse
import logging

DIR_PATH = './img'


logging.basicConfig(filename="mouse_log.txt", level=logging.DEBUG, format='%(asctime)s: %(message)s')

def on_click(x, y, button, pressed):
    """Called when a mouse button is clicked or released."""
    if pressed:
        logging.info('Mouse clicked at ({0}, {1}) with {2}'.format(x, y, button))
    # To stop the listener after a specific condition (e.g., a certain button press),
    # you can return False from this callback.
    # if button == mouse.Button.right:
    #     return False


with mouse.Listener(
    on_click=on_click,
    on_scroll=on_scroll) as listener:
    listener.join()


def get_input(enabled):
    angle = int(input("Enter angle to rotate image:"))
    if enabled: 
        out_file = input("Enter output file name:")

def main():
    """
    Crops an image based on the provided coordinates and saves the result.
    """
    enabled = bool(input("Do you want to change file names? Press 0(NO) or 1(TRUE)"))
    ext = input("Select PNG or JPG output format")
    if ext.lower() not in ["png", "jpg"]:
        ext = "jpg"
        print("Reverting to JPG")

    for img_name in os.listdir(DIR_PATH):
        image_path = os.path.join(DIR_PATH, img_name)
        try:
            img = Image.open(image_path.file)
            angle = angle if angle else 0
            if coordinates:
                x = [coords[0] for coords in coordinates]
                y = [coords[1] for coords in coordinates]
                x1, x2 = min(x), max(x)
                y1, y2 = min(y), max(y)
                img = img.crop((x1,y1,x2,y2)) 
            img = img.rotate(float(angle), expand=True)
            img.save(image_path, format=ext)  
            print(f"Image successfully cropped, rotated and saved")
        
        
        except FileNotFoundError:
            print(f"Error: Image file not found")

        except Exception as e:
            print(f"An error occurred: {e}")

