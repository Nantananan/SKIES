(function () {
  const strip = document.getElementById('floor-strip');
  const allFloorEls = Array.from(document.querySelectorAll('.floor'));
  // Hidden room is excluded from normal navigation (indicator dots,
  // up/down bounds, wheel/touch/keyboard stepping) — it's only reachable
  // via the easter egg trigger, not by scrolling/clicking through in order.
  // Built with a while loop instead of .filter().
  const floors = [];
  let scanIndex = 0;
  while (scanIndex < allFloorEls.length) {
    const el = allFloorEls[scanIndex];
    if (!el.classList.contains('floor-secret')) {
      floors.push(el);
    }
    scanIndex++;
  }
  const secretFloor = document.getElementById('floor-secret');
  const total = floors.length;
  const indicatorWrap = document.getElementById('floor-indicator');
  const btnUp = document.getElementById('btn-up');
  const btnDown = document.getElementById('btn-down');
  const floorTagNum = document.getElementById('floor-tag-num');
  const floorTagTotal = document.getElementById('floor-tag-total');

  floorTagTotal.textContent = total;

  let currentIndex = 0;
  let isAnimating = false;

  // Build one indicator dot per floor — for loop instead of .forEach()
  for (let i = 0; i < floors.length; i++) {
    const dot = document.createElement('div');
    dot.className = 'indicator-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToFloor(i));
    indicatorWrap.appendChild(dot);
  }
  const dots = Array.from(indicatorWrap.children);

  function updateUI(index) {
    // do...while loop instead of .forEach() — runs at least once, safe
    // here since there's always at least one floor/dot in this template.
    let i = 0;
    do {
      dots[i].classList.toggle('active', i === index);
      i++;
    } while (i < dots.length);

    floorTagNum.textContent = index + 1;
    btnUp.disabled = index === 0;
    btnDown.disabled = index === total - 1;
  }

  // Slide the strip so a given element's top aligns with the viewport top.
  // Shared by normal floor navigation AND the easter-egg teleport, since
  // both are just "move the strip to align this element."
  function slideToElement(el) {
    isAnimating = true;
    strip.style.transform = `translateY(${-el.offsetTop}px)`;
    setTimeout(() => { isAnimating = false; }, 800); // matches --transition-duration
  }

  // Move the WHOLE strip (floors + slabs together) as one piece — the
  // "camera slide" effect from the reference video, where curtains and
  // scene pan together rather than staying fixed.
  function goToFloor(index) {
    if (index < 0 || index >= total || isAnimating) return;
    currentIndex = index;
    slideToElement(floors[index]);
    updateUI(index);
  }

  btnUp.addEventListener('click', () => goToFloor(currentIndex - 1));
  btnDown.addEventListener('click', () => goToFloor(currentIndex + 1));

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'PageUp') goToFloor(currentIndex - 1);
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') goToFloor(currentIndex + 1);
  });

  let wheelLock = false;
  window.addEventListener('wheel', (e) => {
    if (wheelLock) return;
    if (Math.abs(e.deltaY) < 15) return;
    wheelLock = true;
    if (e.deltaY > 0) goToFloor(currentIndex + 1);
    else goToFloor(currentIndex - 1);
    setTimeout(() => { wheelLock = false; }, 800);
  }, { passive: true });

  let touchStartY = null;
  let touchStartTarget = null;
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
    touchStartTarget = e.target;
  }, { passive: true });
  window.addEventListener('touchend', (e) => {
    if (touchStartY === null) return;
    const diff = touchStartY - e.changedTouches[0].clientY;

    if (Math.abs(diff) > 50) {
      // On small screens a floor's content can scroll internally (see the
      // 700px media query in styles.css). If the swipe happened inside a
      // scrollable box that hasn't hit its top/bottom edge yet, let the
      // browser's native scroll handle it instead of also changing floors.
      const scrollBox = touchStartTarget ? touchStartTarget.closest('.floor-placeholder-box') : null;
      const isScrollable = scrollBox && scrollBox.scrollHeight > scrollBox.clientHeight;

      let atEdge = true;
      if (isScrollable) {
        const atTop = scrollBox.scrollTop <= 0;
        const atBottom = Math.ceil(scrollBox.scrollTop + scrollBox.clientHeight) >= scrollBox.scrollHeight;
        atEdge = diff > 0 ? atBottom : atTop; // swiping up (diff>0) means content moves toward the bottom
      }

      if (atEdge) {
        if (diff > 0) goToFloor(currentIndex + 1);
        else goToFloor(currentIndex - 1);
      }
    }
    touchStartY = null;
    touchStartTarget = null;
  }, { passive: true });

  window.addEventListener('resize', () => {
    strip.style.transition = 'none';
    strip.style.transform = `translateY(${-floors[currentIndex].offsetTop}px)`;
    requestAnimationFrame(() => {
      strip.style.transition = '';
    });
    updateStageScale();
  });

  // ---------- Stage scaling (fixed layout, scaled as one unit) ----------
  // Every floor's content sits on a fixed-size "stage" (--stage-width x
  // --stage-height, set in styles.css) with static px positions — nothing
  // reflows or restacks. Instead, the whole stage is scaled up/down with
  // a single transform to fit whatever screen it's on, the same way a
  // fixed-resolution game canvas letterboxes to fit the window.
  function updateStageScale() {
    const rootStyle = getComputedStyle(document.documentElement);
    const stageWidth = parseFloat(rootStyle.getPropertyValue('--stage-width')) || 1600;
    const stageHeight = parseFloat(rootStyle.getPropertyValue('--stage-height')) || 900;

    const boxes = document.querySelectorAll('.floor-placeholder-box');
    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      const floorEl = box.closest('.floor');
      if (!floorEl) continue;
      
      const scale = Math.max(
        floorEl.clientWidth / stageWidth,
        floorEl.clientHeight / stageHeight
      );
      box.style.transform = `scale(${scale})`;
    }
  }

  updateStageScale();
  window.addEventListener('orientationchange', updateStageScale);

  updateUI(0);

  // ---------- Reusable image modal ----------
  // Opens with whatever image src is passed in — used by both the
  // easter egg and every .sky-clickable below. Matches the reference
  // video: grows/fades in via the .is-open class (see styles.css), and
  // if a DIFFERENT image is opened while the modal is already showing,
  // it crossfades to the new image instead of closing and reopening.
  const modal = document.getElementById('egg-modal');
  const modalBackdrop = document.getElementById('egg-modal-backdrop');
  const modalClose = document.getElementById('egg-modal-close');
  const modalImg = document.getElementById('egg-modal-img');
  const modalTitle = document.getElementById('egg-modal-title');

  function openModal(imgSrc, altText, titleText) {
    const alreadyOpen = modal.classList.contains('is-open');

    if (alreadyOpen && modalImg.src.indexOf(imgSrc) === -1) {
      // Swap in place: fade the current image (and title) out, swap, fade back in.
      modalImg.style.opacity = '0';
      modalTitle.style.opacity = '0';
      setTimeout(() => {
        modalImg.src = imgSrc || '';
        modalImg.alt = altText || '';
        modalTitle.textContent = titleText || '';
        modalImg.style.opacity = '1';
        modalTitle.style.opacity = '1';
      }, 150);
    } else {
      modalImg.style.opacity = '1';
      modalImg.src = imgSrc || '';
      modalImg.alt = altText || '';
      modalTitle.style.opacity = '1';
      modalTitle.textContent = titleText || '';
    }

    modal.hidden = false;
    // Next frame, so the browser registers [hidden] removal before the
    // class flips — otherwise the scale/opacity transition won't play.
    requestAnimationFrame(() => modal.classList.add('is-open'));
  }

  function closeModal() {
    modal.classList.remove('is-open');
    setTimeout(() => { modal.hidden = true; }, 250); // matches modal transition duration
  }

  modalBackdrop.addEventListener('click', closeModal);
  modalClose.addEventListener('click', closeModal);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  // ---------- Clickable image frames ----------
  // Any element with class="sky-clickable" and a data-full-src attribute
  // opens that image large in the shared modal when clicked. Add as many
  // as you like anywhere in the markup — no extra JS needed per element
  // (comets, planets, clouds, the fox, ...). Elements with no
  // data-full-src (like the snake, handled separately below) are skipped.
  const skyClickables = document.querySelectorAll('.sky-clickable[data-full-src]');
  for (let i = 0; i < skyClickables.length; i++) {
    const el = skyClickables[i];
    el.addEventListener('click', (e) => {
      e.stopPropagation(); // don't also trigger the floor's own click handler
      const src = el.getAttribute('data-full-src');
      const titleText = el.getAttribute('data-title') || '';
      openModal(src, titleText, titleText);
    });
  }

  // ---------- Per-floor click interaction ----------
  // The entire floor (the .floor-placeholder-box that now fills it) is
  // clickable. This is a placeholder handler — replace the console.log
  // with whatever each floor should actually do when clicked/tapped.
  const floorBoxes = document.querySelectorAll('.floor-placeholder-box');
  for (let i = 0; i < floorBoxes.length; i++) {
    const box = floorBoxes[i];
    box.addEventListener('click', () => {
      const floorNum = box.closest('.floor').getAttribute('data-floor');
      console.log('Floor clicked:', floorNum, '— replace this with real behavior');
    });
    // Keyboard accessibility: Enter/Space triggers the same as a click,
    // since these boxes are focusable (tabindex="0", role="button").
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        box.click();
      }
    });
  }

  // ---------- Easter egg: snake teleports back / to the hidden room ----------
  // The snake in the floor-3 grove is the trigger. Per the "location
  // choices" legend (Snake = go back), clicking it slides the strip to
  // the hidden room, bypassing the normal floors[] index/bounds entirely.
  const egg = document.getElementById('snake-trigger');

  if (egg && secretFloor) {
    egg.addEventListener('click', (e) => {
      e.stopPropagation(); // don't also trigger floor 3's own click handler
      slideToElement(secretFloor);
    });
    egg.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        egg.click();
      }
    });
  }
})();