/* ==========================================================================
   FITPULSE — script.js
   ========================================================================== */

/* ==========================================================================
   ระบบสมาชิก (Auth) — เก็บข้อมูลใน localStorage ของเบราว์เซอร์
   หมายเหตุ: นี่คือระบบจำลองสำหรับโปรเจกต์/สาธิตเท่านั้น รหัสผ่านเก็บแบบไม่เข้ารหัส
   จึงไม่ควรใช้กับข้อมูลจริงหรือรหัสผ่านที่ใช้ซ้ำกับระบบอื่น
   ========================================================================== */
function getUsers() {
  return JSON.parse(localStorage.getItem('fitpulse_users') || '[]');
}
function saveUsers(users) {
  localStorage.setItem('fitpulse_users', JSON.stringify(users));
}
function getCurrentUser() {
  const email = localStorage.getItem('fitpulse_current_user');
  if (!email) return null;
  return getUsers().find(u => u.email === email) || null;
}
function logoutUser() {
  localStorage.removeItem('fitpulse_current_user');
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 0. เมนู: อัปเดตตามสถานะล็อกอิน ---------- */
  (function renderAuthNav() {
    const user = getCurrentUser();
    const navCta = document.getElementById('navCta');
    const navAuthLink = document.getElementById('navAuthLink');
    if (navCta) {
      if (user) { navCta.textContent = 'สมาชิกของฉัน'; navCta.href = 'member.html'; }
      else { navCta.textContent = 'สมัครสมาชิก'; navCta.href = 'login.html#register'; }
    }
    if (navAuthLink) {
      if (user) {
        navAuthLink.textContent = 'ออกจากระบบ';
        navAuthLink.href = '#';
        navAuthLink.addEventListener('click', (e) => { e.preventDefault(); logoutUser(); });
      } else {
        navAuthLink.textContent = 'เข้าสู่ระบบ';
        navAuthLink.href = 'login.html';
      }
    }
  })();

  /* ---------- 1. เมนูมือถือ ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const siteHeader = document.querySelector('.site-header');
  if (navToggle && siteHeader) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      siteHeader.classList.toggle('menu-open');
    });
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        siteHeader.classList.remove('menu-open');
      });
    });
  }

  /* ---------- 2. ไฮไลต์เมนูหน้าปัจจุบัน ---------- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) link.classList.add('active');
  });

  /* ---------- 3. Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  }

  /* ---------- 4. เคล็ดลับประจำวัน (หน้าแรก) ---------- */
  const tips = [
    'วอร์มอัพอย่างน้อย 5-10 นาทีก่อนออกกำลังกาย ช่วยลดความเสี่ยงบาดเจ็บได้มาก',
    'นอนหลับให้ได้ 7-8 ชั่วโมง คือส่วนหนึ่งของ "การฝึก" ไม่ใช่แค่การพักผ่อน',
    'ดื่มน้ำก่อนออกกำลังกาย 30 นาที ประมาณ 300-500 มล. ช่วยให้ร่างกายพร้อมกว่าเดิม',
    'สลับความหนักเบาในแต่ละสัปดาห์ (Zone 2 สลับ Zone 4) ดีกว่าหักโหมโซนเดียวทุกวัน',
    'ยืดเหยียดกล้ามเนื้อหลังออกกำลังกายช่วยลดอาการปวดเมื่อยในวันถัดไป',
    'กินโปรตีนภายใน 1-2 ชั่วโมงหลังออกกำลังกาย ช่วยให้กล้ามเนื้อฟื้นตัวได้ดีขึ้น',
    'พักกล้ามเนื้อมัดเดิมอย่างน้อย 48 ชั่วโมงก่อนฝึกหนักซ้ำ เพื่อให้กล้ามเนื้อซ่อมแซมตัวเอง'
  ];
  const tipText = document.getElementById('tipText');
  const tipRefresh = document.getElementById('tipRefresh');
  function showRandomTip() {
    if (!tipText) return;
    const i = Math.floor(Math.random() * tips.length);
    tipText.textContent = tips[i];
  }
  if (tipText) {
    showRandomTip();
    tipRefresh?.addEventListener('click', () => {
      tipRefresh.classList.add('spin');
      showRandomTip();
      setTimeout(() => tipRefresh.classList.remove('spin'), 300);
    });
  }

  /* ---------- 5. หน้าโปรแกรม: filter + expand ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const programCards = document.querySelectorAll('.program-card');
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const category = btn.dataset.filter;
        programCards.forEach(card => {
          const match = category === 'all' || card.dataset.category === category;
          card.classList.toggle('hidden-card', !match);
        });
      });
    });
    // ถ้ามาจากลิงก์ที่ระบุโซน เช่น programs.html?filter=hiit ให้กรองอัตโนมัติ
    const filterParam = new URLSearchParams(window.location.search).get('filter');
    if (filterParam) {
      document.querySelector(`.filter-btn[data-filter="${filterParam}"]`)?.click();
    }
  }
  programCards.forEach(card => {
    const head = card.querySelector('.program-top');
    head?.addEventListener('click', () => card.classList.toggle('open'));
  });

  /* ---------- 5a. คลิปสาธิตในการ์ดโปรแกรม: โหลด iframe ก็ต่อเมื่อกดเล่นเท่านั้น ---------- */
  document.querySelectorAll('.video-facade').forEach(facade => {
    facade.addEventListener('click', (e) => {
      e.stopPropagation();
      const wrap = facade.closest('.video-embed');
      const videoId = wrap?.dataset.videoId;
      if (!wrap || !videoId) return;
      wrap.innerHTML = `<iframe
        src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0"
        title="วิดีโอสาธิตโปรแกรม"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        loading="lazy"></iframe>`;
    });
  });

  /* ---------- 5b. หน้าแรก: การ์ดโซนหัวใจ กดเพื่อดูรายละเอียด ---------- */
  document.querySelectorAll('.zone-card').forEach(card => {
    function toggleZoneCard() {
      const isOpen = card.classList.toggle('open');
      card.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return; // อย่าสลับสถานะถ้ากดลิงก์ด้านในการ์ด
      toggleZoneCard();
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleZoneCard();
      }
    });
  });

  /* ---------- 6. FAQ accordion (หน้าติดต่อ) ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    q?.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ---------- 7. Calculator tabs (หน้าคำนวณสุขภาพ) ---------- */
  const calcTabs = document.querySelectorAll('.calc-tab');
  calcTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      calcTabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.calc-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.panel)?.classList.add('active');
    });
  });

  /* ---------- 7b. สลับแท็บด้วยลิงก์ในฟอร์ม (เช่น "ยังไม่มีบัญชี?") ---------- */
  document.querySelectorAll('[data-switch]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector(`.calc-tab[data-panel="${link.dataset.switch}"]`)?.click();
    });
  });
  // เปิดแท็บสมัครสมาชิกอัตโนมัติถ้ามาจากลิงก์ login.html#register
  if (window.location.hash === '#register') {
    document.querySelector('.calc-tab[data-panel="registerPanel"]')?.click();
  }

  /* ---------- 7c. ฟอร์มสมัครสมาชิก ---------- */
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim().toLowerCase();
      const password = document.getElementById('regPassword').value;
      const errorEl = document.getElementById('registerError');
      errorEl.style.display = 'none';

      if (name.length < 2) return showAuthError(errorEl, 'กรุณากรอกชื่อ-นามสกุล');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showAuthError(errorEl, 'กรุณากรอกอีเมลให้ถูกต้อง');
      if (password.length < 6) return showAuthError(errorEl, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');

      const users = getUsers();
      if (users.some(u => u.email === email)) return showAuthError(errorEl, 'อีเมลนี้สมัครสมาชิกไว้แล้ว ลองเข้าสู่ระบบแทน');

      users.push({ name, email, password, joined: new Date().toLocaleDateString('th-TH') });
      saveUsers(users);
      localStorage.setItem('fitpulse_current_user', email);
      window.location.href = 'member.html';
    });
  }

  /* ---------- 7d. ฟอร์มเข้าสู่ระบบ ---------- */
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim().toLowerCase();
      const password = document.getElementById('loginPassword').value;
      const errorEl = document.getElementById('loginError');
      errorEl.style.display = 'none';

      const users = getUsers();
      const match = users.find(u => u.email === email && u.password === password);
      if (!match) return showAuthError(errorEl, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');

      localStorage.setItem('fitpulse_current_user', email);
      window.location.href = 'member.html';
    });
  }

  function showAuthError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
  }

  /* ---------- 7e. หน้าสมาชิก (member.html) ---------- */
  const memberGreeting = document.getElementById('memberGreeting');
  if (memberGreeting) {
    const user = getCurrentUser();
    if (user) {
      memberGreeting.textContent = `สวัสดี, ${user.name}`;
      const joinedEl = document.getElementById('memberJoined');
      const emailEl = document.getElementById('memberEmail');
      if (joinedEl) joinedEl.textContent = `สมาชิกตั้งแต่ ${user.joined}`;
      if (emailEl) emailEl.textContent = user.email;
    }

    const bmiData = JSON.parse(localStorage.getItem('fitpulse_bmi') || 'null');
    const bmiWrap = document.getElementById('memberBmi');
    if (bmiWrap) {
      bmiWrap.innerHTML = bmiData
        ? `<div class="result-label">BMI ล่าสุด</div>
           <div class="result-num" style="font-size:40px;color:${bmiData.color}">${bmiData.bmi}</div>
           <span class="result-cat" style="background:${bmiData.color}22;color:${bmiData.color}">${bmiData.category}</span>
           <p class="result-note">คำนวณเมื่อ ${bmiData.date}</p>`
        : `<p class="result-empty">ยังไม่มีข้อมูล — <a href="calculator.html" style="color:var(--zone3)">คำนวณ BMI</a></p>`;
    }

    const hrData = JSON.parse(localStorage.getItem('fitpulse_hr') || 'null');
    const hrWrap = document.getElementById('memberHr');
    if (hrWrap) {
      hrWrap.innerHTML = hrData
        ? `<div class="result-label">อัตราการเต้นหัวใจสูงสุด</div>
           <div class="result-num" style="font-size:40px;">${hrData.maxHr} <span style="font-size:14px;color:var(--text-faint)">bpm</span></div>
           <p class="result-note">คำนวณจากอายุ ${hrData.age} ปี</p>`
        : `<p class="result-empty">ยังไม่มีข้อมูล — <a href="calculator.html" style="color:var(--zone3)">คำนวณโซนหัวใจ</a></p>`;
    }
  }

  document.getElementById('logoutBtn')?.addEventListener('click', logoutUser);

  /* ---------- 8. BMI Calculator ---------- */
  const bmiForm = document.getElementById('bmiForm');
  if (bmiForm) {
    // แสดงผลล่าสุดที่บันทึกไว้ (localStorage)
    const savedBmi = JSON.parse(localStorage.getItem('fitpulse_bmi') || 'null');
    if (savedBmi) renderBmiResult(savedBmi.bmi, savedBmi.category, savedBmi.color, true);

    bmiForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const h = parseFloat(document.getElementById('bmiHeight').value);
      const w = parseFloat(document.getElementById('bmiWeight').value);
      if (!h || !w || h <= 0 || w <= 0) return;
      const heightM = h / 100;
      const bmi = w / (heightM * heightM);
      let category, color;
      if (bmi < 18.5) { category = 'น้ำหนักต่ำกว่าเกณฑ์'; color = 'var(--zone1)'; }
      else if (bmi < 23) { category = 'สมส่วน'; color = 'var(--zone2)'; }
      else if (bmi < 25) { category = 'ท้วม / เริ่มอ้วน'; color = 'var(--zone3)'; }
      else if (bmi < 30) { category = 'อ้วนระดับ 1'; color = 'var(--zone4)'; }
      else { category = 'อ้วนระดับ 2'; color = 'var(--zone5)'; }

      renderBmiResult(bmi, category, color, false);
      localStorage.setItem('fitpulse_bmi', JSON.stringify({ bmi: bmi.toFixed(1), category, color, date: new Date().toLocaleDateString('th-TH') }));
    });
  }
  function renderBmiResult(bmi, category, color, isSaved) {
    const wrap = document.getElementById('bmiResult');
    if (!wrap) return;
    const bmiVal = typeof bmi === 'string' ? bmi : bmi.toFixed(1);
    wrap.innerHTML = `
      <div class="result-label">ค่า BMI ของคุณ</div>
      <div class="result-num" style="color:${color}">${bmiVal}</div>
      <span class="result-cat" style="background:${color}22; color:${color}">${category}</span>
      <p class="result-note">BMI เป็นตัวชี้วัดเบื้องต้น ไม่ได้แยกมวลกล้ามเนื้อกับไขมัน ควรใช้ร่วมกับการวัดรอบเอวหรือปรึกษาผู้เชี่ยวชาญ</p>
      ${isSaved ? `<div class="last-saved">↺ ผลคำนวณล่าสุดที่บันทึกไว้ในเครื่องนี้</div>` : ''}
    `;
  }

  /* ---------- 9. Heart Rate Zone Calculator ---------- */
  const hrForm = document.getElementById('hrForm');
  if (hrForm) {
    hrForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const age = parseInt(document.getElementById('hrAge').value, 10);
      if (!age || age <= 0 || age > 100) return;
      const maxHr = 220 - age;
      const zones = [
        { name: 'Zone 1 · วอร์มอัพ', pct: [0.5, 0.6], color: 'var(--zone1)' },
        { name: 'Zone 2 · เผาผลาญไขมัน', pct: [0.6, 0.7], color: 'var(--zone2)' },
        { name: 'Zone 3 · คาร์ดิโอ', pct: [0.7, 0.8], color: 'var(--zone3)' },
        { name: 'Zone 4 · หนักหน่วง', pct: [0.8, 0.9], color: 'var(--zone4)' },
        { name: 'Zone 5 · จุดสูงสุด', pct: [0.9, 1.0], color: 'var(--zone5)' },
      ];
      const wrap = document.getElementById('hrResult');
      wrap.innerHTML = `
        <div class="result-label">อัตราการเต้นหัวใจสูงสุดโดยประมาณ</div>
        <div class="result-num" style="font-size:40px;">${maxHr} <span style="font-size:16px;color:var(--text-faint)">bpm</span></div>
        <div class="zones" style="text-align:left; margin-top:20px;">
          ${zones.map(z => `
            <div class="zone-row">
              <div class="zone-name" style="color:${z.color}">${z.name}</div>
              <div class="zone-track"><div class="zone-fill" style="background:${z.color}; width:${z.pct[1]*100}%"></div></div>
              <div class="zone-pct">${Math.round(maxHr*z.pct[0])}–${Math.round(maxHr*z.pct[1])} bpm</div>
            </div>
          `).join('')}
        </div>
      `;
      localStorage.setItem('fitpulse_hr', JSON.stringify({ age, maxHr }));
    });
  }

  /* ---------- 10. เครื่องคำนวณน้ำดื่ม (หน้าโภชนาการ) ---------- */
  const waterForm = document.getElementById('waterForm');
  if (waterForm) {
    waterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const w = parseFloat(document.getElementById('waterWeight').value);
      if (!w || w <= 0) return;
      const liters = (w * 0.033).toFixed(1);
      const pct = Math.min((liters / 4) * 100, 100);
      document.getElementById('waterResultNum').textContent = liters + ' ลิตร/วัน';
      const fill = document.getElementById('waterFill');
      if (fill) fill.style.height = pct + '%';
      document.getElementById('waterResultNote').textContent =
        `≈ ${Math.round((liters*1000)/250)} แก้ว (แก้วละ 250 มล.) กระจายดื่มตลอดวัน และเพิ่มขึ้นในวันที่ออกกำลังกายหนัก`;
    });
  }

  /* ---------- 11. ฟอร์มติดต่อ: validate + จำลองส่ง ---------- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      const nameField = document.getElementById('cName');
      const emailField = document.getElementById('cEmail');
      const phoneField = document.getElementById('cPhone');
      const msgField = document.getElementById('cMessage');

      valid = validateField(nameField, v => v.trim().length >= 2, 'กรุณากรอกชื่อ-นามสกุล') && valid;
      valid = validateField(emailField, v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'กรุณากรอกอีเมลให้ถูกต้อง') && valid;
      valid = validateField(phoneField, v => /^0[0-9]{8,9}$/.test(v.replace(/-/g,'')), 'กรุณากรอกเบอร์โทรให้ถูกต้อง (เช่น 0812345678)') && valid;
      valid = validateField(msgField, v => v.trim().length >= 5, 'กรุณาบอกเป้าหมายของคุณสักเล็กน้อย') && valid;

      if (!valid) return;

      const successBox = document.getElementById('formSuccess');
      successBox.classList.add('show');
      contactForm.reset();
      document.querySelectorAll('.field').forEach(f => f.classList.remove('error'));
      setTimeout(() => successBox.classList.remove('show'), 6000);
    });

    function validateField(field, testFn, message) {
      if (!field) return true;
      const wrap = field.closest('.field');
      const msgEl = wrap.querySelector('.field-error-msg');
      const ok = testFn(field.value || '');
      wrap.classList.toggle('error', !ok);
      if (msgEl) msgEl.textContent = message;
      return ok;
    }
  }

});
