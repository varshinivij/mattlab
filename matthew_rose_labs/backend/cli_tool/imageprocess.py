import cv2 as cv
import os
from PIL import Image

#needs to be exported as png 
#layer images with a neg bg ??
#REMOVE BACKGROUND ALTOGETHER! or giving them an option 
#need to have an appended ending to each file 
#try to allow multiple regions into one file
 
def get_input(inpname, enabled):
    """
    Display image, collect crop coordinates via mouse clicks, rotation angle, and output filename.
    """
    coordinates = []

    def on_mouse(event, x, y, flags, param):
        if event == cv.EVENT_LBUTTONDOWN:
            coordinates.append((x, y))
            print(f"Point added: {(x, y)}")

    # Read and show the image
    img = cv.imread(inpname)
    if img is None:
        raise FileNotFoundError(f"Image not found: {inpname}")

    cv.namedWindow("Image Window")
    cv.setMouseCallback("Image Window", on_mouse)

    print("Click on points to define crop area. Press 'q' to finish.")
    while True:
        cv.imshow("Image Window", img)
        key = cv.waitKey(1) & 0xFF
        if key == ord('q'):  # quit on 'q'
            break
    cv.destroyWindow("Image Window")
    angle = int(input("Enter angle to rotate image: "))

    if enabled:
        outname = input("Enter output file name (leave empty to overwrite): ").strip()
        if not outname:
            outname = os.path.basename(inpname)
    else:
        outname = os.path.basename(inpname)
    return coordinates, angle, outname

def main():
    """
    Crops and rotates images in a directory, filling background with white.
    """
    #change this to make sure coordinates are saved, and they dont need to reenter!!!!!!
    DIR_PATH = input("Enter full path to image directory: ").strip()
    enabled = input("Do you want to change output file names? Press 0(NO) or 1(YES): ").strip() == "1"

    ext = input("Select output format (PNG or JPG): ").strip().lower()
    if ext not in ["png", "jpg"]:
        ext = "jpg"
        print("Reverting to JPG")

    # map to PIL format
    pil_format = "PNG" if ext == "png" else "JPEG"

    for img_name in os.listdir(DIR_PATH):
        image_path = os.path.join(DIR_PATH, img_name)
        if not img_name.lower().endswith((".png", ".jpg", ".jpeg")):
            continue  # skip non-images

        try:
            img = Image.open(image_path)

            # Get user input per image
            coordinates, angle, outname = get_input(image_path, enabled)
            output_path = os.path.join(DIR_PATH, outname)

            # Crop if coordinates exist
            if coordinates:
                x = [c[0] for c in coordinates]
                y = [c[1] for c in coordinates]
                x1, x2 = min(x), max(x)
                y1, y2 = min(y), max(y)
                img = img.crop((x1, y1, x2, y2))

            # Rotate and fill background with white
            img = img.convert("RGBA")  # ensure alpha channel
            rotated = img.rotate(float(angle), expand=True)
            # Create white background
            bg = Image.new("RGB", rotated.size, (255, 255, 255))
            bg.paste(rotated, (0, 0), rotated)  # paste rotated image on white bg

            # Save
            bg.save(output_path, format=pil_format)
            print(f"Saved: {output_path}")

        except FileNotFoundError:
            print(f"Error: Image file not found: {img_name}")
        except Exception as e:
            print(f"An error occurred with {img_name}: {e}")

if __name__ == "__main__":
    main()
