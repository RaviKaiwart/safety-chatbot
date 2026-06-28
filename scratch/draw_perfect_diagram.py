import os
from PIL import Image, ImageDraw, ImageFont

def draw_diagram():
    # Image dimensions
    width = 950
    height = 1150
    image = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(image)

    # Load Fonts
    try:
        font_regular = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", 13)
        font_bold = ImageFont.truetype("C:\\Windows\\Fonts\\arialbd.ttf", 13)
        font_title = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", 13)
        font_caption = ImageFont.truetype("C:\\Windows\\Fonts\\arialbd.ttf", 15)
    except IOError:
        font_regular = ImageFont.load_default()
        font_bold = ImageFont.load_default()
        font_title = ImageFont.load_default()
        font_caption = ImageFont.load_default()

    # Helpers
    def get_text_size(text, font):
        bbox = draw.textbbox((0, 0), text, font=font)
        return bbox[2] - bbox[0], bbox[3] - bbox[1], bbox[1]

    def draw_text_centered(text, font, cx, cy, fill="black"):
        w, h, offset_y = get_text_size(text, font)
        draw.text((cx - w/2, cy - h/2 - offset_y), text, fill=fill, font=font)

    def draw_box(x1, y1, x2, y2, text, font, fill="white", outline="black", width=1.5):
        draw.rectangle([x1, y1, x2, y2], fill=fill, outline=outline, width=int(width))
        draw_text_centered(text, font, (x1 + x2)/2, (y1 + y2)/2)

    def draw_arrow_down(x, y1, y2, fill="black", width=1.5, head_size=6):
        draw.line([(x, y1), (x, y2)], fill=fill, width=int(width))
        draw.polygon([(x - head_size, y2 - head_size), (x + head_size, y2 - head_size), (x, y2)], fill=fill)

    def draw_arrow_up(x, y1, y2, fill="black", width=1.5, head_size=6):
        draw.line([(x, y1), (x, y2)], fill=fill, width=int(width))
        draw.polygon([(x - head_size, y2 + head_size), (x + head_size, y2 + head_size), (x, y2)], fill=fill)

    def draw_arrow_head(x, y, direction="down", fill="black", head_size=6):
        if direction == "down":
            draw.polygon([(x - head_size, y - head_size), (x + head_size, y - head_size), (x, y)], fill=fill)
        elif direction == "up":
            draw.polygon([(x - head_size, y + head_size), (x + head_size, y + head_size), (x, y)], fill=fill)

    # 1. Header Text
    draw.text((40, 30), "AI-Based Industrial Safety Monitoring System", fill="gray", font=font_title)
    draw.text((width - 60, 30), "38", fill="gray", font=font_title)

    # 2. Left Stream Column (CCTV path)
    # CCTV Camera / Video file
    draw_box(50, 80, 250, 115, "CCTV Camera / Video file", font_regular)
    draw_arrow_down(150, 115, 150)

    # RTSP / MP4
    draw_box(95, 150, 205, 185, "RTSP / MP4", font_regular)
    draw_arrow_down(150, 185, 220)

    # Edge AI Processor Node
    draw_box(45, 220, 255, 255, "Edge AI Processor Node", font_regular)

    # 3. Middle SCADA Column
    # React SCADA Web Panel
    draw_box(290, 80, 480, 115, "React SCADA Web Panel", font_regular)
    # Arrow to Acknowledge
    draw_arrow_down(340, 115, 150)

    # Acknowledge / Resolve
    draw_box(270, 150, 410, 185, "Acknowledge / Resolve", font_regular)

    # 4. Right Column: Edge AI Inference Daemon (Bounding Box)
    # Bounding Box: X 510 to 910, Y 80 to 600
    draw.rectangle([510, 80, 910, 600], fill="white", outline="black", width=2)
    draw.text((520, 90), "Edge AI Inference Daemon", fill="black", font=font_bold)

    # OpenCV Frame Grabber
    draw_box(610, 115, 810, 150, "OpenCV Frame Grabber", font_regular)

    # Branch Split below Grabber
    draw.line([(710, 150), (710, 175)], fill="black", width=2) # stem
    draw.line([(600, 175), (820, 175)], fill="black", width=2) # bar
    draw_arrow_down(600, 175, 205) # left branch to RGB
    draw_arrow_down(820, 175, 205) # right branch to Compressed

    # Left Inner Path:
    # RGB Frame
    draw_box(550, 205, 650, 235, "RGB Frame", font_regular)
    draw_arrow_down(600, 235, 260)

    # YOLOv8 Person BBox
    draw_box(520, 260, 680, 295, "YOLOv8 Person BBox", font_regular)
    draw_arrow_down(600, 295, 325)

    # Crops
    draw_box(570, 325, 630, 355, "Crops", font_regular)
    draw_arrow_down(600, 355, 385)

    # HSV Color PPE Auditor
    draw_box(520, 385, 680, 420, "HSV Color PPE Auditor", font_regular)
    draw_arrow_down(600, 420, 450)

    # Detections List
    draw_box(545, 450, 655, 480, "Detections List", font_regular)
    draw_arrow_down(600, 480, 510)

    # REST API Client
    draw_box(535, 510, 665, 545, "REST API Client", font_regular)

    # Right Inner Path:
    # Compressed Frame
    draw_box(760, 205, 880, 235, "Compressed Frame", font_regular)
    draw_arrow_down(820, 235, 260)

    # WebSocket Client
    draw_box(750, 260, 890, 295, "WebSocket Client", font_regular)

    # 5. Connectors from Daemon down to Core Server
    # Left: REST API Client -> POST /api/violations/
    draw_arrow_down(600, 545, 640)
    draw_box(550, 640, 665, 675, "POST /api/violations/", font_regular)
    draw_arrow_down(600, 675, 730)

    # Right: WebSocket Client -> WS Live Feed Broadcast
    # Line goes straight down from WebSocket Client bottom (820, 295) to WS Live Feed Broadcast top (820, 640)
    draw_arrow_down(820, 295, 640)
    draw_box(740, 640, 900, 675, "WS Live Feed Broadcast", font_regular)
    # Line from WS Live Feed Broadcast bottom (820, 675) to Core Server top (635, 730)
    # Path: goes down from (820, 675) to Y = 705 -> left to X = 635 -> down to Y = 730
    draw.line([(820, 675), (820, 705)], fill="black", width=2)
    draw.line([(820, 705), (635, 705)], fill="black", width=2)
    draw_arrow_down(635, 705, 730)

    # Acknowledge / Resolve bottom (340, 185) to Core Server top (455, 730)
    # Path: goes down from (340, 185) to Y = 705 -> right to X = 455 -> down to Y = 730
    draw.line([(340, 185), (340, 705)], fill="black", width=2)
    draw.line([(340, 705), (455, 705)], fill="black", width=2)
    draw_arrow_down(455, 705, 730)

    # WebSocket Stream & its line to Web Panel
    # WebSocket Stream box
    draw_box(375, 640, 495, 675, "WebSocket Stream", font_regular)
    # Down line to Core Server top (435, 730)
    draw_arrow_down(435, 675, 730)
    # Up line from WebSocket Stream top (435, 640) all the way up to React SCADA Web Panel bottom (435, 115)
    draw_arrow_up(435, 640, 115)

    # 6. Django ASGI Core Server
    draw_box(430, 730, 660, 765, "Django ASGI Core Server", font_bold)
    draw_arrow_down(545, 765, 805)

    # ORM Queries
    draw_box(490, 805, 600, 840, "ORM Queries", font_regular)
    draw_arrow_down(545, 840, 880)

    # 7. Backend System Core (Bounding Box)
    # Box from 420 to 670, Y from 880 to 1030
    draw.rectangle([420, 880, 670, 1030], fill="white", outline="black", width=2)
    draw.text((430, 892), "Backend System Core", fill="black", font=font_bold)

    # SQLite / MySQL Database (Cylinder)
    cx1, cy1, cx2, cy2 = 450, 930, 640, 955
    dy = 40
    # Bottom circle solid fill, then outline
    draw.ellipse([cx1, cy1 + dy, cx2, cy2 + dy], fill="white", outline="black", width=2)
    # Rect between circles to clear line
    draw.rectangle([cx1, (cy1+cy2)/2, cx2, (cy1+cy2)/2 + dy], fill="white")
    # Top circle solid fill, then outline
    draw.ellipse([cx1, cy1, cx2, cy2], fill="white", outline="black", width=2)
    # Side lines
    draw.line([(cx1, (cy1+cy2)/2), (cx1, (cy1+cy2)/2 + dy)], fill="black", width=2)
    draw.line([(cx2, (cy1+cy2)/2), (cx2, (cy1+cy2)/2 + dy)], fill="black", width=2)
    # Text inside
    draw_text_centered("SQLite / MySQL Database", font_bold, (cx1+cx2)/2, (cy1+cy2)/2 + dy/2 + 2)

    # 8. Figure Caption at the bottom
    draw_text_centered("Figure 2: System Architecture Diagram", font_caption, width/2, height - 55)

    # Save to path
    output_dir = "D:\\ai chatbot"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    output_path = os.path.join(output_dir, "system_architecture.png")
    image.save(output_path, "PNG")
    print(f"Diagram successfully saved to: {output_path}")

if __name__ == "__main__":
    draw_diagram()
