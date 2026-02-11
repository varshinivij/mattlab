# Matthew Rose Labs - Image Editor

A full-stack image editing tool that allows you to upload, crop, rotate, and save images. Supports both web and CLI interfaces with multi-region cropping, transparent backgrounds, and batch processing.

## Features

- **Upload & Crop**: Upload images and define custom crop regions using polygon selection
- **Multi-Region Support**: Define multiple crop regions per image (creates ZIP for 2+ regions)
- **Rotation**: Rotate images by any angle
- **Background Options**: 
  - Transparent background (PNG with alpha channel)
  - Custom background colors (White, Black, Red, Green, Blue, Yellow, Cyan, Magenta, Gray)
- **PNG Export**: All images export as PNG format
- **Batch Processing** (CLI): Apply same coordinates to all images in a folder
- **Coordinate Memory** (CLI): Save and reuse crop coordinates across sessions

## Project Structure

```
matthew_rose_labs/
├── backend/              # FastAPI backend
│   ├── cli_tool/         # Command-line interface
│   │   └── imageprocess.py
│   ├── freeformimage.py  # Image processing logic
│   ├── main.py          # FastAPI application
│   └── image.py         # Legacy image utilities
├── src/                 # React frontend
│   ├── App.jsx          # Main application
│   ├── PolygonDrawer.jsx # Region selection component
│   ├── api.jsx          # API configuration
│   └── ...
├── requirements.txt     # Python dependencies
└── package.json        # Node.js dependencies
```

## Installation

### Prerequisites

- **Python 3.8+** (for backend & CLI)
- **Node.js & npm** (for frontend) - Install from [nodejs.org](https://nodejs.org/)
- **OpenCV dependencies** (for CLI tool)

### System Dependencies

**macOS:**
```bash
brew install opencv
```

**Ubuntu/Debian:**
```bash
sudo apt-get install python3-opencv
```

### Setup

1. **Clone the repository:**
```bash
git clone https://github.com/varshinivij/mattlab.git
cd mattlab
```

2. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

3. **Install Node.js dependencies:**
```bash
npm install
```

## Usage

### Web Interface

Start both the backend and frontend servers:

**Terminal 1 - Backend:**
```bash
cd backend
python3 -m uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Open your browser and navigate to: `http://localhost:5173`

**Workflow:**
1. Upload an image (JPEG, JPG, or PNG)
2. (Optional) Enter a custom output filename
3. Set rotation angle (0 for no rotation)
4. Choose background: Transparent or select a color
5. Click on the image to define crop regions
6. Click "✓ Finish Region" to save each region
7. Click "🚀 Process Image" when done
8. Download the result (PNG for single region, ZIP for multiple)

### CLI Tool

**Basic usage:**
```bash
cd backend/cli_tool
python3 imageprocess.py
```

**Workflow:**
1. Enter the full path to your image directory
2. Choose to use saved coordinates or define new ones
3. Select background option (1-10)
4. Enter rotation angle
5. Click on the first image to define regions
6. Choose to save coordinates for all images in the folder
7. The same regions will be applied to all images automatically

**Coordinate Memory:**
- The tool automatically detects saved coordinates from previous runs (`.saved_coordinates.json`)
- When processing multiple images, coordinates from the first image are reused for all others
- You can save coordinates for future sessions

## API Endpoints

### POST `/`
Process an image with regions and options.

**Parameters:**
- `file` (required): Image file (multipart/form-data)
- `fileName` (required): Output filename
- `regions` (optional): JSON array of coordinate arrays `[[[x1,y1], [x2,y2], ...], ...]`
- `angle` (optional): Rotation angle in degrees
- `transparent` (optional): Boolean for transparent background
- `bg_color` (optional): RGB string "R,G,B" (ignored if transparent is true)

**Returns:**
- Single region: PNG image
- Multiple regions: ZIP file containing multiple PNGs

### GET `/`
View list of recently processed images.

**Parameters:**
- `limit` (optional): Number of images to return (default: 10)

## Technical Details

### Dependencies

**Python:**
- FastAPI - Web framework
- Pillow (PIL) - Image processing
- OpenCV - Computer vision (CLI tool)
- Uvicorn - ASGI server
- NumPy - Numerical operations

**JavaScript:**
- React 19 - UI framework
- Vite - Build tool
- Axios - HTTP client

### Image Processing

Images are processed using Pillow (PIL) with the following pipeline:
1. Load image and convert to RGBA
2. Crop to bounding box of polygon
3. Apply polygon mask for irregular shapes
4. Apply background (transparent or colored)
5. Rotate by specified angle
6. Export as PNG

## Development

### Backend Development

The backend uses FastAPI with automatic reloading during development:
```bash
cd backend
python3 -m uvicorn main:app --reload --port 8000
```

### Frontend Development

The frontend uses Vite with hot module replacement:
```bash
npm run dev
```

### Running Tests

```bash
# Backend tests (if available)
cd backend
pytest

# Frontend linting
npm run lint
```

## Troubleshooting

### Backend won't start (port 8000 in use)
```bash
lsof -ti:8000 | xargs kill -9
```

### CORS errors in browser
Make sure the backend is running on port 8000 and the frontend on port 5173. The backend is configured to accept requests from these origins.

### CLI tool not finding images
Ensure the directory path is absolute and the directory contains image files (.png, .jpg, .jpeg).

## License

[Your License Here]

## Contributing

[Contributing Guidelines Here]

## Support

For issues and feature requests, please use the GitHub issue tracker: https://github.com/varshinivij/mattlab/issues
