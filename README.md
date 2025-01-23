# Units Language Web Interface

This is the web interface for the Units Language project, which provides a browser-based environment for working with the Units programming language. It uses WebAssembly to run the core language components directly in the browser.

## Features

- In-browser code editor with syntax highlighting
- Real-time parsing and evaluation
- WebAssembly-powered execution
- Modern web interface

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the development server:
```bash
python server.py
```

3. Open `http://localhost:8000` in your browser

## Project Structure

- `server.py` - Python development server
- `index.html` - Main web interface
- `app.js` - Main application logic
- `editor.js` - Code editor implementation
- `styles.css` - Application styling
- `language.js` - Language-specific functionality 