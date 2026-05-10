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

async function fetchGigs(){const r=await fetch('/api/gigs');gigs=await r.json();render();}

function render(){
  const q=searchInput.value.toLowerCase().trim();
  const items=gigs.filter(g=> (activeType==='all'||g.type===activeType) && (`${g.title} ${g.company} ${g.location}`.toLowerCase().includes(q)));
  gigList.innerHTML='';
  items.forEach(g=>{
    const n=template.content.cloneNode(true);
    n.querySelector('.tag').textContent=(g.category||'Miscellaneous');
    n.querySelector('.title').textContent=g.title;
    n.querySelector('.company').textContent=g.company;
    n.querySelector('.location').textContent=`◎ ${g.location}`;
    n.querySelector('.pay').textContent=g.pay||'Not listed';
    n.querySelector('.type-pill').textContent=g.type;
    const card=n.querySelector('.gig-card');
    if(selectedGig && selectedGig.id===g.id) card.classList.add('selected');
    card.addEventListener('click',()=>{selectedGig=g;render();renderDetails();});
    gigList.appendChild(n);
  });
  if(!selectedGig && items[0]){selectedGig=items[0];renderDetails();}
}

function renderDetails(){
  if(!selectedGig){detailsPanel.innerHTML='<div class="details-empty">Select a gig to view details</div>';return;}
  detailsPanel.innerHTML=`<div class="avatar">${selectedGig.company?.[0]||'G'}</div>
  <h3>${selectedGig.title}</h3>
  <p style="text-align:center">${selectedGig.company}<br/>◎ ${selectedGig.location}</p>
  <button id="applyNowBtn" class="apply-now">Apply Now</button>
  <h4 class="section-title">About the Gig :</h4><p>${selectedGig.description}</p>
  <p><strong>Gig Type :</strong> ${selectedGig.type}</p>
  <p><strong>Categories :</strong> ${selectedGig.category||'Miscellaneous'}</p>`;
  document.getElementById('applyNowBtn').addEventListener('click',openApply);
}

function openApply(){applyTitle.textContent=`Apply for ${selectedGig.title}`;applyDialog.showModal();}

openPostModal.addEventListener('click',()=>postGigDialog.showModal());
cancelPost.addEventListener('click',()=>postGigDialog.close());
cancelApply.addEventListener('click',()=>applyDialog.close());
searchInput.addEventListener('input',render);
filters.forEach(btn=>btn.addEventListener('click',()=>{filters.forEach(b=>b.classList.remove('active'));btn.classList.add('active');activeType=btn.dataset.type;render();}));

postGigForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const payload=Object.fromEntries(new FormData(postGigForm).entries());
  formMessage.textContent='Publishing...';
  const r=await fetch('/api/gigs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  if(r.ok){formMessage.textContent='Published';postGigForm.reset();await fetchGigs();setTimeout(()=>postGigDialog.close(),300);} else formMessage.textContent='Failed to publish';
});

applyForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const r=await fetch(`/api/gigs/${selectedGig.id}/apply`,{method:'POST'});
  applyMessage.textContent=r.ok?'Application sent successfully':'Could not submit application';
  if(r.ok){await fetchGigs();setTimeout(()=>applyDialog.close(),500);} 
});

fetchGigs();
