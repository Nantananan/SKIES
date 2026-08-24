// ==========================================
  // 🖼️ CUSTOM IMAGE SETTINGS (LOOP SPRITES)
  // Paste your image URLs here!
  // ==========================================
  const ASSETS = {
    bird: 'https://placehold.co/100x100/transparent/ffffff?text=Bird', // Replace with your bird URL
    sprout: 'https://placehold.co/100x100/transparent/88ff88?text=Sprout', // Replace with your sprout URL
    rose: 'https://placehold.co/100x100/transparent/ff8888?text=Rose', // Replace with your rose URL
    prince: 'https://placehold.co/100x100/transparent/c5a880?text=Prince' // Replace with prince URL for snake animation
  };

  // Custom Modal Logic
  function showMessage(text) {
    document.getElementById('modal-text').innerText = text;
    document.getElementById('custom-modal').classList.add('active');
  }
  function hideMessage() {
    document.getElementById('custom-modal').classList.remove('active');
  }

  // Choice Logic
  function chooseFox() {
    const hollow = document.getElementById('ground-hollow');
    const counterDisplay = document.getElementById('do-while-counter');
    let currentRoses = hollow.querySelectorAll('.rose-sprite').length;
    
    // Spawn 20 more roses into the field immediately
    for (let i = 0; i < 20; i++) {
      const rose = document.createElement('img');
      rose.src = ASSETS.rose;
      rose.className = 'rose-sprite';
      
      const horizontalPos = 20 + (Math.random() * 60); 
      const verticalPos = 1 + (Math.random() * 15); 
      
      rose.style.left = `${horizontalPos}%`;
      rose.style.top = `${verticalPos}%`;
      const rotation = -15 + Math.random() * 30;
      rose.style.transform = `scale(${0.6 + Math.random() * 0.8}) rotate(${rotation}deg)`;
      
      hollow.appendChild(rose);
      currentRoses++;
    }
    counterDisplay.innerText = `Roses: ${currentRoses}`;
  }

  function chooseSnake() {
    // 1. Spawn the flying prince image
    const prince = document.createElement('img');
    prince.src = ASSETS.prince;
    prince.className = 'flying-prince';
    document.body.appendChild(prince);

    // 2. Scroll the screen up to Floor 1
    goToFloor(0); 
    
    // 3. Remove the image after the flight finishes
    setTimeout(() => {
      prince.remove();
    }, 1200); 
  }

  // ==========================================
  // NAVIGATION LOGIC
  // ==========================================
  const strip = document.getElementById('floor-strip');
  const floors = Array.from(document.querySelectorAll('.floor'));
  const total = floors.length;
  const indicatorWrap = document.getElementById('floor-indicator');
  
  let currentIndex = 0;
  let isAnimating = false;

  // Build the Map Indicator
  floors.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = `indicator-dot ${i === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => goToFloor(i));
    indicatorWrap.appendChild(dot);
  });
  const dots = Array.from(indicatorWrap.children);

  const updateUI = (index) => {
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  };

  const slideToElement = (el) => {
    isAnimating = true;
    strip.style.transform = `translateY(${-el.offsetTop}px)`;
    setTimeout(() => { isAnimating = false; }, 800);
  };

  window.goToFloor = (index) => {
    if (index < 0 || index >= total || isAnimating) return;
    currentIndex = index;
    slideToElement(floors[index]);
    updateUI(index);
  };

  // Inputs
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'PageUp'].includes(e.key)) goToFloor(currentIndex - 1);
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) goToFloor(currentIndex + 1);
  });

  let wheelLock = false;
  window.addEventListener('wheel', (e) => {
    if (wheelLock || Math.abs(e.deltaY) < 15) return;
    wheelLock = true;
    goToFloor(currentIndex + (e.deltaY > 0 ? 1 : -1));
    setTimeout(() => { wheelLock = false; }, 800);
  }, { passive: true });

  // Stage scaling
  const updateStageScale = () => {
    const stageWidth = 1600; const stageHeight = 900;
    document.querySelectorAll('.floor-placeholder-box').forEach(box => {
      const floorEl = box.closest('.floor');
      const scale = Math.max(floorEl.clientWidth / stageWidth, floorEl.clientHeight / stageHeight);
      box.style.transform = `scale(${scale})`;
    });
  };

  window.addEventListener('resize', () => {
    strip.style.transition = 'none';
    strip.style.transform = `translateY(${-floors[currentIndex].offsetTop}px)`;
    requestAnimationFrame(() => strip.style.transition = '');
    updateStageScale();
  });
  updateStageScale();

  // ==========================================
  // SHOWCASING LOOPS
  // ==========================================

  window.runForLoop = function() {
    const layer = document.getElementById('layer-floor-1');
    const counterDisplay = document.getElementById('for-counter');
    // Clear previous
    layer.querySelectorAll('.bird-sprite').forEach(el => el.remove());
    
    let birdCount = 0;
    // For Loop Setup
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const bird = document.createElement('img');
        bird.src = ASSETS.bird; 
        bird.className = 'bird-sprite';
        
        const startX = 500; const startY = 250;
        bird.style.left = `${startX + (i * 40) + (Math.random() * 20)}px`;
        bird.style.top = `${startY - (i * 30) + (Math.random() * 20)}px`;
        bird.style.transform = `rotate(-20deg) scale(${0.5 + Math.random() * 0.5})`;
        bird.style.animationDelay = `${Math.random() * 2}s`;
        
        layer.appendChild(bird);
        birdCount++;
        counterDisplay.innerText = `Birds: ${birdCount}`;
      }, i * 150);
    }
  };

  window.runWhileLoop = function() {
    const planet = document.getElementById('home-planet');
    const counterDisplay = document.getElementById('while-counter');
    // Clear previous
    planet.querySelectorAll('.baobab-sprite').forEach(el => el.remove());
    
    let sproutsGrown = 0;
    // While Loop Setup
    function loopStep() {
      if (sproutsGrown < 3) {
        const sprout = document.createElement('img');
        sprout.src = ASSETS.sprout;
        sprout.className = 'baobab-sprite';
        
        sprout.style.left = `${50 + Math.random() * 200}px`;
        sprout.style.top = `${50 + Math.random() * 200}px`;
        
        planet.appendChild(sprout);
        sproutsGrown++;
        counterDisplay.innerText = `Sprouts: ${sproutsGrown}`;
        
        setTimeout(loopStep, 400); // Visual delay for effect
      }
    }
    loopStep();
  };

  window.runDoWhileLoop = function() {
    const hollow = document.getElementById('ground-hollow');
    const counterDisplay = document.getElementById('do-while-counter');
    // Clear previous
    hollow.querySelectorAll('.rose-sprite').forEach(el => el.remove());
    
    let roseCount = 0;
    const totalRoses = 50; 
    
    // Do-While Loop Setup (wrapped in interval for visual spawning)
    const interval = setInterval(() => {
      do {
        const rose = document.createElement('img');
        rose.src = ASSETS.rose;
        rose.className = 'rose-sprite';
        
        const horizontalPos = 20 + (Math.random() * 60); 
        const verticalPos = 1 + (Math.random() * 15); 
        
        rose.style.left = `${horizontalPos}%`;
        rose.style.top = `${verticalPos}%`;
        const rotation = -15 + Math.random() * 30;
        rose.style.transform = `scale(${0.6 + Math.random() * 0.8}) rotate(${rotation}deg)`;
        
        hollow.appendChild(rose);
        roseCount++;
        counterDisplay.innerText = `Roses: ${roseCount}`;
        
        break; 
      } while (roseCount < totalRoses);
      
      if (roseCount >= totalRoses) clearInterval(interval);
    }, 40);
  };