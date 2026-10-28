from pathlib import Path

from PIL import Image


root = Path(__file__).resolve().parent
image_path = root / "Survey_Results_A3_Landscape.png"
output_path = root / "Survey_Results_A3_Landscape.pdf"

image = Image.open(image_path).convert("RGB")
image.save(
    output_path,
    "PDF",
    resolution=300.0,
    quality=95,
    title="Left-behind Children Survey Results",
    author="Spy Kids",
)

print(output_path)
