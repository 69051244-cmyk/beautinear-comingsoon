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

// ===== Payment details — replace with your real details before going live =====
var PAYMENT = {
  promptpayId: '0000000000',          // mobile number (10 digits) or tax / national ID (13 digits)
  promptpayName: 'BeautiNear',
  bankName: 'Kasikorn Bank (KBank)',
  bankAccount: '000-0-00000-0',
  bankHolder: 'BeautiNear Co., Ltd.'
};
var PAYMENT_LABELS = { card: 'Credit / debit card', promptpay: 'PromptPay QR', transfer: 'Bank transfer' };
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
  resetPayment();

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

  var payment = selectedPayment();
  if (payment === 'card') {
    var cardError = validateCard();
    if (cardError) {
      errorEl.textContent = cardError[0];
      cardError[1].focus();
      return;
    }
  }
  if (payment === 'transfer' && !slipFile) {
    errorEl.textContent = 'Please upload your payment slip.';
    slipInput.focus();
    return;
  }

  var b = bookingTotal();
  var option = b.option;
  var artist = b.artist;
  var location = b.location;
  var homeFee = b.homeFee;
  var total = b.total;

  var paymentText = PAYMENT_LABELS[payment];
  if (payment === 'card') paymentText += ' •••• ' + cardDigits().slice(-4);
  if (payment === 'transfer') paymentText += ' (slip: ' + slipFile.name + ')';

  var d = new Date(dateInput.value + 'T00:00:00');
  var dateText = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });

  var rows = [
    ['Service', current.name + ' — ' + option.name],
    ['Price', baht(option.price)],
    ['Artist', artist.name + ' (' + artist.area + ')'],
    ['Date', dateText],
    ['Time', timeSelect.value],
    ['Location', location === 'home' ? 'Home visit' : 'At the studio'],
    ['Payment', paymentText]
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

// ===== Payment methods =====
var slipInput = document.getElementById('slip-input');
var slipPreview = document.getElementById('slip-preview');
var slipText = document.getElementById('slip-text');
var cardNumber = document.getElementById('card-number');
var cardName = document.getElementById('card-name');
var cardExpiry = document.getElementById('card-expiry');
var cardCvv = document.getElementById('card-cvv');
var slipFile = null;
var SLIP_MAX_BYTES = 10 * 1024 * 1024;

document.getElementById('qr-name').textContent = PAYMENT.promptpayName;
document.getElementById('qr-id').textContent = PAYMENT.promptpayId;
document.getElementById('bank-name').textContent = PAYMENT.bankName;
document.getElementById('bank-account').textContent = PAYMENT.bankAccount;
document.getElementById('bank-holder').textContent = PAYMENT.bankHolder;

function selectedPayment() {
  return form.querySelector('input[name="payment"]:checked').value;
}

function bookingTotal() {
  var option = current.options[+form.querySelector('input[name="option"]:checked').value];
  var artist = current.artists[+form.querySelector('input[name="artist"]:checked').value];
  var location = form.querySelector('input[name="location"]:checked').value;
  var homeFee = location === 'home' ? HOME_FEE : 0;
  return { option: option, artist: artist, location: location, homeFee: homeFee, total: option.price + artist.extra + homeFee };
}

// PromptPay payload (EMVCo / Thai QR standard)
function tlv(id, value) {
  return id + String(value.length).padStart(2, '0') + value;
}

function crc16(s) {
  var crc = 0xFFFF;
  for (var i = 0; i < s.length; i++) {
    crc ^= s.charCodeAt(i) << 8;
    for (var j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
    crc &= 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function promptpayPayload(id, amount) {
  var digits = id.replace(/\D/g, '');
  var target = digits.length >= 13
    ? tlv('02', digits)                                          // tax / national ID
    : tlv('01', ('0000000000000' + '66' + digits.replace(/^0/, '')).slice(-13)); // mobile number
  var payload =
    tlv('00', '01') +
    tlv('01', amount ? '12' : '11') +
    tlv('29', tlv('00', 'A000000677010111') + target) +
    tlv('53', '764') +
    (amount ? tlv('54', amount.toFixed(2)) : '') +
    tlv('58', 'TH') +
    '6304';
  return payload + crc16(payload);
}

function renderPaymentAmount() {
  if (!current) return;
  var total = bookingTotal().total;
  document.getElementById('qr-amount').textContent = baht(total);
  document.getElementById('bank-amount').textContent = baht(total);

  var box = document.getElementById('qr-code');
  if (typeof qrcode !== 'function') {
    box.textContent = 'QR code could not load. Please check your connection.';
    return;
  }
  var qr = qrcode(0, 'M');
  qr.addData(promptpayPayload(PAYMENT.promptpayId, total));
  qr.make();
  box.innerHTML = qr.createSvgTag({ cellSize: 5, margin: 2, scalable: true });
}

function showPaymentPanel() {
  var method = selectedPayment();
  ['card', 'promptpay', 'transfer'].forEach(function (m) {
    document.getElementById('pay-' + m).hidden = m !== method;
  });
  errorEl.textContent = '';
}

function clearSlip() {
  slipFile = null;
  slipInput.value = '';
  if (slipPreview.src) URL.revokeObjectURL(slipPreview.src);
  slipPreview.removeAttribute('src');
  slipPreview.hidden = true;
  slipText.innerHTML = '<strong>Upload payment slip</strong><small>JPG or PNG, up to 10 MB</small>';
}

function resetPayment() {
  cardNumber.value = cardName.value = cardExpiry.value = cardCvv.value = '';
  clearSlip();
  showPaymentPanel();
  renderPaymentAmount();
}

form.addEventListener('change', function (e) {
  if (e.target.name === 'payment') showPaymentPanel();
  if (['option', 'artist', 'location'].indexOf(e.target.name) !== -1) renderPaymentAmount();
});

// Card input
function cardDigits() {
  return cardNumber.value.replace(/\D/g, '');
}

function luhn(num) {
  var sum = 0;
  for (var i = 0; i < num.length; i++) {
    var d = +num[num.length - 1 - i];
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return sum % 10 === 0;
}

cardNumber.addEventListener('input', function () {
  cardNumber.value = cardDigits().slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
});
cardExpiry.addEventListener('input', function (e) {
  var d = cardExpiry.value.replace(/\D/g, '').slice(0, 4);
  cardExpiry.value = d.length > 2 || (d.length === 2 && e.inputType !== 'deleteContentBackward') ? d.slice(0, 2) + '/' + d.slice(2) : d;
});
cardCvv.addEventListener('input', function () {
  cardCvv.value = cardCvv.value.replace(/\D/g, '').slice(0, 4);
});

function validateCard() {
  var num = cardDigits();
  if (num.length !== 16) return ['Card number must be 16 digits.', cardNumber];
  if (!luhn(num)) return ['Please enter a valid card number.', cardNumber];
  if (!cardName.value.trim()) return ['Please enter the name on the card.', cardName];
  var m = cardExpiry.value.match(/^(\d{2})\/(\d{2})$/);
  if (!m || +m[1] < 1 || +m[1] > 12) return ['Please enter the expiry date as MM/YY.', cardExpiry];
  var now = new Date();
  var expEnd = new Date(2000 + +m[2], +m[1], 1); // first day after the expiry month
  if (expEnd <= now) return ['This card has expired.', cardExpiry];
  if (!/^\d{3,4}$/.test(cardCvv.value)) return ['Please enter the 3 or 4 digit CVV.', cardCvv];
  return null;
}

// Bank transfer
document.getElementById('copy-account').addEventListener('click', function () {
  var btn = this;
  var text = PAYMENT.bankAccount.replace(/\D/g, '');
  var done = function () {
    btn.textContent = 'Copied';
    setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
  };
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
});

slipInput.addEventListener('change', function () {
  var file = slipInput.files[0];
  if (!file) return;
  if (!/^image\//.test(file.type)) {
    clearSlip();
    errorEl.textContent = 'Please upload an image file (JPG or PNG).';
    return;
  }
  if (file.size > SLIP_MAX_BYTES) {
    clearSlip();
    errorEl.textContent = 'The slip image must be 10 MB or smaller.';
    return;
  }
  if (slipPreview.src) URL.revokeObjectURL(slipPreview.src);
  slipFile = file;
  slipPreview.src = URL.createObjectURL(file);
  slipPreview.hidden = false;
  slipText.innerHTML = '<strong>' + escapeHtml(file.name) + '</strong><small>Tap to change slip</small>';
  errorEl.textContent = '';
});
