/**
 * Matrix Digital Rain Effect
 * Creates a hacker-style background with falling green characters
 */

(function() {
    // Create canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas to be fixed in the background
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.opacity = '0.8';
    
    // Insert canvas as the first element in the body
    document.body.insertBefore(canvas, document.body.firstChild);
    
    // Set canvas dimensions
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    
    // Initialize variables
    let columns; // number of columns for the rain
    let drops = []; // array of drops - one per column
    const fontSize = 14;
    
    // Characters to be displayed
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$+-*/=%"\'#&_(),.;:?!\\|{}<>[]^~';
    
    // Initialize the canvas
    function initCanvas() {
      resizeCanvas();
      columns = Math.floor(canvas.width / fontSize); // number of columns for the rain
      
      // Initialize drops
      drops = [];
      for (let i = 0; i < columns; i++) {
        // Set initial position randomly for each column
        drops[i] = Math.random() * -100;
      }
    }
    
    // Drawing function
    function draw() {
      // Set semi-transparent black background to create trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set the font and color
      ctx.font = fontSize + 'px monospace';
      
      // Loop through drops
      for (let i = 0; i < drops.length; i++) {
        // Choose a random character
        const text = chars[Math.floor(Math.random() * chars.length)];
        
        // Calculate brightness based on position (brighter at the head of each column)
        const headBrightness = Math.min(1, (drops[i] % 20) / 10);
        const brightness = Math.max(0.2, headBrightness);
        
        // Set color with varying opacity for a more dynamic look
        ctx.fillStyle = `rgba(0, 255, 70, ${brightness})`;
        
        // Draw the character
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        // Move the drop down
        drops[i]++;
        
        // Reset drop to top with random delay when it reaches bottom
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
      }
    }
    
    // Handle window resize
    window.addEventListener('resize', initCanvas);
    
    // Initialize and start animation
    initCanvas();
    setInterval(draw, 33); // ~30 FPS
  })();
  