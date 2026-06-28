import os
from PIL import Image, ImageDraw, ImageFont

def create_diagram():
    # 1. Create a white image
    # Size: width 900, height 1150
    width = 950
    height = 1180
    image = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(image)

    # 2. Load Fonts
    try:
        font_regular = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", 14)
        font_bold = ImageFont.truetype("C:\\Windows\\Fonts\\arialbd.ttf", 14)
        font_title = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", 13)
        font_caption = ImageFont.truetype("C:\\Windows\\Fonts\\arialbd.ttf", 16)
    except IOError:
        font_regular = ImageFont.load_default()
        font_bold = ImageFont.load_default()
        font_title = ImageFont.load_default()
        font_caption = ImageFont.load_default()

    # 3. Helper functions for text dimensions and box rendering
    def get_text_size(text, font):
        bbox = draw.textbbox((0, 0), text, font=font)
        return bbox[2] - bbox[0], bbox[3] - bbox[1], bbox[1]

    def draw_text_centered(text, font, cx, cy, fill="black"):
        w, h, offset_y = get_text_size(text, font)
        draw.text((cx - w/2, cy - h/2 - offset_y), text, fill=fill, font=font)

    def draw_box(x1, y1, x2, y2, text, font, fill="white", outline="black", width=1.5):
        draw.rectangle([x1, y1, x2, y2], fill=fill, outline=outline, width=int(width))
        draw_text_centered(text, font, (x1 + x2)/2, (y1 + y2)/2)

    def draw_down_arrow(x, y1, y2, fill="black", width=1.5, head_size=6):
        draw.line([(x, y1), (x, y2)], fill=fill, width=int(width))
        draw.polygon([(x - head_size, y2 - head_size), (x + head_size, y2 - head_size), (x, y2)], fill=fill)

    def draw_up_arrow(x, y1, y2, fill="black", width=1.5, head_size=6):
        draw.line([(x, y1), (x, y2)], fill=fill, width=int(width))
        draw.polygon([(x - head_size, y2 + head_size), (x + head_size, y2 + head_size), (x, y2)], fill=fill)

    def draw_arrow_head(x, y, direction="down", fill="black", head_size=6):
        if direction == "down":
            draw.polygon([(x - head_size, y - head_size), (x + head_size, y - head_size), (x, y)], fill=fill)
        elif direction == "up":
            draw.polygon([(x - head_size, y + head_size), (x + head_size, y + head_size), (x, y)], fill=fill)
        elif direction == "left":
            draw.polygon([(x + head_size, y - head_size), (x + head_size, y + head_size), (x, y)], fill=fill)
        elif direction == "right":
            draw.polygon([(x - head_size, y - head_size), (x - head_size, y + head_size), (x, y)], fill=fill)

    # 4. Drawing top headers
    draw.text((40, 30), "AI-Based Industrial Safety Monitoring System", fill="gray", font=font_title)
    draw.text((width - 60, 30), "38", fill="gray", font=font_title)

    # 5. Drawing Column 1 (Left Column)
    # CCTV Camera / Video file
    draw_box(50, 80, 250, 120, "CCTV Camera / Video file", font_regular)
    draw_down_arrow(150, 120, 160)
    # RTSP / MP4
    draw_box(95, 160, 205, 195, "RTSP / MP4", font_regular)
    draw_down_arrow(150, 195, 235)
    # Edge AI Processor Node
    draw_box(45, 235, 255, 275, "Edge AI Processor Node", font_regular)

    # 6. Drawing Column 2 (SCADA Panel)
    # React SCADA Web Panel
    draw_box(290, 80, 480, 120, "React SCADA Web Panel", font_bold)
    # Acknowledge / Resolve
    draw_box(270, 160, 410, 195, "Acknowledge / Resolve", font_regular)
    # Arrow from Web Panel left side down to Acknowledge
    draw_down_arrow(340, 120, 160)

    # 7. Drawing Column 3 (Edge AI Inference Daemon container)
    # Daemon Bounding Box: X from 500 to 900, Y from 80 to 600
    draw.rectangle([500, 80, 900, 600], fill="white", outline="black", width=2)
    draw.text((510, 90), "Edge AI Inference Daemon", fill="black", font=font_bold)

    # Inside Daemon:
    # OpenCV Frame Grabber
    draw_box(600, 120, 800, 160, "OpenCV Frame Grabber", font_bold)
    # Arrows from Grabber to RGB Frame and Compressed Frame
    draw.line([(700, 160), (700, 180)], fill="black", width=2) # Main drop line
    draw.line([(600, 180), (800, 180)], fill="black", width=2) # horizontal split
    draw_down_arrow(600, 180, 205) # left branch to RGB
    draw_down_arrow(800, 180, 205) # right branch to Compressed

    # RGB Frame
    draw_box(550, 205, 650, 240, "RGB Frame", font_regular)
    draw_down_arrow(600, 240, 265)

    # YOLOv8 Person BBox
    draw_box(520, 265, 680, 305, "YOLOv8 Person BBox", font_bold)
    draw_down_arrow(600, 305, 330)

    # Crops
    draw_box(565, 330, 635, 365, "Crops", font_regular)
    draw_down_arrow(600, 365, 390)

    # HSV Color PPE Auditor
    draw_box(520, 390, 680, 430, "HSV Color PPE Auditor", font_bold)
    draw_down_arrow(600, 430, 455)

    # Detections List
    draw_box(545, 455, 655, 490, "Detections List", font_regular)
    draw_down_arrow(600, 490, 520)

    # REST API Client
    draw_box(530, 520, 670, 560, "REST API Client", font_bold)

    # Right Path Inside Daemon:
    # Compressed Frame
    draw_box(740, 205, 860, 240, "Compressed Frame", font_regular)
    draw_down_arrow(800, 240, 265)

    # WebSocket Client
    draw_box(730, 265, 870, 305, "WebSocket Client", font_bold)

    # 8. Drawing connection lines from Daemon to Server
    # Left path: REST API Client -> POST /api/violations/
    draw_down_arrow(600, 560, 640)
    draw_box(540, 640, 660, 675, "POST /api/violations/", font_regular)
    draw_down_arrow(600, 675, 730)

    # Right path: WebSocket Client -> WS Live Feed Broadcast
    # The line goes all the way down from WebSocket Client (800, 305) to WS Live Feed Broadcast
    draw_down_arrow(800, 305, 660)
    draw_box(725, 660, 875, 695, "WS Live Feed Broadcast", font_regular)
    # From WS Live Feed Broadcast bottom (800, 695) to Django Server top-right (615, 755)
    # Line goes down to Y = 720, then left to X = 615, then down to Y = 730
    draw.line([(800, 695), (800, 720)], fill="black", width=2)
    draw.line([(800, 720), (615, 720)], fill="black", width=2)
    draw_down_arrow(615, 720, 730)

    # Acknowledge / Resolve bottom (340, 195) to Django Server top-left (340, 730)
    # The line goes straight down from (340, 195) to Y = 720, then right to X = 465, then down to Y = 730
    draw.line([(340, 195), (340, 720)], fill="black", width=2)
    draw.line([(340, 720), (465, 720)], fill="black", width=2)
    draw_down_arrow(465, 720, 730)

    # WebSocket Stream & its line to Web Panel
    # Box "WebSocket Stream" is X: 375 to 495, Y: 640 to 675
    draw_box(375, 640, 495, 675, "WebSocket Stream", font_regular)
    # Line goes down to Django Server (435, 730)
    draw_down_arrow(435, 675, 730)
    # Line goes UP from WebSocket Stream top (435, 640) to Y = 620, then left to X = 435 (wait, it's already X=435)
    # Actually, the line goes up to Y = 120 (bottom-right of SCADA Web Panel, X = 435)
    # Let's draw it as a straight line with an up arrow pointing at (435, 120)
    draw_up_arrow(435, 640, 120)

    # 9. Django ASGI Core Server
    draw_box(430, 730, 650, 770, "Django ASGI Core Server", font_bold)
    draw_down_arrow(540, 770, 810)

    # ORM Queries
    draw_box(490, 810, 590, 845, "ORM Queries", font_regular)
    draw_down_arrow(540, 845, 890)

    # 10. Backend System Core (Bounding Box)
    # Box from 420 to 660, Y from 890 to 1030
    draw.rectangle([420, 890, 660, 1030], fill="white", outline="black", width=2)
    draw.text((430, 900), "Backend System Core", fill="black", font=font_bold)

    # SQLite / MySQL Database (Cylinder)
    # Draw cylinder base
    # Ellipse top: X: 450 to 630, Y: 940 to 965
    # Ellipse bottom: X: 450 to 630, Y: 985 to 1010
    cx1, cy1, cx2, cy2 = 450, 940, 630, 965
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

    # 11. Caption at the bottom
    draw_text_centered("Figure 2: System Architecture Diagram", font_caption, width/2, height - 50)

    # Save to path
    output_dir = "D:\\ai chatbot"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    output_path = os.path.join(output_dir, "system_architecture.png")
    image.save(output_path, "PNG")
    print(f"Diagram successfully saved to: {output_path}")

if __name__ == "__main__":
    create_diagram()
