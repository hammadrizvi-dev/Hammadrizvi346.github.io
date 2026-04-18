// Initialize AOS (Scroll Animations)
AOS.init({ once: true });

// Typing Effect Logic
var TxtRotate = function(el, toRotate, period) {
    this.toRotate = toRotate;
    this.el = el;
    this.loopNum = 0;
    this.period = parseInt(period, 10) || 2000;
    this.txt = '';
    this.tick();
    this.isDeleting = false;
};

TxtRotate.prototype.tick = function() {
    var i = this.loopNum % this.toRotate.length;
    var fullTxt = this.toRotate[i];

    if (this.isDeleting) {
        this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
        this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    this.el.innerHTML = '<span class="wrap">'+this.txt+'</span>';

    var that = this;
    var delta = 200 - Math.random() * 100;

    if (this.isDeleting) { delta /= 2; }

    if (!this.isDeleting && this.txt === fullTxt) {
        delta = this.period;
        this.isDeleting = true;
    } else if (this.isDeleting && this.txt === '') {
        this.isDeleting = false;
        this.loopNum++;
        delta = 500;
    }

    setTimeout(function() { that.tick(); }, delta);
};

// Start Typing Effect when Window Loads
window.onload = function() {
    var elements = document.getElementsByClassName('txt-rotate');
    for (var i=0; i<elements.length; i++) {
        var toRotate = elements[i].getAttribute('data-rotate');
        var period = elements[i].getAttribute('data-period');
        if (toRotate) {
            new TxtRotate(elements[i], JSON.parse(toRotate), period);
        }
    }
};

// --- PROJECT FETCHING & FILTERING LOGIC --- //

const projectsContainer = document.getElementById('projects-container');
const filterBtns = document.querySelectorAll('.filter-btn');

if (projectsContainer) {
    let allProjects = [];

    // Fetch data from JSON
    fetch('../data/projects.json')
        .then(response => response.json())
        .then(data => {
            allProjects = data;
            displayProjects(allProjects); // Show all initially
        })
        .catch(error => {
            projectsContainer.innerHTML = '<p class="text-danger text-center w-100">Error fetching repositories. Check console.</p>';
            console.error('Error:', error);
        });

    // Generate HTML for Projects
    function displayProjects(projects) {
        projectsContainer.innerHTML = ''; 

        if(projects.length === 0) {
            projectsContainer.innerHTML = '<p class="text-center text-secondary w-100 py-5">No projects found in this category.</p>';
            return;
        }

        projects.forEach((proj, index) => {
            // Generate Badges dynamically
            let badges = proj.techStack.map(tech => `<span class="badge bg-dark border border-secondary text-info me-2 mb-2 p-2">${tech}</span>`).join('');

            // Create Premium Card HTML
            const cardHTML = `
                <div class="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}">
                    <div class="premium-card d-flex flex-column h-100 p-0 overflow-hidden" style="border: 1px solid rgba(6, 182, 212, 0.2);">
                        <div style="height: 200px; overflow: hidden; border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <img src="${proj.image}" class="w-100 h-100" style="object-fit: cover; transition: transform 0.5s ease;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" alt="${proj.title}">
                        </div>
                        
                        <div class="p-4 d-flex flex-column flex-grow-1">
                            <h4 class="fw-bold text-light mb-3">${proj.title}</h4>
                            <div class="mb-3">${badges}</div>
                            <p class="text-secondary small mb-4" style="line-height: 1.6;">${proj.description}</p>
                            
                            <div class="mt-auto pt-3 d-flex gap-2">
                                <a href="${proj.github}" target="_blank" class="btn btn-outline-light btn-sm w-50 rounded-pill"><i class="fab fa-github me-2"></i>Code</a>
                                <a href="${proj.live}" target="_blank" class="btn btn-primary btn-sm w-50 rounded-pill ${proj.live === '#' ? 'disabled' : ''}"><i class="fas fa-external-link-alt me-2"></i>Live</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            projectsContainer.insertAdjacentHTML('beforeend', cardHTML);
        });
    }

    // Filter Logic
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Manage Active Button Styles
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.classList.replace('btn-info', 'btn-outline-info');
            });
            e.target.classList.add('active');
            e.target.classList.replace('btn-outline-info', 'btn-info');

            const filterValue = e.target.getAttribute('data-filter');

            if (filterValue === 'all') {
                displayProjects(allProjects);
            } else {
                const filtered = allProjects.filter(p => p.category === filterValue);
                displayProjects(filtered);
            }
        });
    });
}