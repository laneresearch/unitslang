import http.server
import socketserver
import signal
import sys
import os
import mimetypes
import threading

PORT = 8000

class TCPServerReuse(socketserver.TCPServer):
    allow_reuse_address = True  # Allow reuse of local addresses
    daemon_threads = True       # Use daemon threads for faster shutdown

class OptimizedRequestHandler(http.server.SimpleHTTPRequestHandler):
    # Add WASM mime type
    if not mimetypes.types_map.get('.wasm'):
        mimetypes.add_type('application/wasm', '.wasm')

    def do_GET(self):
        # Handle WASM files specially
        if self.path.endswith('.wasm'):
            try:
                # Check if uncompressed file exists
                file_path = self.translate_path(self.path)
                if os.path.exists(file_path):
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/wasm')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
                    self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
                    self.send_header('Cache-Control', 'public, max-age=31536000')
                    
                    # Check for gzipped version
                    if os.path.exists(file_path + '.gz'):
                        with open(file_path + '.gz', 'rb') as f:
                            fs = os.fstat(f.fileno())
                            content = f.read()
                            self.send_header('Content-Encoding', 'gzip')
                            self.send_header('Content-Length', str(len(content)))
                            self.end_headers()
                            self.wfile.write(content)
                    else:
                        with open(file_path, 'rb') as f:
                            fs = os.fstat(f.fileno())
                            content = f.read()
                            self.send_header('Content-Length', str(len(content)))
                            self.end_headers()
                            self.wfile.write(content)
                    return
            except Exception as e:
                print(f"Error serving WASM file: {e}")
                self.send_error(500, f"Error serving WASM file: {str(e)}")
                return
        
        # For non-WASM files, add CORS headers
        response = super().do_GET()
        return response

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        super().end_headers()

# Global variable to store server instance
httpd = None

def shutdown_server():
    """Shutdown the server in a separate thread to prevent hanging"""
    if httpd:
        print('\nShutting down server...')
        httpd.shutdown()
        httpd.server_close()
        print('Server shutdown complete.')

def signal_handler(sig, frame):
    threading.Thread(target=shutdown_server).start()
    sys.exit(0)

if __name__ == '__main__':
    # Set up signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        # Use a larger buffer size for better performance
        socketserver.TCPServer.request_queue_size = 10
        httpd = TCPServerReuse(("", PORT), OptimizedRequestHandler)
        print(f"Server started at http://localhost:{PORT}")
        print("Press Ctrl+C to stop the server")
        httpd.serve_forever()
    except Exception as e:
        print(f"Server error: {e}")
        sys.exit(1) 