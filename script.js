 // ==========================================
  // CUSTOM ASSET CONFIGURATION (ARRAY SUPPORTED)
  // ==========================================
  const ASSETS = {
    bird: 'assts/bird.png',
    rose: 'assts/redrose.png',
    sittingPrince: 'assts/littleprincesitting.png',
    
    // The 4 illustrations for his journey!
    princeForms: [
      'assts/littleprincebird.png', // Floor 1 (Leaps to center)
      'assts/littleprincefall_left.png',  // Floor 2 (Falling)
      'assts/littleprincefall_right.png', // Floor 3 (Tumbling)
      'assts/littleprinceidle.png'// Floor 4 (Landing)
    ]
  };

  // Initialize images on load
  document.getElementById('sitting-img').src = ASSETS.sittingPrince;
  document.getElementById('prince-img').src = ASSETS.princeForms[0];

  // ==========================================
  // THE CINEMATIC CLICK INTERACTION
  // ==========================================
  let isPrinceSitting = true;

  function togglePrincePosture(event) {
    if (event) event.stopPropagation(); // Prevents planet modal from opening
    
    // Set to his "Ready" illustration
    document.getElementById('prince-img').src = ASSETS.princeForms[0];
    
    // This triggers the CSS! The Sitting image vanishes, and the Traveling image 
    // fades in while flying dynamically to the middle of the screen!
    document.body.setAttribute('data-prince-state', 'ready');
    isPrinceSitting = false;
  }

  // ==========================================
  // NAVIGATION LOGIC (With automatic illustration swapping)
  // ==========================================
  const strip = document.getElementById('floor-strip');
  const floors = Array.from(document.querySelectorAll('.floor'));
  let currentIndex = 0;
  let isAnimating = false;

  const goToFloor = (index) => {
    if (index < 0 || index >= floors.length || isAnimating) return;
    
    // Auto-activate him if user scrolls down without clicking him first
    if (currentIndex === 0 && index > 0 && isPrinceSitting) {
      document.body.setAttribute('data-prince-state', 'ready');
      isPrinceSitting = false;
    }
    
    // If returning home (e.g., the Snake button), reset him to sitting!
    if (index === 0) {
      document.body.removeAttribute('data-prince-state');
      isPrinceSitting = true;
    }

    currentIndex = index;
    isAnimating = true;
    
    // Slide the backgrounds
    strip.style.transform = `translateY(${-floors[index].offsetTop}px)`;
    
    // Tell CSS where the Prince should float to
    document.body.setAttribute('data-active-floor', index);

    // Swap his illustration dynamically as he falls!
    document.getElementById('prince-img').src = ASSETS.princeForms[index];

    setTimeout(() => { isAnimating = false; }, 1000);
  };

  window.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) < 15) return;
    goToFloor(currentIndex + (e.deltaY > 0 ? 1 : -1));
  }, { passive: true });

  // ==========================================
  // METEOR SHOWER EASTER EGG (Triggered by 'E' key or Hidden Planet)
  // ==========================================
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'e') triggerMeteorShower();
  });

  function triggerMeteorShower() {
    
    for (let i = 0; i < 15; i++) {
      const star = document.createElement('div');
      star.className = 'shooting-star';
      
      const startX = Math.random() * 120 - 20; 
      const startY = Math.random() * 120 - 20; 
      star.style.left = `${startX}vw`;
      star.style.top = `${startY}vh`;
      
      const duration = 2.0 + Math.random() * 3.0; 
      star.style.animation = `shoot ${duration}s linear forwards`;
      
      document.body.appendChild(star);
      setTimeout(() => { star.remove(); }, duration * 1000 + 100);
    }
  }

  // ==========================================
  // CUSTOM MESSAGE MODAL
  // ==========================================
  function showModal(text) {
    document.getElementById('modal-text').innerText = text;
    document.getElementById('custom-modal').classList.add('visible');
  }
  function closeModal() {
    document.getElementById('custom-modal').classList.remove('visible');
  }

  // ==========================================
  // INTERACTIVE LOOPS
  // ==========================================
  function runForLoop() {
    const homePlanet = document.getElementById('home-planet');
    const statusText = document.getElementById('for-status');
    const numBirds = 15;
    
    document.querySelectorAll('.cloned-bird').forEach(el => el.remove());
    statusText.innerText = "Spawning...";

    for (let i = 0; i < numBirds; i++) {
      setTimeout(() => {
        const bird = document.createElement('img');
        bird.src = ASSETS.bird;
        bird.className = 'loop-sprite cloned-bird';
        bird.style.left = `${150 + (i * 20) + (Math.random() * 20)}px`;
        bird.style.top = `${-50 - (i * 20)}px`;
        homePlanet.appendChild(bird);
        statusText.innerText = `Birds spawned: ${i + 1} / ${numBirds}`;
      }, i * 150); 
    }
  }

  function runDoWhileLoop() {
    const hollowGround = document.getElementById('ground-hollow');
    const statusText = document.getElementById('dowhile-status');
    let roseCount = 0;
    const totalRoses = 40;
    
    document.querySelectorAll('.cloned-rose').forEach(el => el.remove());
    statusText.innerText = "Planting...";

    do 
    {
      const currentCount = roseCount;
      setTimeout(() => {
        const rose = document.createElement('img');
        rose.src = ASSETS.rose;
        rose.className = 'loop-sprite cloned-rose';
        rose.style.left = `${8 + (Math.random() * 84)}%`;
        rose.style.top = `${35 + (Math.random() * 35)}%`;
        hollowGround.appendChild(rose);
        statusText.innerText = `Roses planted: ${currentCount + 1} / ${totalRoses}`;
      }, currentCount * 50);
      roseCount++;
    } 
      while (roseCount < totalRoses);
  }

 // --- Choices Buttons ---
  let foxInterval = null;

  function chooseFox() {
    const hollow = document.getElementById('ground-hollow');
    
    // If the loop is already running, STOP IT!
    if (foxInterval) {
      clearInterval(foxInterval);
      foxInterval = null;
      // We removed the code that changes the button text, because it's an image now!
      return; 
    } 
    // Start an infinite loop that runs every 150 milliseconds
    foxInterval = setInterval(() => {
      const rose = document.createElement('img');
      rose.src = ASSETS.rose; // Uses your custom rose!
      rose.className = 'loop-sprite cloned-rose'; 
      
     // chooseFox()
      const horizontalPos = 8 + (Math.random() * 84);
      const verticalPos = 35 + (Math.random() * 35);
      
      rose.style.position = 'absolute';
      rose.style.left = `${horizontalPos}%`;
      rose.style.top = `${verticalPos}%`;
      const rotation = -15 + Math.random() * 30;
      rose.style.transform = `scale(${0.6 + Math.random() * 0.8}) rotate(${rotation}deg)`;
      
      hollow.appendChild(rose);
    }, 150);
  }
  
  // The Parallax Traveling Prince does the heavy lifting! 
  function chooseSnake() { 
    if (foxInterval) {
      clearInterval(foxInterval);
      foxInterval = null;
    }
    goToFloor(0); 
  }