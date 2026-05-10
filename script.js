let gigs = [];

const gigList = document.getElementById('gigList');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const template = document.getElementById('gigCardTemplate');
const openPostModal = document.getElementById('openPostModal');
const postGigDialog = document.getElementById('postGigDialog');
const postGigForm = document.getElementById('postGigForm');
const cancelPost = document.getElementById('cancelPost');
const formMessage = document.getElementById('formMessage');

async function fetchGigs() {
  const response = await fetch('/api/gigs');
  gigs = await response.json();
  applyFilters();
}

function render(items) {
  gigList.innerHTML = '';
  items.forEach((gig) => {
    const node = template.content.cloneNode(true);
    node.querySelector('.title').textContent = gig.title;
    node.querySelector('.type').textContent = gig.type;
    node.querySelector('.meta').textContent = `${gig.company} • ${gig.location}`;
    node.querySelector('.description').textContent = gig.description;
    node.querySelector('.pay').textContent = gig.pay;
    node.querySelector('.applications').textContent = `Applications: ${gig.applications || 0}`;

    const applyBtn = node.querySelector('.apply-btn');
    applyBtn.addEventListener('click', async () => {
      const res = await fetch(`/api/gigs/${gig.id}/apply`, { method: 'POST' });
      if (res.ok) {
        await fetchGigs();
      }
    });

    gigList.appendChild(node);
  });
}

function applyFilters() {
  const q = searchInput.value.toLowerCase().trim();
  const type = typeFilter.value;
  const filtered = gigs.filter((gig) => {
    const matchesType = type === 'all' || gig.type === type;
    const searchable = `${gig.title} ${gig.company} ${gig.location} ${gig.description}`.toLowerCase();
    const matchesQuery = !q || searchable.includes(q);
    return matchesType && matchesQuery;
  });
  render(filtered);
}

openPostModal.addEventListener('click', () => {
  if (typeof postGigDialog.showModal === 'function') {
    postGigDialog.showModal();
  } else {
    postGigDialog.setAttribute('open', 'open');
  }
});
cancelPost.addEventListener('click', () => {
  formMessage.textContent = '';
  if (typeof postGigDialog.close === 'function') {
    postGigDialog.close();
  } else {
    postGigDialog.removeAttribute('open');
  }
});

postGigForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(postGigForm);
  const payload = Object.fromEntries(form.entries());

  formMessage.textContent = 'Publishing...';
  const response = await fetch('/api/gigs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (response.ok) {
    formMessage.textContent = 'Gig published successfully.';
    postGigForm.reset();
    await fetchGigs();
    setTimeout(() => {
      formMessage.textContent = '';
      if (typeof postGigDialog.close === 'function') {
        postGigDialog.close();
      } else {
        postGigDialog.removeAttribute('open');
      }
    }, 400);
  } else {
    const err = await response.json().catch(() => ({ error: 'Could not publish gig' }));
    formMessage.textContent = err.error || 'Could not publish gig';
  }
});

searchInput.addEventListener('input', applyFilters);
typeFilter.addEventListener('change', applyFilters);

fetchGigs();
