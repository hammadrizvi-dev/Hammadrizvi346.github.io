document.addEventListener('DOMContentLoaded', () => {
    if (window.AOS) {
        AOS.init({
            once: true,
            duration: 800,
            easing: 'ease-out-cubic'
        });
    }

    initTypingEffect();
    initProjects();
});

function initTypingEffect() {
    const elements = document.querySelectorAll('.txt-rotate');

    elements.forEach((element) => {
        const phrases = element.getAttribute('data-rotate');
        const period = parseInt(element.getAttribute('data-period'), 10) || 2000;

        if (!phrases) {
            return;
        }

        try {
            new TxtRotate(element, JSON.parse(phrases), period);
        } catch (error) {
            console.error('Typing effect data is invalid:', error);
        }
    });
}

function TxtRotate(element, toRotate, period) {
    this.toRotate = toRotate;
    this.element = element;
    this.loopNum = 0;
    this.period = period;
    this.text = '';
    this.isDeleting = false;
    this.tick();
}

TxtRotate.prototype.tick = function () {
    if (!this.toRotate.length) {
        return;
    }

    const currentIndex = this.loopNum % this.toRotate.length;
    const fullText = this.toRotate[currentIndex];

    this.text = this.isDeleting
        ? fullText.substring(0, this.text.length - 1)
        : fullText.substring(0, this.text.length + 1);

    this.element.innerHTML = `<span class="wrap">${this.text}</span>`;

    let delay = 140 - Math.random() * 60;

    if (this.isDeleting) {
        delay /= 2;
    }

    if (!this.isDeleting && this.text === fullText) {
        delay = this.period;
        this.isDeleting = true;
    } else if (this.isDeleting && this.text === '') {
        this.isDeleting = false;
        this.loopNum += 1;
        delay = 450;
    }

    setTimeout(() => this.tick(), delay);
};

async function initProjects() {
    const projectsContainer = document.getElementById('projects-container');
    const filterButtons = document.querySelectorAll('.filter-btn');

    if (!projectsContainer) {
        return;
    }

    let allProjects = [];

    try {
        const response = await fetch('../data/projects.json');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        allProjects = await response.json();
        renderProjects(allProjects, projectsContainer);
    } catch (error) {
        projectsContainer.innerHTML = `
            <div class="col-12">
                <div class="premium-card text-center">
                    <h3 class="h5 mb-2">Projects unavailable right now</h3>
                    <p class="text-secondary mb-0">The project list could not be loaded. Please try again later.</p>
                </div>
            </div>
        `;
        console.error('Failed to load projects:', error);
        return;
    }

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            filterButtons.forEach((item) => item.classList.remove('active'));
            button.classList.add('active');

            const filter = button.dataset.filter;
            const filteredProjects = filter === 'all'
                ? allProjects
                : allProjects.filter((project) => project.category === filter);

            renderProjects(filteredProjects, projectsContainer);
        });
    });
}

function renderProjects(projects, container) {
    if (!projects.length) {
        container.innerHTML = `
            <div class="col-12">
                <div class="premium-card text-center">
                    <h3 class="h5 mb-2">No projects found</h3>
                    <p class="text-secondary mb-0">Try another category to explore more work.</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = projects.map((project, index) => {
        const badges = project.techStack
            .map((tech) => `<span class="badge-tech">${tech}</span>`)
            .join('');

        const liveButtonClass = project.live === '#' ? 'disabled' : '';
        const liveButtonState = project.live === '#'
            ? 'aria-disabled="true" tabindex="-1"'
            : '';

        return `
            <div class="col-md-6 col-xl-4" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}">
                <article class="premium-card project-card p-0">
                    <div class="project-card-media">
                        <img src="${project.image}" alt="${project.title}" loading="lazy">
                    </div>
                    <div class="project-card-body">
                        <div class="project-card-top">
                            <p class="project-tag">${formatCategory(project.category)}</p>
                            <h3 class="h4 mb-3">${project.title}</h3>
                            <p class="text-secondary mb-4">${project.description}</p>
                        </div>
                        <div class="d-flex flex-wrap gap-2 mb-4">
                            ${badges}
                        </div>
                        <div class="d-flex gap-2 mt-auto">
                            <a href="${project.github}" target="_blank" rel="noreferrer" class="btn btn-outline-light w-50">
                                <i class="fab fa-github me-2"></i>Code
                            </a>
                            <a href="${project.live}" target="_blank" rel="noreferrer" class="btn btn-primary w-50 ${liveButtonClass}" ${liveButtonState}>
                                <i class="fas fa-arrow-up-right-from-square me-2"></i>Live
                            </a>
                        </div>
                    </div>
                </article>
            </div>
        `;
    }).join('');
}

function formatCategory(category) {
    switch (category) {
        case 'web':
            return 'Web Project';
        case 'data':
            return 'Data Project';
        case 'java':
            return 'Java / DSA';
        default:
            return 'Project';
    }
}
