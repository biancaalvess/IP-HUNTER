const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

// Configuração do servidor
const PORT = process.env.PORT || 3000;

// Middleware para processar JSON no corpo da requisição
app.use(express.json());

// Rota para o pixel de rastreamento
app.get('/pixel', (req, res) => {
  console.log("Pixel request received");

  try {
    // Tente ler o arquivo 1x1-transparent.png
    const pixelPath = path.join(__dirname, '1x1-transparent.png');
    const pixel = fs.readFileSync(pixelPath);
    
    // Enviar a imagem 1x1 como resposta
    res.set('Content-Type', 'image/png');
    res.send(pixel);
  } catch (error) {
    // Caso ocorra um erro, logue e retorne um erro 500
    console.error('Error reading pixel file:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

