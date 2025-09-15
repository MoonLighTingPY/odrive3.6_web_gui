from app.app import create_app

# No hardcoded paths; run with: python backend/start_backend.py
app = create_app()

if __name__ == "__main__":
    # Host/port can be overridden via CLI (PowerShell example):
    # python backend/start_backend.py
    app.run(host="127.0.0.1", port=5000, debug=True)