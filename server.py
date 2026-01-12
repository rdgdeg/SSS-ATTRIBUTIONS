#!/usr/bin/env python3
"""
Serveur HTTP simple pour lancer l'application en local
"""
import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

PORT = 8000
DIRECTORY = Path(__file__).parent

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)
    
    def end_headers(self):
        # Ajouter les headers CORS pour permettre les imports de modules
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        super().end_headers()

def main():
    os.chdir(DIRECTORY)
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        url = f"http://localhost:{PORT}/app.html"
        print(f"\n{'='*60}")
        print(f"🚀 Serveur démarré sur http://localhost:{PORT}")
        print(f"📂 Répertoire: {DIRECTORY}")
        print(f"🌐 Ouvrez votre navigateur à: {url}")
        print(f"{'='*60}\n")
        print("Appuyez sur Ctrl+C pour arrêter le serveur\n")
        
        # Ouvrir automatiquement le navigateur
        try:
            webbrowser.open(url)
        except:
            pass
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n🛑 Arrêt du serveur...")
            httpd.shutdown()

if __name__ == "__main__":
    main()
