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
  // Aqui você pode registrar informações de rastreamento
  console.log("Pixel request received");

  // Enviar uma resposta de imagem 1x1 transparente (como pixel de rastreamento)
  const pixel = fs.readFileSync(path.join(__dirname, '1x1-transparent.png'));
  res.set('Content-Type', 'image/png');
  res.send(pixel);
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
