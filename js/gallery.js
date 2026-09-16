(function () {
  "use strict";

  var images = window.LISTING_GALLERY || [];
  var galleryEl = document.querySelector("[data-gallery]");
  if (!galleryEl || !images.length) return;

  var mainImg = galleryEl.querySelector("[data-gallery-image]");
  var counterEl = galleryEl.querySelector("[data-gallery-counter]");
  var thumbsEl = galleryEl.querySelector("[data-gallery-thumbs]");
  var prevBtn = galleryEl.querySelector("[data-gallery-prev]");
  var nextBtn = galleryEl.querySelector("[data-gallery-next]");
  var expandBtn = galleryEl.querySelector("[data-gallery-open]");

  var lightbox = document.querySelector("[data-lightbox]");
  var lightboxImg = lightbox && lightbox.querySelector("[data-lightbox-image]");
  var lightboxCounter = lightbox && lightbox.querySelector("[data-lightbox-counter]");
  var lightboxPrev = lightbox && lightbox.querySelector("[data-lightbox-prev]");
  var lightboxNext = lightbox && lightbox.querySelector("[data-lightbox-next]");
  var lightboxClose = lightbox && lightbox.querySelector("[data-lightbox-close]");

  var current = 0;
  var isLightboxOpen = false;
  var hasMultiple = images.length > 1;

  if (!hasMultiple) {
    if (prevBtn) prevBtn.hidden = true;
    if (nextBtn) nextBtn.hidden = true;
    if (counterEl) counterEl.hidden = true;
    if (thumbsEl) thumbsEl.hidden = true;
  }

  function renderThumbs() {
    if (!thumbsEl || !hasMultiple) return;
    thumbsEl.innerHTML = "";
    images.forEach(function (img, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gallery-thumb";
      btn.setAttribute("aria-label", "Vis billede " + (i + 1) + " af " + images.length);
      var thumbImg = document.createElement("img");
      thumbImg.src = img.src;
      thumbImg.alt = "";
      thumbImg.loading = i < 4 ? "eager" : "lazy";
      btn.appendChild(thumbImg);
      btn.addEventListener("click", function () {
        setCurrent(i);
      });
      thumbsEl.appendChild(btn);
    });
  }

  function scrollThumbIntoView(btn) {
    var strip = thumbsEl;
    var btnLeft = btn.offsetLeft;
    var btnRight = btnLeft + btn.offsetWidth;
    var viewLeft = strip.scrollLeft;
    var viewRight = viewLeft + strip.clientWidth;
    if (btnLeft < viewLeft) {
      strip.scrollTo({ left: btnLeft - 8, behavior: "smooth" });
    } else if (btnRight > viewRight) {
      strip.scrollTo({ left: btnRight - strip.clientWidth + 8, behavior: "smooth" });
    }
  }

  function update() {
    var img = images[current];
    if (mainImg) {
      mainImg.src = img.src;
      mainImg.alt = img.alt || "";
    }
    if (counterEl) counterEl.textContent = current + 1 + " / " + images.length;
    if (thumbsEl) {
      var thumbButtons = thumbsEl.querySelectorAll(".gallery-thumb");
      thumbButtons.forEach(function (btn, i) {
        btn.classList.toggle("is-active", i === current);
        if (i === current) {
          scrollThumbIntoView(btn);
        }
      });
    }
    if (isLightboxOpen) updateLightbox();
  }

  function setCurrent(i) {
    current = (i + images.length) % images.length;
    update();
  }

  function updateLightbox() {
    if (!lightboxImg) return;
    var img = images[current];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || "";
    if (lightboxCounter) lightboxCounter.textContent = current + 1 + " / " + images.length;
  }

  function openLightbox() {
    if (!lightbox) return;
    isLightboxOpen = true;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    updateLightbox();
    if (lightboxClose) lightboxClose.focus({ preventScroll: true });
  }

  function closeLightbox() {
    if (!lightbox) return;
    isLightboxOpen = false;
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (expandBtn) expandBtn.focus({ preventScroll: true });
  }

  if (prevBtn) prevBtn.addEventListener("click", function () { setCurrent(current - 1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { setCurrent(current + 1); });
  if (mainImg) mainImg.addEventListener("click", openLightbox);
  if (expandBtn) expandBtn.addEventListener("click", openLightbox);

  if (lightbox) {
    if (lightboxPrev) lightboxPrev.hidden = !hasMultiple;
    if (lightboxNext) lightboxNext.hidden = !hasMultiple;
    if (lightboxCounter) lightboxCounter.hidden = !hasMultiple;

    if (lightboxPrev) lightboxPrev.addEventListener("click", function () { setCurrent(current - 1); });
    if (lightboxNext) lightboxNext.addEventListener("click", function () { setCurrent(current + 1); });
    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") setCurrent(current - 1);
      if (e.key === "ArrowRight") setCurrent(current + 1);
    });

    var touchStartX = null;
    lightbox.addEventListener(
      "touchstart",
      function (e) {
        touchStartX = e.changedTouches[0].clientX;
      },
      { passive: true }
    );
    lightbox.addEventListener(
      "touchend",
      function (e) {
        if (touchStartX === null) return;
        var dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 40) {
          if (dx > 0) setCurrent(current - 1);
          else setCurrent(current + 1);
        }
        touchStartX = null;
      },
      { passive: true }
    );
  }

  galleryEl.setAttribute("tabindex", "0");
  galleryEl.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") setCurrent(current - 1);
    if (e.key === "ArrowRight") setCurrent(current + 1);
  });

  renderThumbs();
  update();
})();
