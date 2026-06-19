/* =========================================================
   For Luhim - Farewell Web
   - Fade slider foto/video
   - Swipe mobile
   - Intro cover + play music
   - Video muted, musik tetap volume 75%
   - Countdown PRJ 25 Juni 2026
========================================================= */

const CONFIG = {
  autoSlideDelay: 5200,
  musicVolume: 0.75,
  swipeThreshold: 50,
  farewellDate: '2026-06-25T18:00:00+07:00'
};

const elements = {
  introCover: document.getElementById('introCover'),
  introPlay: document.getElementById('introPlay'),
  mainContent: document.getElementById('mainContent'),
  slider: document.getElementById('slider'),
  slides: document.querySelectorAll('.slide'),
  dotsContainer: document.getElementById('dots'),
  prevBtn: document.getElementById('prevBtn'),
  nextBtn: document.getElementById('nextBtn'),
  musicBtn: document.getElementById('musicBtn'),
  bgMusic: document.getElementById('bgMusic'),
  countdown: document.getElementById('miniCountdown')
};

let currentSlide = 0;
let autoSlideTimer = null;
let touchStartX = 0;
let touchEndX = 0;

elements.bgMusic.volume = CONFIG.musicVolume;

function setMusicButton(isPlaying) {
  elements.musicBtn.innerHTML = isPlaying ? '⏸ Pause music' : '▶ Play music';
}

async function playMusic() {
  try {
    await elements.bgMusic.play();
    setMusicButton(true);
  } catch (error) {
    setMusicButton(false);
    console.log('Autoplay/play music diblok browser:', error);
  }
}

function pauseMusic() {
  elements.bgMusic.pause();
  setMusicButton(false);
}

function toggleMusic() {
  if (elements.bgMusic.paused) {
    playMusic();
  } else {
    pauseMusic();
  }
}

function createDots() {
  elements.slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = index === 0 ? 'dot active' : 'dot';
    dot.setAttribute('aria-label', `Slide ${index + 1}`);
    dot.addEventListener('click', () => goToSlide(index));
    elements.dotsContainer.appendChild(dot);
  });
}

function getDots() {
  return document.querySelectorAll('.dot');
}

function stopAllVideos() {
  document.querySelectorAll('.slide video').forEach((video) => {
    video.pause();
    video.currentTime = 0;
    video.muted = true;
  });
}

function handleActiveVideo() {
  stopAllVideos();

  const activeSlide = elements.slides[currentSlide];
  const activeVideo = activeSlide.querySelector('video');

  if (!activeVideo) return;

  clearInterval(autoSlideTimer);
  activeVideo.muted = true;
  activeVideo.currentTime = 0;

  activeVideo.play().catch((error) => {
    console.log('Video gagal autoplay:', error);
  });

  activeVideo.onended = () => {
    nextSlide();
    resetAutoSlide();
  };
}

function updateSlider() {
  const dots = getDots();

  elements.slides.forEach((slide, index) => {
    slide.classList.toggle('active', index === currentSlide);
  });

  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentSlide);
  });

  const activeDot = dots[currentSlide];
  if (activeDot) {
    activeDot.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    });
  }

  handleActiveVideo();
}

function goToSlide(index) {
  currentSlide = (index + elements.slides.length) % elements.slides.length;
  updateSlider();
  resetAutoSlide();
}

function nextSlide() {
  goToSlide(currentSlide + 1);
}

function prevSlide() {
  goToSlide(currentSlide - 1);
}

function resetAutoSlide() {
  clearInterval(autoSlideTimer);

  const activeVideo = elements.slides[currentSlide].querySelector('video');
  if (!activeVideo) {
    autoSlideTimer = setInterval(nextSlide, CONFIG.autoSlideDelay);
  }
}

function handleSwipe() {
  const distance = touchEndX - touchStartX;

  if (distance < -CONFIG.swipeThreshold) nextSlide();
  if (distance > CONFIG.swipeThreshold) prevSlide();
}

function updateCountdown() {
  const target = new Date(CONFIG.farewellDate).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    elements.countdown.innerHTML = '<p class="countdown-today">Hari ini.</p>';
    return;
  }

  document.getElementById('cdDays').textContent =
    String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');

  document.getElementById('cdHours').textContent =
    String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');

  document.getElementById('cdMinutes').textContent =
    String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');

  document.getElementById('cdSeconds').textContent =
    String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
}

function openMemory() {
  elements.introCover.classList.add('hide');
  elements.mainContent.classList.remove('is-hidden');
  elements.mainContent.classList.add('is-visible');

  playMusic();

  setTimeout(() => {
    elements.introCover.style.display = 'none';
  }, 900);
}

function bindEvents() {
  elements.introPlay.addEventListener('click', openMemory);
  elements.musicBtn.addEventListener('click', toggleMusic);
  elements.nextBtn.addEventListener('click', nextSlide);
  elements.prevBtn.addEventListener('click', prevSlide);

  elements.slider.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX;
  }, { passive: true });

  elements.slider.addEventListener('touchend', (event) => {
    touchEndX = event.changedTouches[0].clientX;
    handleSwipe();
  });
}

let wasPlayingBeforeHide = false;

function handlePageVisibility() {
  if (document.hidden) {
    wasPlayingBeforeHide = !elements.bgMusic.paused;

    if (wasPlayingBeforeHide) {
      pauseMusic();
    }

    return;
  }

  if (wasPlayingBeforeHide) {
    playMusic();
  }
}

document.addEventListener('visibilitychange', handlePageVisibility);

function init() {
  createDots();
  bindEvents();
  updateCountdown();
  setInterval(updateCountdown, 1000);
  resetAutoSlide();
  setMusicButton(false);
}

init();