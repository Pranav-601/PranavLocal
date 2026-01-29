import os
import socket
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder="../frontend/dist", static_url_path="", template_folder=None)
CORS(app)  # Enable CORS for all routes

# Config
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

latest_shared = {"file": None, "text": None}  # keep last shared item


# ------------------ ROUTES ------------------

@app.route("/")
def index():
    # Serve React frontend (dist/index.html)
    return send_from_directory(app.static_folder, "index.html")


@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    filename = secure_filename(file.filename)
    file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))

    # Remember latest file
    latest_shared["file"] = filename

    return jsonify({"message": "File uploaded", "filename": filename})


@app.route("/send-text", methods=["POST"])
def send_text():
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "No text provided"}), 400

    text = data["text"]
    latest_shared["text"] = text

    return jsonify({"message": "Text received", "text": text})


@app.route("/get-latest", methods=["GET"])
def get_latest():
    return jsonify(latest_shared)


@app.route("/network-info", methods=["GET"])
def network_info():
    """Get network information for QR code generation"""
    try:
        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)
        
        # Try to get a more accurate network IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            # Connect to a remote server to get local IP
            s.connect(('8.8.8.8', 80))
            network_ip = s.getsockname()[0]
        except Exception:
            network_ip = local_ip
        finally:
            s.close()
        
        return jsonify({
            "hostname": hostname,
            "local_ip": local_ip,
            "network_ip": network_ip,
            "frontend_url": f"http://{network_ip}:8080",
            "backend_url": f"http://{network_ip}:5000"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/download/<filename>")
def download_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename, as_attachment=True)


@app.route("/assets/<path:filename>")
def static_assets(filename):
    # Serve React static assets (CSS, JS, etc.)
    return send_from_directory(os.path.join(app.static_folder, "assets"), filename)


# ------------------ START ------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
