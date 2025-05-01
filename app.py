from flask import Flask, render_template, request, redirect, url_for, jsonify
from datetime import datetime
import os
import json
import uuid
import platform
import socket

app = Flask(__name__)

# Arquivo para armazenar os dados
DATA_DIR = "data"
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# Garantir que o diretório static existe
STATIC_DIR = "static"
if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR)

def get_visitor_data():
    """Coleta informações detalhadas do visitante"""
    data = {
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
        "device": {
            "screen_info": request.args.get('screen', ''),
            "platform": request.args.get('platform', ''),
            "timezone": request.args.get('timezone', ''),
        },
        "server": {
            "hostname": socket.gethostname(),
            "platform": platform.platform(),
            "python_version": platform.python_version(),
        }
    }
    return data

def save_visitor_data(data):
    """Salva os dados do visitante em um arquivo JSON individual"""
    filename = f"{DATA_DIR}/visitor_{data['id']}.json"
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)
    
    # Também adiciona ao arquivo de log principal para referência rápida
    log_entry = f"[{data['timestamp']}] IP: {data['ip']['address']} | UA: {data['browser']['user_agent'][:50]}...\n"
    with open(f"{DATA_DIR}/access_log.txt", 'a') as f:
        f.write(log_entry)

@app.route('/')
def index():
    """Página principal que captura e registra informações do visitante"""
    return render_template('index.html')

@app.route('/track.js')
def tracking_js():
    """Serve o arquivo JavaScript de rastreamento"""
    return app.send_static_file('track.js')

@app.route('/matrix-rain.js')
def matrix_rain_js():
    """Serve o arquivo JavaScript do efeito Matrix"""
    return app.send_static_file('matrix-rain.js')

@app.route('/collect', methods=['POST'])
def collect():
    """Endpoint para coletar dados enviados pelo JavaScript"""
    visitor_data = get_visitor_data()
    
    # Adiciona dados enviados pelo JavaScript
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

@app.route('/transparent.gif')
def pixel():
    """Retorna um pixel transparente e registra a visita"""
    visitor_data = get_visitor_data()
    save_visitor_data(visitor_data)
    return redirect(url_for('static', filename='transparent.gif'))

@app.route('/admin')
def admin():
    """Página de administração para visualizar os dados capturados"""
    # Lista todos os arquivos JSON no diretório de dados
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
        
    visitor_files = [f for f in os.listdir(DATA_DIR) if f.startswith('visitor_') and f.endswith('.json')]
    
    visitors = []
    for file in visitor_files:
        with open(os.path.join(DATA_DIR, file), 'r') as f:
            try:
                visitor = json.load(f)
                visitors.append(visitor)
            except:
                continue
    
    # Ordena por timestamp (mais recente primeiro)
    visitors.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
    
    return render_template('admin.html', visitors=visitors)

@app.route('/admin/details/<visitor_id>')
def visitor_details(visitor_id):
    """Exibe detalhes completos de um visitante específico"""
    filename = f"{DATA_DIR}/visitor_{visitor_id}.json"
    
    if not os.path.exists(filename):
        return "Visitante não encontrado", 404
    
    with open(filename, 'r') as f:
        visitor_data = json.load(f)
    
    return render_template('details.html', visitor=visitor_data)

# Adicionar uma rota para lidar com erros 404
@app.errorhandler(404)
def page_not_found(e):
    """Manipulador de erro 404 personalizado"""
    return render_template('404.html'), 404

if __name__ == '__main__':
    # Criar um arquivo GIF transparente se não existir
    transparent_gif_path = os.path.join(STATIC_DIR, 'transparent.gif')
    if not os.path.exists(transparent_gif_path):
        # GIF transparente de 1x1 pixel em base64
        gif_data = b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b'
        with open(transparent_gif_path, 'wb') as f:
            f.write(gif_data)

    # Escolher a porta (padrão 5000)
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
