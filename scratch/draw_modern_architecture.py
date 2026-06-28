import os
from PIL import Image, ImageDraw, ImageFont

def draw_modern_diagram():
    # High-resolution canvas for a crisp, modern look
    width = 1200
    height = 1000
    image = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(image)

    # Fonts
    try:
        font_title = ImageFont.truetype("C:\\Windows\\Fonts\\arialbd.ttf", 32)
        font_layer = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", 22)
        font_box = ImageFont.truetype("C:\\Windows\\Fonts\\arialbd.ttf", 16)
        font_desc = ImageFont.truetype("C:\\Windows\\Fonts\\arial.ttf", 14)
    except IOError:
        font_title = font_layer = font_box = font_desc = ImageFont.load_default()

    def get_text_size(text, font):
        bbox = draw.textbbox((0, 0), text, font=font)
        return bbox[2] - bbox[0], bbox[3] - bbox[1], bbox[1]

    def draw_centered_text(text, font, cx, cy, fill="black"):
        w, h, offset_y = get_text_size(text, font)
        draw.text((cx - w/2, cy - h/2 - offset_y), text, fill=fill, font=font)

    def draw_rounded_box(x, y, w, h, title, desc="", radius=15):
        # Fill is white, outline is black, width is 2 for modern thick borders
        draw.rounded_rectangle([x, y, x+w, y+h], radius=radius, fill="white", outline="black", width=2)
        
        # Center the text
        if desc:
            draw_centered_text(title, font_box, x + w/2, y + h/2 - 10)
            draw_centered_text(desc, font_desc, x + w/2, y + h/2 + 15)
        else:
            draw_centered_text(title, font_box, x + w/2, y + h/2)

    def draw_layer_container(x, y, w, h, title):
        # Dashed line effect (PIL doesn't support dashed rects easily, so we use a lighter solid line or a specific bounding box)
        draw.rounded_rectangle([x, y, x+w, y+h], radius=20, fill="#f9f9f9", outline="black", width=1)
        # To make it strictly white/black, we'll keep fill white
        draw.rounded_rectangle([x, y, x+w, y+h], radius=20, fill="white", outline="black", width=2)
        # Layer Title
        tw, th, _ = get_text_size(title, font_layer)
        # Draw a solid background for the title text to break the line
        draw.rectangle([x + 30, y - th/2 - 10, x + 30 + tw + 20, y + th/2 + 10], fill="white")
        draw.text((x + 40, y - th/2 - 5), title, fill="black", font=font_layer)

    def draw_arrow(x1, y1, x2, y2, label=""):
        # Draw line
        draw.line([(x1, y1), (x2, y2)], fill="black", width=2)
        
        # Calculate arrowhead
        head_length = 12
        import math
        angle = math.atan2(y2 - y1, x2 - x1)
        
        ax1 = x2 - head_length * math.cos(angle - math.pi/6)
        ay1 = y2 - head_length * math.sin(angle - math.pi/6)
        ax2 = x2 - head_length * math.cos(angle + math.pi/6)
        ay2 = y2 - head_length * math.sin(angle + math.pi/6)
        
        draw.polygon([(x2, y2), (ax1, ay1), (ax2, ay2)], fill="black")
        
        if label:
            cx, cy = (x1 + x2) / 2, (y1 + y2) / 2
            tw, th, _ = get_text_size(label, font_desc)
            draw.rectangle([cx - tw/2 - 5, cy - th/2 - 5, cx + tw/2 + 5, cy + th/2 + 5], fill="white")
            draw_centered_text(label, font_desc, cx, cy)

    # Title
    draw_centered_text("Modern System Architecture", font_title, width/2, 60)
    draw_centered_text("AI-Based Industrial Safety Monitoring", font_layer, width/2, 100)

    # --- LAYERS ---
    # 1. Client Layer
    draw_layer_container(100, 160, 1000, 180, "Client Layer (Frontend)")
    draw_rounded_box(180, 210, 250, 80, "Worker App", "Chat / Voice / Image")
    draw_rounded_box(475, 210, 250, 80, "SOS Trigger", "Hardware / Watch App")
    draw_rounded_box(770, 210, 250, 80, "Admin Dashboard", "React / Scada Panel")

    # 2. Application Layer (Backend & AI)
    draw_layer_container(100, 420, 1000, 260, "Application & AI Layer")
    
    # API Gateway
    draw_rounded_box(475, 470, 250, 60, "Node.js Express Server", "API Gateway & Router")
    
    # Internal Modules
    draw_rounded_box(180, 580, 200, 70, "Chat & Auth Module", "JWT Verification")
    draw_rounded_box(410, 580, 200, 70, "Gemini AI Engine", "Prompt / LLM Inference")
    draw_rounded_box(640, 580, 200, 70, "Alert Dispatcher", "SMTP / Twilio")
    draw_rounded_box(870, 580, 150, 70, "Safety Rules", "CRUD & Verification")

    # 3. Data Layer
    draw_layer_container(100, 760, 1000, 180, "Data Storage Layer")
    draw_rounded_box(300, 810, 250, 80, "MongoDB", "User & Incident Data")
    draw_rounded_box(650, 810, 250, 80, "Vector DB / Cache", "Fast Rules Retrieval")

    # --- CONNECTIONS ---
    # Client to App
    draw_arrow(305, 290, 500, 470, "HTTP / WebSockets")
    draw_arrow(600, 290, 600, 470, "Emergency POST")
    draw_arrow(895, 290, 700, 470, "REST API")

    # Gateway to Modules
    draw_arrow(500, 530, 280, 580)
    draw_arrow(550, 530, 510, 580)
    draw_arrow(650, 530, 740, 580)
    draw_arrow(700, 530, 945, 580)

    # Modules cross-talk
    draw_arrow(610, 615, 640, 615) # AI -> Dispatcher

    # App to Data
    draw_arrow(280, 650, 425, 810, "Read/Write Users")
    draw_arrow(740, 650, 775, 810, "Cache / Logs")
    draw_arrow(945, 650, 500, 810, "Save Rules")

    # Output
    output_path = "D:\\ai chatbot\\system_architecture_modern.png"
    image.save(output_path, "PNG")
    print(f"Modern diagram saved to: {output_path}")

if __name__ == "__main__":
    draw_modern_diagram()
