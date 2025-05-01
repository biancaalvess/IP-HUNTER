/**
* Efeito Chuva Digital Matrix
* Cria um fundo estilo hacker com personagens verdes caindo
*/

(function() {
    // Criar elemento canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Define a tela para ser fixada no fundo
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.opacity = '0.8';
    
    // Insira a tela como o primeiro elemento no corpo
    document.body.insertBefore(canvas, document.body.firstChild);
    
    // Definir dimensões da tela
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    
    // Inicializar variáveis
    let columns; // número de colunas para a chuva
    let drops = []; // conjunto de gotas - uma por coluna
    const fontSize = 14;
    
    // Caracteres a serem exibidos
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$+-*/=%"\'#&_(),.;:?!\\|{}<>[]^~';
    
    // Inicializar a tela
    function initCanvas() {
      resizeCanvas();
      columns = Math.floor(canvas.width / fontSize); // número de colunas para a chuva
      
      // Inicializar gotas
      drops = [];
      for (let i = 0; i < columns; i++) {
        // Defina a posição inicial aleatoriamente para cada coluna
        drops[i] = Math.random() * -100;
      }
    }
    
    // Função de desenho
    function draw() {
      // Defina um fundo preto semitransparente para criar um efeito de trilha
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Defina a fonte e a cor
      ctx.font = fontSize + 'px monospace';
      
      //Loop através de gotas
      for (let i = 0; i < drops.length; i++) {
        // Escolha um personagem aleatório
        const text = chars[Math.floor(Math.random() * chars.length)];
        
        // Calcular o brilho com base na posição (mais brilhante no topo de cada coluna)
        const headBrightness = Math.min(1, (drops[i] % 20) / 10);
        const brightness = Math.max(0.2, headBrightness);
        
        //Desenhe o personagem
        ctx.fillStyle = `rgba(0, 255, 70, ${brightness})`;
        
        //Desenhe o personagem
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        // Mova o menu suspenso para baixo
        drops[i]++;
        
        // Redefine a queda para o topo com atraso aleatório quando atinge o fundo
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
      }
    }
    
    // Lidar com o redimensionamento da janela
    window.addEventListener('resize', initCanvas);
    
    // Inicializar e iniciar a animação
    initCanvas();
    setInterval(draw, 33); // ~30 FPS
  })();
  