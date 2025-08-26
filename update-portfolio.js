
// update-portfolio.js
(async function(){
  // Helper: fetch JSON with fallback
  async function loadContent(){
    try {
      const res = await fetch('content.json', {cache:'no-store'});
      if(!res.ok) throw new Error('fetch failed');
      return await res.json();
    } catch (e){
      return (window.CONTENT_DEFAULT||{});
    }
  }

  function setText(sel, text){
    const el = document.querySelector(sel);
    if(el && text){ el.textContent = text; }
  }
  function setHTML(sel, html){
    const el = document.querySelector(sel);
    if(el && html!=null){ el.innerHTML = html; }
  }
  function ensureArray(x){ return Array.isArray(x) ? x : (x ? [x] : []); }

  function escapeHTML(s){
    return (s||"").replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  }

  function renderPills(arr){
    return ensureArray(arr).map(t => `<span class="pill">${escapeHTML(t)}</span>`).join('');
  }

  function renderEducation(edu){
    if(!edu || !edu.length) return;
    const grid = edu.map(e => `
      <div class="timeline-card reveal">
        <h3 class="title">${escapeHTML(e.degree)}</h3>
        <div class="inst">${escapeHTML(e.school)} • ${escapeHTML(e.years)}</div>
        <div class="meta">${ensureArray(e.badges).map(b=>`<span class="badge">${escapeHTML(b)}</span>`).join('')}</div>
      </div>`).join('');
    const html = `<div class="timeline-grid">${grid}</div>`;
    setHTML('#education .timeline-grid, #education .edu-grid, #education .content', html);
  }

  function renderExperience(exp){
    if(!exp || !exp.length) return;
    const grid = exp.map(j => `
      <div class="timeline-card reveal">
        <h3 class="title">${escapeHTML(j.role)} — ${escapeHTML(j.company)}</h3>
        <div class="inst">${escapeHTML(j.city)} • ${escapeHTML(j.dates)}</div>
        <ul class="muted" style="margin-top:10px;line-height:1.8">
          ${ensureArray(j.bullets).map(b=>`<li>${escapeHTML(b)}</li>`).join('')}
        </ul>
      </div>`).join('');
    const html = `<div class="timeline-grid">${grid}</div>`;
    setHTML('#experience .timeline-grid, #experience .content', html);
  }

  function renderCerts(certs){
    if(!certs) return;
    const list = ensureArray(certs).map(c=>`<span class="pill">${escapeHTML(c)}</span>`).join('');
    // Try to find a Certifications container; fall back to any .certifications or #certifications
    const target = document.querySelector('#certifications .content, #certifications .pills, .certifications .pills, #certifications');
    if(target){ target.innerHTML = list; }
  }

  function renderSkills(sk){
    if(!sk) return;
    const pro = renderPills(sk.professional);
    const per = renderPills(sk.personal);
    const tools = renderPills(sk.tools);
    if(document.querySelector('#skills .pro')) setHTML('#skills .pro', pro);
    if(document.querySelector('#skills .personal')) setHTML('#skills .personal', per);
    if(document.querySelector('#skills .tools')) setHTML('#skills .tools', tools);
    // If no sub-containers, try a generic pills container:
    if(!document.querySelector('#skills .pro') && document.querySelector('#skills .pills')){
      setHTML('#skills .pills', pro + tools);
    }
  }

  function applyProfile(p){
    if(!p) return;
    // Header / contact strip
    const contact = [p.location, p.phone, p.email, (p.linkedin||'').replace(/^https?:\/\//,'')].filter(Boolean).join(' • ');
    setText('#contact-strip, .contact-strip', contact);
    // About
    setText('#about .about-text, #about .content, #about p', p.about);
    // LinkedIn
    const link = document.querySelector('a[href*="linkedin.com"]');
    if(link && p.linkedin){ link.href = p.linkedin; }
    // Name / title if present in hero
    setText('#hero .name, .hero .name, .brand .name', p.name);
    setText('#hero .title, .hero .title, .brand .title', p.title);
  }

  function setDefaultTheme(themeId){
    try{
      const key = 'talal-theme-v1';
      const saved = localStorage.getItem(key);
      if(!saved && themeId){
        localStorage.setItem(key, themeId);
        // If a theme engine exists, call it; otherwise set data-theme directly
        if(window.applyTheme) window.applyTheme(themeId, true);
        else {
          document.documentElement.removeAttribute('data-theme');
          if(themeId !== 'ocean'){ document.documentElement.setAttribute('data-theme', themeId); }
        }
      }
    }catch(e){}
  }

  const data = await loadContent();
  applyProfile(data.profile);
  renderExperience(data.experience);
  renderEducation(data.education);
  renderCerts(data.certifications);
  renderSkills(data.skills);
  setDefaultTheme(data.theme && data.theme.default);
})();
