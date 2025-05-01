from flask import Flask, render_template, request, redirect, url_for, jsonify
from datetime import datetime
import os
import json
import uuid
import platform
import socket

app = Flask(__name__)

# Diretórios de dados e arquivos estáticos
DATA_DIR = "data"
STATIC_DIR = "static"
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(STATIC_DIR, exist_ok=True)

def get_visitor_data():
    """Coleta informações básicas do visitante"""
    return {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "ip": {
            "address": request.remote_addr,
            "forwarded_for": request.headers.get('X-Forwarded-For', ''),
        },
        "browser": {
            "user_agent": request.headers.get('User-Agent', ''),
            "accept_language": request.headers.get('Accept-Language', ''),
            "accept_encoding": request.headers.get('Accept-Encoding', ''),
        },
        "request": {
            "method": request.method,
            "path": request.path,
            "referrer": request.headers.get('Referer', ''),
            "origin": request.headers.get('Origin', ''),
        },
        "device": {},
        "server": {
            "hostname": socket.gethostname(),
            "platform": platform.platform(),
            "python_version": platform.python_version(),
        }
    }


# Salvar dados em arquivo .json
def save_visitor_data(data):
    filename = f"{DATA_DIR}/visitor_{data['id']}.json"
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)

    # Também adiciona ao log geral
    log_entry = f"[{data['timestamp']}] IP: {data['ip']['address']} | UA: {data['browser']['user_agent'][:50]}...\n"
    with open(f"{DATA_DIR}/access_log.txt", 'a') as f:
        f.write(log_entry)

# Rota principal
@app.route('/')
def index():
    return render_template('index.html')

# Arquivos JS estáticos
@app.route('/track.js')
def tracking_js():
    return app.send_static_file('track.js')

@app.route('/matrix-rain.js')
def matrix_rain_js():
    return app.send_static_file('matrix-rain.js')

# Endpoint para receber dados JS do cliente
@app.route('/collect', methods=['POST'])
def collect():
    visitor_data = get_visitor_data()

    if request.is_json:
        js_data = request.get_json()
        if 'device' in js_data:
            visitor_data['device'].update(js_data['device'])
        if 'browser' in js_data:
            visitor_data['browser'].update(js_data['browser'])
        if 'network' in js_data:
            visitor_data['network'] = js_data['network']
        if 'features' in js_data:
            visitor_data['features'] = js_data['features']
        if 'fingerprint' in js_data:
            visitor_data['fingerprint'] = js_data['fingerprint']
        if 'session' in js_data:
            visitor_data['session'] = js_data['session']

    save_visitor_data(visitor_data)
    return jsonify({"status": "success", "id": visitor_data['id']})

# Pixel invisível
@app.route('/pixel.gif')
def pixel():
    data = get_visitor_data()
    save_visitor_data(data)
    return redirect(url_for('static', filename='transparent.gif'))

# Painel admin
@app.route('/admin')
def admin():
    visitor_files = [
        f for f in os.listdir(DATA_DIR)
        if f.startswith('visitor_') and f.endswith('.json')
    ]

    visitors = []
    for file in visitor_files:
        try:
            with open(os.path.join(DATA_DIR, file), 'r') as f:
                visitors.append(json.load(f))
        except:
            continue

    visitors.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
    return render_template('admin.html', visitors=visitors)

# Detalhes do visitante
@app.route('/admin/details/<visitor_id>')
def visitor_details(visitor_id):
    filename = f"{DATA_DIR}/visitor_{visitor_id}.json"
    if not os.path.exists(filename):
        return "Visitante não encontrado", 404

    with open(filename, 'r') as f:
        visitor_data = json.load(f)
    return render_template('details.html', visitor=visitor_data)

# Página personalizada 404
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

# Criação do pixel transparente
if __name__ == '__main__':
    transparent_gif_path = os.path.join(STATIC_DIR, 'transparent.gif')
    if not os.path.exists(transparent_gif_path):
        gif_data = b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b'
        with open(transparent_gif_path, 'wb') as f:
            f.write(gif_data)

    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
