from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "Survey_Results_A3_Landscape.png"

CANVAS_W, CANVAS_H = 4961, 3508
PAGE_MARGIN = 90
TITLE_H = 210
ROW_GAP = 32
COL_GAP = 28
ROW_H = (CANVAS_H - TITLE_H - PAGE_MARGIN * 2 - ROW_GAP * 3) // 4

ROWS = [
    [1, 2, 3, 4],
    [5, 6, 7],
    [8, 9, 10],
    [11, 12, 13],
]


def font(size, bold=False):
    candidates = [
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
        Path("C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


canvas = Image.new("RGB", (CANVAS_W, CANVAS_H), "#f5f4fb")
draw = ImageDraw.Draw(canvas)

title_font = font(82, bold=True)
subtitle_font = font(38)
label_font = font(34, bold=True)

draw.text(
    (CANVAS_W // 2, 48),
    "Left-behind Children Survey Results",
    fill="#262334",
    font=title_font,
    anchor="ma",
)
draw.text(
    (CANVAS_W // 2, 137),
    "Survey responses and supporting data  |  n = 62",
    fill="#666178",
    font=subtitle_font,
    anchor="ma",
)

y = PAGE_MARGIN + TITLE_H
for row in ROWS:
    available_w = CANVAS_W - PAGE_MARGIN * 2
    cell_w = (available_w - COL_GAP * (len(row) - 1)) // len(row)

    for column, question_number in enumerate(row):
        x = PAGE_MARGIN + column * (cell_w + COL_GAP)
        cell_box = (x, y, x + cell_w, y + ROW_H)

        draw.rounded_rectangle(
            cell_box,
            radius=24,
            fill="white",
            outline="#d9d6e7",
            width=3,
        )

        label_w = 94
        draw.rounded_rectangle(
            (x + 18, y + 16, x + 18 + label_w, y + 66),
            radius=16,
            fill="#5c50dc",
        )
        draw.text(
            (x + 18 + label_w // 2, y + 41),
            f"Q{question_number}",
            fill="white",
            font=label_font,
            anchor="mm",
        )

        image = Image.open(ROOT / f"Q{question_number}.png").convert("RGB")
        image_area = (cell_w - 36, ROW_H - 88)
        scale = min(image_area[0] / image.width, image_area[1] / image.height)
        resized = image.resize(
            (max(1, round(image.width * scale)), max(1, round(image.height * scale))),
            Image.Resampling.LANCZOS,
        )

        paste_x = x + (cell_w - resized.width) // 2
        paste_y = y + 76 + (ROW_H - 88 - resized.height) // 2
        canvas.paste(resized, (paste_x, paste_y))

    y += ROW_H + ROW_GAP

canvas.save(OUTPUT, format="PNG", dpi=(300, 300), optimize=True)
print(OUTPUT)
