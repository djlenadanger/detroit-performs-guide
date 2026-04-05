/* ── Detroit Performs: Live From Marygrove — Episode Guide ─────────── */

// ── State ────────────────────────────────────────────────────────────
const state = {
  season: 'all',
  video:  'all',
  genre:  'all',
  curator:'all',
  search: ''
};

// ── DOM refs ──────────────────────────────────────────────────────────
const grid          = document.getElementById('episodes-grid');
const noResults     = document.getElementById('no-results');
const resultsCount  = document.getElementById('results-count');
const clearBtn      = document.getElementById('clear-filters');
const genreSelect   = document.getElementById('select-genre');
const curatorSelect = document.getElementById('select-curator');
const searchInput   = document.getElementById('search-artist');
const modalOverlay  = document.getElementById('modal-overlay');
const modalClose    = document.getElementById('modal-close');
const modalVideo    = document.getElementById('modal-video-wrap');
const modalMeta     = document.getElementById('modal-meta');

// ── Helpers ───────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function youtubeThumb(id) {
  return 'https://img.youtube.com/vi/' + id + '/mqdefault.jpg';
}

function placeholderHTML() {
  return '<div class="card-thumb-placeholder">' +
    '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">' +
    '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="m8 21 4-4 4 4M12 17v4"/></svg>' +
    '<span>Marygrove Stage</span></div>';
}

// ── Populate filter dropdowns ─────────────────────────────────────────
function populateFilters() {
  const genres   = new Set();
  const curators = new Set();
  EPISODES.forEach(function(ep) {
    ep.genres.forEach(function(g) { genres.add(g); });
    curators.add(ep.curator);
  });
  Array.from(genres).sort().forEach(function(g) {
    var opt = document.createElement('option');
    opt.value = g; opt.textContent = g;
    genreSelect.appendChild(opt);
  });
  Array.from(curators).sort().forEach(function(c) {
    var opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    curatorSelect.appendChild(opt);
  });
}

// ── Filter logic ──────────────────────────────────────────────────────
function filteredEpisodes() {
  return EPISODES.filter(function(ep) {
    if (state.season !== 'all' && ep.season !== Number(state.season)) return false;
    if (state.video  === 'yes' && !ep.youtubeId) return false;
    if (state.genre  !== 'all' && ep.genres.indexOf(state.genre) === -1) return false;
    if (state.curator !== 'all' && ep.curator !== state.curator) return false;
    if (state.search) {
      var q = state.search.toLowerCase();
      var searchable = [ep.title, ep.curator]
        .concat(ep.artists)
        .concat(ep.genres)
        .concat([ep.neighborhood || '', ep.description])
        .join(' ').toLowerCase();
      if (searchable.indexOf(q) === -1) return false;
    }
    return true;
  });
}

function isFiltered() {
  return state.season !== 'all' || state.video !== 'all' ||
         state.genre  !== 'all' || state.curator !== 'all' ||
         state.search !== '';
}

// ── Build card HTML ───────────────────────────────────────────────────
function buildCard(ep) {
  var sc      = 's' + ep.season;
  var hasvid  = !!ep.youtubeId;
  var hasPBS  = !!ep.pbsUrl;
  var dateStr = formatDate(ep.airDate);

  // Thumb section — NO nested <button>; use a plain div with data attrs
  var thumbContent = hasvid
    ? '<img class="card-thumb-img" src="' + youtubeThumb(ep.youtubeId) + '" ' +
        'alt="' + ep.title.replace(/"/g, '&quot;') + ' thumbnail" loading="lazy" ' +
        'onerror="this.style.display=\'none\'">' +
      '<div class="play-overlay" aria-hidden="true">' +
        '<div class="play-circle">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="white" style="margin-left:3px">' +
            '<polygon points="5,3 19,12 5,21"/></svg>' +
        '</div>' +
      '</div>'
    : placeholderHTML();

  var thumbAttrs = hasvid
    ? ' data-ytid="' + ep.youtubeId + '" ' +
      'data-title="' + ep.title.replace(/"/g, '&quot;') + '" ' +
      'data-meta="Season ' + ep.season + ' \u00B7 Ep. ' + ep.episode + ' \u00B7 ' + dateStr + '" ' +
      'role="button" tabindex="0" aria-label="Watch ' + ep.title.replace(/"/g, '&quot;') + '"'
    : '';

  var artistChips = ep.artists.map(function(a) {
    return '<span class="artist-chip">' + a + '</span>';
  }).join('');

  var genreTags = ep.genres.slice(0, 3).map(function(g) {
    return '<span class="genre-tag">' + g + '</span>';
  }).join('');

  // Footer: watch button uses data-action="watch" for delegation
  var footerHTML;
  if (hasvid) {
    footerHTML =
      '<button class="watch-btn" data-action="watch" ' +
        'data-ytid="' + ep.youtubeId + '" ' +
        'data-title="' + ep.title.replace(/"/g, '&quot;') + '" ' +
        'data-meta="Season ' + ep.season + ' \u00B7 Ep. ' + ep.episode + ' \u00B7 ' + dateStr + '">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>' +
        ' Watch Episode' +
      '</button>' +
      (hasPBS ? '<a href="' + ep.pbsUrl + '" target="_blank" rel="noopener" class="pbs-link-btn">PBS &#8599;</a>' : '');
  } else {
    footerHTML =
      '<span class="no-video-note">Video not yet available</span>' +
      (hasPBS ? '<a href="' + ep.pbsUrl + '" target="_blank" rel="noopener" class="pbs-link-btn">View on PBS &#8599;</a>' : '');
  }

  return '<article class="episode-card" data-id="' + ep.id + '">' +
    '<div class="card-thumb' + (hasvid ? ' has-video' : '') + '"' + thumbAttrs + '>' +
      thumbContent +
    '</div>' +
    '<div class="season-stripe ' + sc + '"></div>' +
    '<div class="card-body">' +
      '<div class="card-meta-top">' +
        '<span class="card-season-badge ' + sc + '">S' + ep.season + ' \u00B7 Ep. ' + ep.episode + '</span>' +
        '<span class="card-date">' + dateStr + '</span>' +
      '</div>' +
      '<h2 class="card-title">' + ep.title + '</h2>' +
      '<p class="card-curator">\uD83C\uDFAD ' + ep.curator + '</p>' +
      (artistChips ? '<div class="card-artists">' + artistChips + '</div>' : '') +
      (genreTags   ? '<div class="card-genres">'  + genreTags  + '</div>' : '') +
      '<p class="card-desc">' + ep.description + '</p>' +
    '</div>' +
    '<div class="card-footer">' + footerHTML + '</div>' +
  '</article>';
}

// ── Render ────────────────────────────────────────────────────────────
function render() {
  var episodes = filteredEpisodes();
  grid.innerHTML = episodes.map(buildCard).join('');
  noResults.hidden = episodes.length > 0;
  resultsCount.textContent = episodes.length + (episodes.length === 1 ? ' episode' : ' episodes');
  clearBtn.hidden = !isFiltered();
}

// ── Event delegation — ONE listener on the grid, never re-attached ────
grid.addEventListener('click', function(e) {
  // Watch button
  var watchBtn = e.target.closest('[data-action="watch"]');
  if (watchBtn) {
    e.stopPropagation();
    openModal(watchBtn.dataset.ytid, watchBtn.dataset.title, watchBtn.dataset.meta);
    return;
  }
  // Thumb click (has-video)
  var thumb = e.target.closest('.card-thumb.has-video');
  if (thumb) {
    openModal(thumb.dataset.ytid, thumb.dataset.title, thumb.dataset.meta);
  }
});

grid.addEventListener('keydown', function(e) {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  var thumb = e.target.closest('.card-thumb.has-video');
  if (thumb) {
    e.preventDefault();
    openModal(thumb.dataset.ytid, thumb.dataset.title, thumb.dataset.meta);
  }
});

// ── Modal ─────────────────────────────────────────────────────────────
function openModal(ytid, title, meta) {
  modalVideo.innerHTML = '<iframe src="https://www.youtube.com/embed/' + ytid +
    '?autoplay=1&rel=0" allowfullscreen allow="autoplay; encrypted-media"></iframe>';
  modalMeta.innerHTML = '<h2>' + title + '</h2><p>' + meta + '</p>';
  modalOverlay.hidden = false;
  document.body.style.overflow = 'hidden';
  modalClose.focus();
}

function closeModal() {
  modalOverlay.hidden = true;
  modalVideo.innerHTML = '';
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', function(e) {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && !modalOverlay.hidden) closeModal();
});

// ── Filter event listeners ────────────────────────────────────────────
document.querySelectorAll('.filter-btn[data-filter]').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var filterType = btn.dataset.filter;
    document.querySelectorAll('.filter-btn[data-filter="' + filterType + '"]').forEach(function(b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');
    state[filterType] = btn.dataset.value;
    render();
  });
});

genreSelect.addEventListener('change', function() {
  state.genre = genreSelect.value;
  render();
});

curatorSelect.addEventListener('change', function() {
  state.curator = curatorSelect.value;
  render();
});

searchInput.addEventListener('input', function() {
  state.search = searchInput.value.trim();
  render();
});

function clearFilters() {
  state.season = 'all'; state.video = 'all';
  state.genre  = 'all'; state.curator = 'all'; state.search = '';
  document.querySelectorAll('.filter-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.value === 'all');
  });
  genreSelect.value   = 'all';
  curatorSelect.value = 'all';
  searchInput.value   = '';
  render();
}

clearBtn.addEventListener('click', clearFilters);

document.getElementById('no-results-clear').addEventListener('click', clearFilters);

// ── Theme toggle ──────────────────────────────────────────────────────
(function() {
  var toggle = document.querySelector('[data-theme-toggle]');
  var root   = document.documentElement;
  var theme  = root.getAttribute('data-theme') ||
               (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
  root.setAttribute('data-theme', theme);

  function updateToggle() {
    if (!toggle) return;
    toggle.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
    toggle.innerHTML = theme === 'dark'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }
  updateToggle();

  if (toggle) {
    toggle.addEventListener('click', function() {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      updateToggle();
    });
  }
})();

// ── Init ──────────────────────────────────────────────────────────────
populateFilters();
render();
