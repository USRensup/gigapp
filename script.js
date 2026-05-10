let gigs = [];
let selectedGig = null;
let activeType = 'all';

const gigList = document.getElementById('gigList');
const detailsPanel = document.getElementById('detailsPanel');
const searchInput = document.getElementById('searchInput');
const template = document.getElementById('gigCardTemplate');
const filters = [...document.querySelectorAll('.filter')];
const postGigDialog = document.getElementById('postGigDialog');
const openPostModal = document.getElementById('openPostModal');
const cancelPost = document.getElementById('cancelPost');
const postGigForm = document.getElementById('postGigForm');
const formMessage = document.getElementById('formMessage');
const applyDialog = document.getElementById('applyDialog');
const applyForm = document.getElementById('applyForm');
const applyTitle = document.getElementById('applyTitle');
const applyMessage = document.getElementById('applyMessage');
const cancelApply = document.getElementById('cancelApply');

const LOCAL_KEY = 'gigboard_gigs_v2';

const openDialog = (d) => (typeof d.showModal === 'function' ? d.showModal() : d.setAttribute('open', 'open'));
const closeDialog = (d) => (typeof d.close === 'function' ? d.close() : d.removeAttribute('open'));

const loadLocal = () => {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'); } catch { return []; }
};
const saveLocal = (items) => localStorage.setItem(LOCAL_KEY, JSON.stringify(items));

async function fetchGigs() {
  try {
    const r = await fetch('/api/gigs');
    if (!r.ok) throw new Error('API down');
    gigs = await r.json();
    saveLocal(gigs);
  } catch {
    gigs = loadLocal();
  }
  render();
}

function render() {
  const q = searchInput.value.toLowerCase().trim();
  const items = gigs.filter((g) =>
    (activeType === 'all' || g.type === activeType) && `${g.title} ${g.company} ${g.location}`.toLowerCase().includes(q)
  );

  gigList.innerHTML = '';
  items.forEach((g) => {
    const n = template.content.cloneNode(true);
    n.querySelector('.tag').textContent = g.category || 'Miscellaneous';
    n.querySelector('.title').textContent = g.title;
    n.querySelector('.company').textContent = g.company;
    n.querySelector('.location').textContent = `◎ ${g.location}`;
    n.querySelector('.pay').textContent = g.pay || 'Not listed';
    n.querySelector('.type-pill').textContent = g.type;
    const card = n.querySelector('.gig-card');
    if (selectedGig && selectedGig.id === g.id) card.classList.add('selected');
    card.addEventListener('click', () => { selectedGig = g; render(); renderDetails(); });
    gigList.appendChild(n);
  });

  if (!selectedGig && items[0]) { selectedGig = items[0]; renderDetails(); }
  if (!items.length) detailsPanel.innerHTML = '<div class="details-empty">No gigs found for current filters</div>';
}

function renderDetails() {
  if (!selectedGig) {
    detailsPanel.innerHTML = '<div class="details-empty">Select a gig to view details</div>';
    return;
  }

  detailsPanel.innerHTML = `<div class="avatar">${selectedGig.company?.[0] || 'G'}</div>
    <h3>${selectedGig.title}</h3>
    <p style="text-align:center">${selectedGig.company}<br/>◎ ${selectedGig.location}</p>
    <button id="applyNowBtn" class="apply-now">Apply Now</button>
    <h4 class="section-title">About the Gig :</h4><p>${selectedGig.description}</p>
    <p><strong>Gig Type :</strong> ${selectedGig.type}</p>
    <p><strong>Categories :</strong> ${selectedGig.category || 'Miscellaneous'}</p>`;

  document.getElementById('applyNowBtn').addEventListener('click', openApply);
}

function openApply() {
  applyTitle.textContent = `Apply for ${selectedGig.title}`;
  applyMessage.textContent = '';
  openDialog(applyDialog);
}

openPostModal.addEventListener('click', () => openDialog(postGigDialog));
cancelPost.addEventListener('click', () => closeDialog(postGigDialog));
cancelApply.addEventListener('click', () => closeDialog(applyDialog));
searchInput.addEventListener('input', render);
filters.forEach((btn) => btn.addEventListener('click', () => {
  filters.forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  activeType = btn.dataset.type;
  render();
}));

postGigForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(postGigForm).entries());
  formMessage.textContent = 'Publishing...';

  try {
    const r = await fetch('/api/gigs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    if (!r.ok) throw new Error('publish failed');
    formMessage.textContent = 'Published successfully';
    await fetchGigs();
  } catch {
    const local = loadLocal();
    local.unshift({ id: `local-${Date.now()}`, ...payload, applications: 0 });
    saveLocal(local);
    gigs = local;
    formMessage.textContent = 'Backend unavailable. Saved locally.';
    render();
  }

  postGigForm.reset();
  setTimeout(() => { formMessage.textContent = ''; closeDialog(postGigDialog); }, 600);
});

applyForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  try {
    const r = await fetch(`/api/gigs/${selectedGig.id}/apply`, { method: 'POST' });
    if (!r.ok) throw new Error();
    applyMessage.textContent = 'Application sent successfully';
    await fetchGigs();
  } catch {
    applyMessage.textContent = 'Backend unavailable. Application saved locally.';
    const local = loadLocal();
    const gig = local.find((g) => g.id === selectedGig.id);
    if (gig) gig.applications = (gig.applications || 0) + 1;
    saveLocal(local);
  }

  setTimeout(() => { applyMessage.textContent = ''; closeDialog(applyDialog); }, 700);
});

fetchGigs();
