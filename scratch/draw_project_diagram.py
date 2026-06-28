import os
from PIL import Image, ImageDraw, ImageFont

def create_project_diagram():
    # 1. Create a white image
    # Size: width 950, height 1150
    width = 950
    height = 1150
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

    def draw_right_arrow(x1, x2, y, fill="black", width=1.5, head_size=6):
        draw.line([(x1, y), (x2, y)], fill=fill, width=int(width))
        draw.polygon([(x2 - head_size, y - head_size), (x2 - head_size, y + head_size), (x2, y)], fill=fill)

    def draw_left_arrow(x1, x2, y, fill="black", width=1.5, head_size=6):
        draw.line([(x1, y), (x2, y)], fill=fill, width=int(width))
        draw.polygon([(x2 + head_size, y - head_size), (x2 + head_size, y + head_size), (x2, y)], fill=fill)

    # 4. Drawing top headers
    draw.text((40, 30), "AI-Based Industrial Safety Assistant System", fill="gray", font=font_title)
    draw.text((width - 60, 30), "38", fill="gray", font=font_title)

    # 5. Drawing Column 1 (React Frontend Client Application)
    # Outer bounding box for React Frontend: X from 50 to 320, Y from 80 to 520
    draw.rectangle([50, 80, 320, 520], fill="white", outline="black", width=2)
    draw.text((60, 90), "React Frontend Client (Vite)", fill="black", font=font_bold)

    # Worker Interfaces
    draw_box(70, 130, 300, 170, "Worker Chat Interface", font_bold)
    draw_down_arrow(185, 170, 210)
    draw_box(70, 210, 300, 250, "Chat & Camera Image Upload", font_regular)

    # Admin Interfaces
    draw_box(70, 340, 300, 380, "Admin Dashboard Interface", font_bold)
    draw_down_arrow(185, 380, 420)
    draw_box(70, 420, 300, 460, "Alert Verification Panel", font_regular)

    # 6. Drawing Column 2 (Express.js Backend Server)
    # Outer bounding box for Express Server: X from 390 to 690, Y from 80 to 760
    draw.rectangle([390, 80, 690, 760], fill="white", outline="black", width=2)
    draw.text((400, 90), "Express.js Backend Server", fill="black", font=font_bold)

    # Internal backend components
    draw_box(410, 130, 670, 170, "Auth & CAPTCHA Service", font_regular)
    draw_box(410, 240, 670, 280, "Chatbot API Controller", font_regular)
    draw_box(410, 370, 670, 410, "Emergency Alert Engine", font_regular)
    draw_box(410, 500, 670, 540, "Admin CRUD Handlers", font_regular)
    draw_box(410, 660, 670, 700, "Database Integration Layer", font_bold)

    # Internal server flow lines (controllers to Database Integration layer)
    # Draw vertical line in the backend
    draw.line([(540, 170), (540, 660)], fill="black", width=1)
    # Connectors pointing down to Database layer
    draw_down_arrow(540, 600, 660)

    # 7. Connecting Frontend to Backend (arrows across boundary)
    # Login connection: Admin Dashboard -> Auth Service
    # X path: 300 -> 350 -> Y: 150 -> 410
    draw.line([(300, 360), (350, 360)], fill="black", width=2)
    draw.line([(350, 360), (350, 150)], fill="black", width=2)
    draw_right_arrow(350, 410, 150)

    # Chat connection: Chat Upload -> Chatbot API Controller
    draw.line([(300, 230), (350, 230)], fill="black", width=2)
    draw.line([(350, 230), (350, 260)], fill="black", width=2)
    draw_right_arrow(350, 410, 260)

    # Emergency Report connection: Chat Upload -> Emergency Alert Engine
    draw.line([(300, 245), (370, 245)], fill="black", width=2)
    draw.line([(370, 245), (370, 390)], fill="black", width=2)
    draw_right_arrow(370, 410, 390)

    # Verification connection: Verification Panel -> Emergency Alert Engine
    draw.line([(300, 440), (350, 440)], fill="black", width=2)
    draw.line([(350, 440), (350, 400)], fill="black", width=2)
    draw_right_arrow(350, 410, 400)

    # CRUD connection: Admin Dashboard -> Admin CRUD Handlers
    draw.line([(300, 455), (360, 455)], fill="black", width=2)
    draw.line([(360, 455), (360, 520)], fill="black", width=2)
    draw_right_arrow(360, 410, 520)

    # 8. Drawing Column 3 (External Integrations & Storage)
    # Bounding box for External APIs: X from 740 to 920, Y from 190 to 550
    draw.rectangle([740, 190, 920, 550], fill="white", outline="black", width=2)
    draw.text((750, 200), "External Services", fill="black", font=font_bold)

    # Google Gemini API
    draw_box(755, 240, 905, 280, "Google Gemini API\n(gemini-3.1-flash-lite)", font_regular)
    # Bidirectional arrow between Chatbot Controller <-> Gemini API
    draw_right_arrow(670, 755, 260)
    draw_left_arrow(755, 670, 260)

    # SMTP / Nodemailer Email Service
    draw_box(755, 370, 905, 410, "SMTP Email Server\n(Nodemailer)", font_regular)
    draw_right_arrow(670, 755, 390)

    # Safety Officer Email Inbox
    draw_box(755, 470, 905, 510, "Safety Officer Email", font_bold)
    draw_down_arrow(830, 410, 470)

    # 9. Database Storage System
    # Bounding Box: X from 740 to 920, Y from 620 to 760
    draw.rectangle([740, 620, 920, 760], fill="white", outline="black", width=2)
    draw.text((750, 630), "Data Storage Core", fill="black", font=font_bold)

    # SQLite / MySQL/ MongoDB Database (Cylinder)
    # Draw cylinder base
    cx1, cy1, cx2, cy2 = 755, 665, 905, 690
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
    draw_text_centered("MongoDB / JSON DB", font_bold, (cx1+cx2)/2, (cy1+cy2)/2 + dy/2 + 2)

    # Connect Backend Database layer to Database Storage
    # Y = 680
    draw_right_arrow(670, 755, 680)

    # 10. Caption at the bottom
    draw_text_centered("Figure 2: Safety Chatbot System Architecture Diagram", font_caption, width/2, height - 50)

    # Save to path
    output_path = "D:\\ai chatbot\\system_architecture.png"
    image.save(output_path, "PNG")
    print(f"Project Diagram successfully saved to: {output_path}")

if __name__ == "__main__":
    create_project_diagram()
