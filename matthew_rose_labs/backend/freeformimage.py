from PIL import Image, ImageDraw
from io import BytesIO
import numpy as np


def crop_single_region(
    img, coordinates, angle, transparent=False, bg_color=(255, 255, 255)
):
    """
    Crops a single region from an image based on coordinates.

    Args:
        img: PIL Image object
        coordinates: List of (x, y) tuples defining the crop region
        angle: Rotation angle
        transparent: If True, use transparent background; else use bg_color
        bg_color: RGB tuple for background color when not transparent

    Returns:
        BytesIO containing the processed image
    """
    width, height = img.size

    # Convert to RGBA to support transparency
    img_rgba = img.convert("RGBA")

    if coordinates and len(coordinates) >= 3:
        # Convert coordinates to tuples for PIL
        coord_tuples = [(int(c[0]), int(c[1])) for c in coordinates]

        # Calculate bounding box
        x = [c[0] for c in coord_tuples]
        y = [c[1] for c in coord_tuples]
        x1, x2 = max(0, min(x)), min(width, max(x))
        y1, y2 = max(0, min(y)), min(height, max(y))

        # Crop the image first to bounding box (optimization)
        cropped_img = img_rgba.crop((x1, y1, x2, y2))
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
        # No coordinates provided, use entire image
        masked_img = img_rgba

    # Apply rotation
    if angle:
        masked_img = masked_img.rotate(float(angle), expand=True)

    # Save as PNG (always PNG to support transparency)
    output_stream = BytesIO()
    masked_img.save(output_stream, format="PNG")
    output_stream.seek(0)

    return output_stream


def crop_image_with_coordinates(
    image_path, angle, regions, transparent=False, bg_color=(255, 255, 255)
):
    """
    Crops multiple regions from an image.

    Args:
        image_path: UploadFile or file object
        angle: Rotation angle (applied to all regions)
        regions: List of coordinate lists, each defining a crop region
                Example: [[[x1,y1], [x2,y2], ...], [[x1,y1], [x2,y2], ...]]
        transparent: If True, use transparent background
        bg_color: RGB tuple for background color

    Returns:
        List of BytesIO objects containing processed images
    """
    try:
        img = Image.open(image_path.file)

        results = []

        if not regions or len(regions) == 0:
            # No regions specified, process entire image
            output = crop_single_region(img, None, angle, transparent, bg_color)
            results.append(output)
        else:
            # Process each region
            for region_coords in regions:
                output = crop_single_region(
                    img, region_coords, angle, transparent, bg_color
                )
                results.append(output)

        print(f"Successfully processed {len(results)} region(s)")
        return results

    except FileNotFoundError:
        print("Error: Image file not found")
        raise

    except Exception as e:
        print(f"An error occurred: {e}")
        raise
