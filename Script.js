// Config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBOGA8xamms9Vm0RR2IipLXq5FrNsDY16w",
  authDomain: "undangan-pernikahan-andielin.firebaseapp.com",
  databaseURL: "https://undangan-pernikahan-andielin-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "undangan-pernikahan-andielin"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Nama tamu dari URL - FIX: tambah pengecekan null
const urlParams = new URLSearchParams(window.location.search);
const guest = urlParams.get('to');
const guestEl = document.getElementById('guestName');
if(guest && guestEl){
  guestEl.innerText = decodeURI(guest);
}

// ====== Animasi Reveal ======
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('active');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.15,
  rootMargin: '0px 0px -10% 0px'
});

document.querySelectorAll('.reveal').forEach(el => {
  revealObserver.observe(el);
});

// Animasi cover pas load
function animateCover(){
  document.querySelectorAll('#cover .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('active'), i * 150);
  });
}

if(document.readyState === 'complete' || document.readyState === 'interactive'){
  animateCover();
} else {
  document.addEventListener('DOMContentLoaded', animateCover);
}

// ====== Musik ======
const bgm = document.getElementById('bgm');
const musicBtn = document.getElementById('musicBtn');
let isPlaying = false;

function openInvitation(){
  document.getElementById('cover').style.display = 'none';
  document.getElementById('content').style.display = 'block';
  document.body.classList.remove('lock-scroll');
  
  if(bgm){
    bgm.play()
      .then(() => {
        isPlaying = true;
        if(musicBtn){
          musicBtn.classList.add('pause');
          musicBtn.innerHTML = '🎵';
        }
      })
      .catch(() => {
        console.log('Autoplay diblock browser');
      });
  }
  
  document.querySelectorAll('#content .reveal').forEach(el => {
    revealObserver.observe(el);
  });
}

if(musicBtn){
  musicBtn.addEventListener('click', function(){
    if(isPlaying){
      bgm.pause();
      musicBtn.classList.remove('pause');
      musicBtn.innerHTML = '🔇';
      isPlaying = false;
    } else {
      bgm.play();
      musicBtn.classList.add('pause');
      musicBtn.innerHTML = '🎵';
      isPlaying = true;
    }
  });
}

// Countdown
const countDate = new Date("July 26, 2026 08:00:00").getTime();
const countdownSection = document.querySelector('.countdown');

const formatTime = (num) => String(num).padStart(2, '0');

const updateElement = (id, value) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.innerText !== value) {
    el.classList.add('update');
    setTimeout(() => el.classList.remove('update'), 300);
    el.innerText = value;
  }
};

const countdownTimer = setInterval(() => {
  const now = new Date().getTime();
  const gap = countDate - now;

  if (gap < 0) {
    clearInterval(countdownTimer);
    if(countdownSection){
      countdownSection.innerHTML = `
        <h2>Selamat Datang di Hari Pernikahan</h2>
        <p style="font-size:18px; color:var(--brown); margin-top:15px;">
          Terima kasih telah hadir dan menjadi bagian dari hari bahagia kami 💛
        </p>
      `;
    }
    return;
  }

  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  updateElement("days", formatTime(Math.floor(gap / day)));
  updateElement("hours", formatTime(Math.floor((gap % day) / hour)));
  updateElement("minutes", formatTime(Math.floor((gap % hour) / minute)));
  updateElement("seconds", formatTime(Math.floor((gap % minute) / second)));
}, 1000);

// Copy rekening
function copyText(text){
  navigator.clipboard.writeText(text);
  alert('No. rekening tersalin!');
}

// Format waktu
function timeAgo(timestamp){
  const now = Date.now();
  const diff = now - timestamp;
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;
  
  if(diff < minute) return 'Baru saja';
  if(diff < hour) return Math.floor(diff / minute) + ' menit yang lalu';
  if(diff < hour * 24) return Math.floor(diff / hour) + ' jam yang lalu';
  return Math.floor(diff / day) + ' hari yang lalu';
}

// Submit ucapan
const rsvpForm = document.getElementById('rsvpForm');
if(rsvpForm){
  rsvpForm.addEventListener('submit', function(e){
    e.preventDefault();
    const data = {
      nama: document.getElementById('nama').value,
      hadir: document.getElementById('hadir').value,
      ucapan: document.getElementById('ucapan').value,
      likes: 0,
      waktu: Date.now()
    };
    db.ref('ucapan').push(data);
    this.reset();
    alert('Ucapan terkirim!');
  });
}

// Like - anti double click
function likeUcapan(id, currentLikes){
  const likedList = JSON.parse(localStorage.getItem('likedUcapan') || '[]');
  if(likedList.includes(id)) return;
  
  likedList.push(id);
  localStorage.setItem('likedUcapan', JSON.stringify(likedList));
  
  db.ref('ucapan/' + id + '/likes').set(currentLikes + 1);
  const likeEl = document.getElementById(`like-${id}`);
  const btnEl = document.getElementById(`like-btn-${id}`);
  if(likeEl) likeEl.innerText = currentLikes + 1;
  if(btnEl){
    btnEl.classList.add('liked');
    btnEl.disabled = true;
  }
}

// Toggle reply
function toggleReply(id){
  const box = document.getElementById(`reply-box-${id}`);
  if(box){
    box.style.display = box.style.display === 'block' ? 'none' : 'block';
  }
}

// Kirim reply
function kirimReply(id){
  const nama = document.getElementById(`reply-nama-${id}`).value;
  const text = document.getElementById(`reply-text-${id}`).value;
  if(!nama || !text) return alert('Nama dan reply harus diisi');
  
  db.ref('ucapan/' + id + '/replies').push({
    nama: nama,
    text: text,
    waktu: Date.now()
  });
  
  document.getElementById(`reply-nama-${id}`).value = '';
  document.getElementById(`reply-text-${id}`).value = '';
  toggleReply(id);
}

// Tampilkan ucapan real time
const ucapanList = document.getElementById('ucapanList');
if(ucapanList){
  db.ref('ucapan').limitToLast(50).on('value', function(snapshot){
    ucapanList.innerHTML = '';
    if(!snapshot.exists()){
      ucapanList.innerHTML = '<p>Belum ada ucapan. Jadi yang pertama!</p>';
      return;
    }
    
    const likedList = JSON.parse(localStorage.getItem('likedUcapan') || '[]');
    const data = snapshot.val();
    
    Object.entries(data).reverse().forEach(([id, item]) => {
      const sudahLike = likedList.includes(id);
      const waktu = timeAgo(item.waktu);
      
      const div = document.createElement('div');
      div.className = 'ucapan-item';
      div.innerHTML = `
        <div class="ucapan-header">
          <div>
            <strong>${item.nama}</strong> 
            <small>[${item.hadir}]</small>
          </div>
          <small style="color:#888">${waktu}</small>
        </div>
        <p>${item.ucapan}</p>
        <div class="ucapan-actions">
          <button 
            class="like-btn ${sudahLike ? 'liked' : ''}" 
            id="like-btn-${id}"
            onclick="likeUcapan('${id}', ${item.likes || 0})"
            ${sudahLike ? 'disabled' : ''}
          >
            ❤️ <span id="like-${id}">${item.likes || 0}</span>
          </button>
          <button class="reply-btn" onclick="toggleReply('${id}')">
            💬 Reply <span id="reply-count-${id}">(${item.replies ? Object.keys(item.replies).length : 0})</span>
          </button>
        </div>
        <div class="reply-box" id="reply-box-${id}">
          <input type="text" id="reply-nama-${id}" placeholder="Nama kamu">
          <input type="text" id="reply-text-${id}" placeholder="Tulis balasan...">
          <button onclick="kirimReply('${id}')">Kirim Reply</button>
          <div id="replies-${id}"></div>
        </div>
      `;
      ucapanList.appendChild(div);
      
      if(item.replies){
        const replyContainer = document.getElementById(`replies-${id}`);
        Object.values(item.replies).forEach(reply => {
          const replyWaktu = timeAgo(reply.waktu);
          replyContainer.innerHTML += `
            <div class="reply-item">
              <strong>${reply.nama}:</strong> ${reply.text}
              <small style="color:#888; display:block;">${replyWaktu}</small>
            </div>
          `;
        });
      }
    });
  });
}