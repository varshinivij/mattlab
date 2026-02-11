import cv2 as cv
import numpy as np
import os
from PIL import Image, ImageDraw


def get_regions(inpname):
    """
    Display image and collect multiple crop regions via mouse clicks.
    Press 'n' to start a new region, 'q' to finish all regions.
    Returns list of regions (each region is a list of coordinates).
    """
    regions = []
    current_coordinates = []

    def on_mouse(event, x, y, flags, param):
        nonlocal current_coordinates
        if event == cv.EVENT_LBUTTONDOWN:
            current_coordinates.append((x, y))
            print(
                f"Point added: {(x, y)} - Total points in current region: {len(current_coordinates)}"
            )

    # Read and show the image
    img = cv.imread(inpname)
    if img is None:
        raise FileNotFoundError(f"Image not found: {inpname}")

    cv.namedWindow("Image Window")
    cv.setMouseCallback("Image Window", on_mouse)

    print("\n=== Region Selection Mode ===")
    print("Click to add points to define a crop region.")
    print("Press 'n' to save current region and start a new one.")
    print("Press 'q' to finish selecting all regions.")
    print("=============================\n")

    while True:
        # Create a copy to draw on
        display_img = img.copy()

        # Draw all completed regions
        for idx, region in enumerate(regions):
            if len(region) >= 3:
                pts = cv.polylines(
                    display_img, [np.array(region)], True, (0, 255, 0), 2
                )
                # Draw region number
                centroid_x = sum(p[0] for p in region) // len(region)
                centroid_y = sum(p[1] for p in region) // len(region)
                cv.putText(
                    display_img,
                    f"R{idx + 1}",
                    (centroid_x, centroid_y),
                    cv.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (0, 255, 0),
                    2,
                )

        # Draw current region being created
        if len(current_coordinates) > 1:
            for i in range(len(current_coordinates) - 1):
                cv.line(
                    display_img,
                    current_coordinates[i],
                    current_coordinates[i + 1],
                    (255, 0, 0),
                    2,
                )
        for pt in current_coordinates:
            cv.circle(display_img, pt, 5, (0, 0, 255), -1)

        cv.imshow("Image Window", display_img)
        key = cv.waitKey(1) & 0xFF

        if key == ord("n"):  # New region
            if len(current_coordinates) >= 3:
                regions.append(current_coordinates[:])
                print(
                    f"Region {len(regions)} saved with {len(current_coordinates)} points."
                )
                current_coordinates = []
            else:
                print("Need at least 3 points to create a region!")
        elif key == ord("q"):  # Quit
            if len(current_coordinates) >= 3:
                regions.append(current_coordinates[:])
                print(f"Region {len(regions)} saved.")
            break

    cv.destroyWindow("Image Window")
    print(f"\nTotal regions selected: {len(regions)}")
    return regions


def process_region(img, coordinates, angle, transparent, bg_color):
    """
    Process a single region: crop, apply mask, rotate, and apply background.
    """
    width, height = img.size

    if coordinates and len(coordinates) >= 3:
        # Convert coordinates to tuples for PIL
        coord_tuples = [(int(c[0]), int(c[1])) for c in coordinates]

        # Calculate bounding box
        x = [c[0] for c in coord_tuples]
        y = [c[1] for c in coord_tuples]
        x1, x2 = max(0, min(x)), min(width, max(x))
        y1, y2 = max(0, min(y)), min(height, max(y))

        # Crop the image first to bounding box (optimization)
        cropped_img = img.convert("RGBA").crop((x1, y1, x2, y2))
        crop_width, crop_height = cropped_img.size

        # Create mask for the polygon (relative to cropped image)
        relative_coords = [(c[0] - x1, c[1] - y1) for c in coord_tuples]
        mask_img = Image.new("L", (crop_width, crop_height), 0)
        draw = ImageDraw.Draw(mask_img)
        draw.polygon(relative_coords, fill=255)

        if transparent:
            # Create transparent background
            bg = Image.new("RGBA", (crop_width, crop_height), (0, 0, 0, 0))
            masked_img = Image.composite(cropped_img, bg, mask_img)
        else:
            # Create colored background
            bg = Image.new("RGBA", (crop_width, crop_height), (*bg_color, 255))
            masked_img = Image.composite(cropped_img, bg, mask_img)
    else:
        # No coordinates, use entire image
        masked_img = img.convert("RGBA")

    # Apply rotation
    if angle:
        masked_img = masked_img.rotate(float(angle), expand=True)

    return masked_img


def main():
    """
    Crops multiple regions from images with optional transparency and custom background.
    All outputs are saved as PNG.
    """
    print("\n=== Image Processor ===")
    print("Exports all images as PNG format\n")

    DIR_PATH = input("Enter full path to image directory: ").strip()

    # Get background preference
    print("\nBackground options:")
    print("1. Transparent background")
    print("2. White background")
    print("3. Black background")
    print("4. Red background")
    print("5. Green background")
    print("6. Blue background")
    print("7. Yellow background")
    print("8. Cyan background")
    print("9. Magenta background")
    print("10. Gray background")
    bg_choice = input("Select option (1-10): ").strip()

    # Color presets
    color_presets = {
        "1": (None, True),  # (color, transparent)
        "2": ((255, 255, 255), False),  # White
        "3": ((0, 0, 0), False),  # Black
        "4": ((255, 0, 0), False),  # Red
        "5": ((0, 255, 0), False),  # Green
        "6": ((0, 0, 255), False),  # Blue
        "7": ((255, 255, 0), False),  # Yellow
        "8": ((0, 255, 255), False),  # Cyan
        "9": ((255, 0, 255), False),  # Magenta
        "10": ((128, 128, 128), False),  # Gray
    }

    transparent = False
    bg_color = (255, 255, 255)  # Default white

    if bg_choice in color_presets:
        bg_color, transparent = color_presets[bg_choice]
        if transparent:
            print("Using transparent background")
        else:
            color_names = {
                (255, 255, 255): "White",
                (0, 0, 0): "Black",
                (255, 0, 0): "Red",
                (0, 255, 0): "Green",
                (0, 0, 255): "Blue",
                (255, 255, 0): "Yellow",
                (0, 255, 255): "Cyan",
                (255, 0, 255): "Magenta",
                (128, 128, 128): "Gray",
            }
            print(f"Using {color_names.get(bg_color, 'custom')} background")
    else:
        print("Invalid choice. Using default white background.")

    # Get rotation angle (applied to all regions)
    angle_input = input("\nEnter rotation angle (0 for no rotation): ").strip()
    try:
        angle = float(angle_input)
    except ValueError:
        angle = 0
        print("Invalid angle. Using 0 degrees.")

    # Process each image
    image_files = [
        f for f in os.listdir(DIR_PATH) if f.lower().endswith((".png", ".jpg", ".jpeg"))
    ]

    if not image_files:
        print("No image files found in directory!")
        return

    print(f"\nFound {len(image_files)} image(s) to process")

    for img_name in image_files:
        image_path = os.path.join(DIR_PATH, img_name)

        try:
            print(f"\n--- Processing: {img_name} ---")
            img = Image.open(image_path)

            # Get multiple regions from user
            regions = get_regions(image_path)

            if not regions:
                print("No regions selected. Skipping...")
                continue

            # Process each region
            base_name = os.path.splitext(img_name)[0]

            for idx, coordinates in enumerate(regions):
                # Process the region
                processed_img = process_region(
                    img, coordinates, angle, transparent, bg_color
                )

                # Save as PNG
                if len(regions) == 1:
                    output_filename = f"{base_name}_cropped.png"
                else:
                    output_filename = f"{base_name}_region_{idx + 1}.png"

                output_path = os.path.join(DIR_PATH, output_filename)

                # Handle file name conflicts
                counter = 1
                original_output_path = output_path
                while os.path.exists(output_path):
                    name, ext = os.path.splitext(original_output_path)
                    output_path = f"{name}_{counter}{ext}"
                    counter += 1

                processed_img.save(output_path, format="PNG")
                print(f"Saved: {output_path}")

            print(f"Created {len(regions)} region(s) for {img_name}")

        except FileNotFoundError:
            print(f"Error: Image file not found: {img_name}")
        except Exception as e:
            print(f"An error occurred with {img_name}: {e}")

    print("\n=== Processing Complete ===")


if __name__ == "__main__":
    main()
