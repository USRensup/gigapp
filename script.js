const gigs = [
  { title: 'Frontend React Developer', company: 'Nova Labs', location: 'Remote', type: 'remote', pay: '$40/hr', description: 'Build UI components for a fast-moving startup.' },
  { title: 'Event Photographer', company: 'City Moments', location: 'Austin, TX', type: 'onsite', pay: '$250/day', description: 'Capture photos for weekend community events.' },
  { title: 'Part-time Social Media Manager', company: 'Bloom Studio', location: 'Remote', type: 'remote', pay: '$1,200/mo', description: 'Plan, schedule, and analyze social media campaigns.' },
  { title: 'Delivery Associate', company: 'QuickDrop', location: 'Seattle, WA', type: 'onsite', pay: '$22/hr', description: 'Deliver local packages using optimized routes.' }
];

const gigList = document.getElementById('gigList');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const template = document.getElementById('gigCardTemplate');

function render(items) {
  gigList.innerHTML = '';
  items.forEach((gig) => {
    const node = template.content.cloneNode(true);
    node.querySelector('.title').textContent = gig.title;
    node.querySelector('.type').textContent = gig.type;
    node.querySelector('.meta').textContent = `${gig.company} • ${gig.location}`;
    node.querySelector('.description').textContent = gig.description;
    node.querySelector('.pay').textContent = gig.pay;
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

searchInput.addEventListener('input', applyFilters);
typeFilter.addEventListener('change', applyFilters);

render(gigs);
