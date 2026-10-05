// ===== Countdown to launch =====
(function () {
  var launch = new Date(2027, 0, 1, 0, 0, 0); // 1 January 2027, local time
  var els = {
    d: document.getElementById('cd-days'),
    h: document.getElementById('cd-hours'),
    m: document.getElementById('cd-mins'),
    s: document.getElementById('cd-secs')
  };
  var pad = function (n) { return String(n).padStart(2, '0'); };

  function tick() {
    var diff = Math.max(0, launch - new Date());
    var secs = Math.floor(diff / 1000);
    els.d.textContent = pad(Math.floor(secs / 86400));
    els.h.textContent = pad(Math.floor((secs % 86400) / 3600));
    els.m.textContent = pad(Math.floor((secs % 3600) / 60));
    els.s.textContent = pad(secs % 60);
    if (diff === 0) {
      document.getElementById('launch-text').textContent = 'We have launched!';
      clearInterval(timer);
    }
  }
  var timer = setInterval(tick, 1000);
  tick();
})();

// ===== Demo booking flow =====
var SERVICES = {
  makeup: {
    name: 'Makeup',
    options: [
      { name: 'Everyday makeup', duration: '45 min', price: 1200 },
      { name: 'Party / event makeup', duration: '1 hr', price: 1800 },
      { name: 'Bridal makeup', duration: '2 hr', price: 4500 }
    ],
    artists: [
      { name: 'Ploy S.', area: 'Sukhumvit, Bangkok', rating: 4.9, extra: 0 },
      { name: 'Mint K.', area: 'Nimman, Chiang Mai', rating: 4.8, extra: 0 },
      { name: 'Fah R.', area: 'Patong, Phuket', rating: 5.0, extra: 300 }
    ]
  },
  hair: {
    name: 'Hair',
    options: [
      { name: 'Cut and blow-dry', duration: '1 hr', price: 500 },
      { name: 'Event styling', duration: '1 hr', price: 900 },
      { name: 'Full colour', duration: '2.5 hr', price: 2500 }
    ],
    artists: [
      { name: 'Nok T.', area: 'Silom, Bangkok', rating: 4.8, extra: 0 },
      { name: 'Beam P.', area: 'Ari, Bangkok', rating: 4.9, extra: 200 },
      { name: 'Joy W.', area: 'Khon Kaen city', rating: 4.7, extra: 0 }
    ]
  },
  nails: {
    name: 'Nails',
    options: [
      { name: 'Classic manicure', duration: '45 min', price: 350 },
      { name: 'Gel manicure', duration: '1 hr', price: 650 },
      { name: 'Gel mani + pedi with nail art', duration: '2 hr', price: 1500 }
    ],
    artists: [
      { name: 'Ice N.', area: 'Thonglor, Bangkok', rating: 4.9, extra: 0 },
      { name: 'Pim C.', area: 'Pattaya', rating: 4.8, extra: 0 },
      { name: 'Aom J.', area: 'Hua Hin', rating: 4.7, extra: 0 }
    ]
  },
  spa: {
    name: 'Spa',
    options: [
      { name: 'Thai massage', duration: '1 hr', price: 600 },
      { name: 'Aromatherapy oil massage', duration: '1.5 hr', price: 1200 },
      { name: 'Facial treatment', duration: '1 hr', price: 1500 }
    ],
    artists: [
      { name: 'Som L.', area: 'Old Town, Chiang Mai', rating: 5.0, extra: 0 },
      { name: 'Kwan M.', area: 'Sathorn, Bangkok', rating: 4.9, extra: 200 },
      { name: 'Dao B.', area: 'Krabi town', rating: 4.8, extra: 0 }
    ]
  }
};
var HOME_FEE = 300;
var TIMES = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

var modal = document.getElementById('modal');
var form = document.getElementById('booking-form');
var summary = document.getElementById('summary');
var errorEl = document.getElementById('form-error');
var dateInput = document.getElementById('booking-date');
var timeSelect = document.getElementById('booking-time');
var lastTrigger = null;
var current = null;

var baht = function (n) { return '฿' + n.toLocaleString('en-US'); };

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

TIMES.forEach(function (t) {
  var opt = document.createElement('option');
  opt.value = t;
  opt.textContent = t;
  timeSelect.appendChild(opt);
});

function isoDate(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function openBooking(key) {
  current = SERVICES[key];
  document.getElementById('modal-title').textContent = 'Book ' + current.name;

  document.getElementById('option-list').innerHTML = current.options.map(function (o, i) {
    return '<label class="choice"><input type="radio" name="option" value="' + i + '"' + (i === 0 ? ' checked' : '') + '>' +
      '<span><strong>' + escapeHtml(o.name) + '</strong><small>' + escapeHtml(o.duration) + '</small></span>' +
      '<span class="price">' + baht(o.price) + '</span></label>';
  }).join('');

  document.getElementById('artist-list').innerHTML = current.artists.map(function (a, i) {
    return '<label class="choice"><input type="radio" name="artist" value="' + i + '"' + (i === 0 ? ' checked' : '') + '>' +
      '<span><strong>' + escapeHtml(a.name) + ' · ★ ' + a.rating.toFixed(1) + '</strong><small>' + escapeHtml(a.area) + '</small></span>' +
      '<span class="price">' + (a.extra ? '+' + baht(a.extra) : '') + '</span></label>';
  }).join('');

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.min = isoDate(tomorrow);
  dateInput.value = isoDate(tomorrow);
  timeSelect.value = '';
  form.querySelector('input[name="location"][value="studio"]').checked = true;
  form.querySelector('input[name="payment"]').checked = true;
  errorEl.textContent = '';

  form.hidden = false;
  summary.hidden = true;
  modal.hidden = false;
  document.body.classList.add('modal-open');
  modal.querySelector('.modal').scrollTop = 0;
  document.getElementById('modal-close').focus();
}

function closeBooking() {
  modal.hidden = true;
  document.body.classList.remove('modal-open');
  if (lastTrigger) lastTrigger.focus();
}

document.querySelectorAll('.service-card').forEach(function (card) {
  card.addEventListener('click', function () {
    lastTrigger = card;
    openBooking(card.dataset.service);
  });
});

document.getElementById('modal-close').addEventListener('click', closeBooking);
document.getElementById('done-btn').addEventListener('click', closeBooking);
modal.addEventListener('click', function (e) { if (e.target === modal) closeBooking(); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeBooking(); });

form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (!dateInput.value || dateInput.value < dateInput.min) {
    errorEl.textContent = 'Please choose a date from tomorrow onwards.';
    dateInput.focus();
    return;
  }
  if (!timeSelect.value) {
    errorEl.textContent = 'Please choose a time.';
    timeSelect.focus();
    return;
  }

  var option = current.options[+form.querySelector('input[name="option"]:checked').value];
  var artist = current.artists[+form.querySelector('input[name="artist"]:checked').value];
  var location = form.querySelector('input[name="location"]:checked').value;
  var payment = form.querySelector('input[name="payment"]:checked').value;
  var homeFee = location === 'home' ? HOME_FEE : 0;
  var total = option.price + artist.extra + homeFee;

  var d = new Date(dateInput.value + 'T00:00:00');
  var dateText = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });

  var rows = [
    ['Service', current.name + ' — ' + option.name],
    ['Price', baht(option.price)],
    ['Artist', artist.name + ' (' + artist.area + ')'],
    ['Date', dateText],
    ['Time', timeSelect.value],
    ['Location', location === 'home' ? 'Home visit' : 'At the studio'],
    ['Payment', payment]
  ];
  if (artist.extra) rows.splice(3, 0, ['Senior artist fee', baht(artist.extra)]);
  if (homeFee) rows.push(['Home visit fee', baht(homeFee)]);

  document.getElementById('summary-list').innerHTML = rows.map(function (r) {
    return '<dt>' + escapeHtml(r[0]) + '</dt><dd>' + escapeHtml(r[1]) + '</dd>';
  }).join('');
  document.getElementById('summary-total').textContent = baht(total);

  document.getElementById('modal-title').textContent = 'Booking summary';
  form.hidden = true;
  summary.hidden = false;
  modal.querySelector('.modal').scrollTop = 0;
  document.getElementById('done-btn').focus();
});
