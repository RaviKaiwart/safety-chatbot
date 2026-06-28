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

    # 1. Header Text
    draw.text((40, 30), "AI-Based Industrial Safety Monitoring System", fill="black", font=font_title)
    draw.text((width - 60, 30), "38", fill="black", font=font_title)

    # 2. Left Stream Column (Worker path)
    draw_box(50, 80, 250, 115, "Worker Chat Interface", font_regular)
    draw_arrow_down(150, 115, 150)

    draw_box(95, 150, 205, 185, "Image & Audio Input", font_regular)
    draw_arrow_down(150, 185, 220)

    draw_box(45, 220, 255, 255, "Emergency SOS Trigger", font_regular)

    # 3. Middle SCADA Column (Admin path)
    draw_box(290, 80, 480, 115, "React Admin Dashboard", font_regular)
    draw_arrow_down(340, 115, 150)

    draw_box(270, 150, 410, 185, "Alert Verification Panel", font_regular)

    # 4. Right Column: Express Server (Bounding Box)
    draw.rectangle([510, 80, 910, 600], fill="white", outline="black", width=2)
    draw.text((520, 90), "Express Node.js Core API Server", fill="black", font=font_bold)

    # Top component in server
    draw_box(610, 115, 810, 150, "JWT Auth & Middleware", font_regular)

    # Branch Split
    draw.line([(710, 150), (710, 175)], fill="black", width=2) # stem
    draw.line([(600, 175), (820, 175)], fill="black", width=2) # bar
    draw_arrow_down(600, 175, 205) # left branch
    draw_arrow_down(820, 175, 205) # right branch

    # Left Inner Path:
    draw_box(550, 205, 650, 235, "Chat API Router", font_regular)
    draw_arrow_down(600, 235, 260)

    draw_box(520, 260, 680, 295, "Gemini AI Controller", font_regular)
    draw_arrow_down(600, 295, 325)

    draw_box(570, 325, 630, 355, "Prompt Eng.", font_regular)
    draw_arrow_down(600, 355, 385)

    draw_box(520, 385, 680, 420, "Alert Incident Engine", font_regular)
    draw_arrow_down(600, 420, 450)

    draw_box(545, 450, 655, 480, "Nodemailer SMTP", font_regular)
    draw_arrow_down(600, 480, 510)

    draw_box(535, 510, 665, 545, "External API Dispatcher", font_regular)

    # Right Inner Path:
    draw_box(760, 205, 880, 235, "Admin CRUD Routers", font_regular)
    draw_arrow_down(820, 235, 260)

    draw_box(750, 260, 890, 295, "Safety Rules & Contacts", font_regular)

    # 5. Connectors from Server down to Database Layer
    # Left: Dispatcher -> POST /api/alerts
    draw_arrow_down(600, 545, 640)
    draw_box(550, 640, 665, 675, "POST /api/alerts", font_regular)
    draw_arrow_down(600, 675, 730)

    # Right: Safety Rules -> API Route
    draw_arrow_down(820, 295, 640)
    draw_box(740, 640, 900, 675, "Verify & Approve DB Req", font_regular)
    draw.line([(820, 675), (820, 705)], fill="black", width=2)
    draw.line([(820, 705), (635, 705)], fill="black", width=2)
    draw_arrow_down(635, 705, 730)

    # Admin Panel bottom to Database Layer top
    draw.line([(340, 185), (340, 705)], fill="black", width=2)
    draw.line([(340, 705), (455, 705)], fill="black", width=2)
    draw_arrow_down(455, 705, 730)

    # WebSocket Stream equivalent
    draw_box(375, 640, 495, 675, "Live Dashboard Data", font_regular)
    draw_arrow_down(435, 675, 730)
    draw_arrow_up(435, 640, 115)

    # 6. Database Integration Layer
    draw_box(430, 730, 660, 765, "Database Integration Layer", font_bold)
    draw_arrow_down(545, 765, 805)

    # ORM Queries equivalent
    draw_box(490, 805, 600, 840, "Read / Write Operations", font_regular)
    draw_arrow_down(545, 840, 880)

    # 7. Data Storage Core (Bounding Box)
    draw.rectangle([420, 880, 670, 1030], fill="white", outline="black", width=2)
    draw.text((430, 892), "Data Storage Core", fill="black", font=font_bold)

    # Database (Cylinder)
    cx1, cy1, cx2, cy2 = 450, 930, 640, 955
    dy = 40
    draw.ellipse([cx1, cy1 + dy, cx2, cy2 + dy], fill="white", outline="black", width=2)
    draw.rectangle([cx1, (cy1+cy2)/2, cx2, (cy1+cy2)/2 + dy], fill="white")
    draw.ellipse([cx1, cy1, cx2, cy2], fill="white", outline="black", width=2)
    draw.line([(cx1, (cy1+cy2)/2), (cx1, (cy1+cy2)/2 + dy)], fill="black", width=2)
    draw.line([(cx2, (cy1+cy2)/2), (cx2, (cy1+cy2)/2 + dy)], fill="black", width=2)
    draw_text_centered("MongoDB / JSON Fallback", font_bold, (cx1+cx2)/2, (cy1+cy2)/2 + dy/2 + 2)

    # 8. Figure Caption
    draw_text_centered("Figure 2: System Architecture Diagram", font_caption, width/2, height - 55)

    # Save to path
    output_path = "D:\\ai chatbot\\system_architecture.png"
    image.save(output_path, "PNG")
    print(f"Diagram successfully saved to: {output_path}")

if __name__ == "__main__":
    draw_diagram()
