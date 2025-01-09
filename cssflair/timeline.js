class Timeline {
    constructor() {
        this.locations = [];
        this.init();
        this.clearLocalStorage(); // Clear storage on page load
    }

    init() {
        document.getElementById('addLocation').addEventListener('click', () => this.showModal());
        document.getElementById('closeModal').addEventListener('click', () => this.hideModal());
        document.getElementById('saveLocation').addEventListener('click', () => this.addLocation());
        document.getElementById('clearLocations').addEventListener('click', () => this.clearAll());
    }

    clearLocalStorage() {
        localStorage.removeItem('timelineLocations');
        this.locations = [];
        this.renderLocations();
    }

    clearAll() {
        if (confirm('Are you sure you want to clear all locations?')) {
            this.clearLocalStorage();
        }
    }

    showModal() {
        document.getElementById('locationModal').style.display = 'block';
    }

    hideModal() {
        document.getElementById('locationModal').style.display = 'none';
    }

    addLocation() {
        const name = document.getElementById('locationName').value;
        const description = document.getElementById('description').value;
        const imageFile = document.getElementById('locationImage').files[0];

        if (name) {
            const location = {
                id: Date.now(),
                name,
                description,
                image: imageFile ? URL.createObjectURL(imageFile) : null
            };

            this.locations.push(location);
            this.renderLocations();
            this.hideModal();
            
            // Clear form
            document.getElementById('locationName').value = '';
            document.getElementById('description').value = '';
            document.getElementById('locationImage').value = '';
        }
    }

    renderLocations() {
        const container = document.getElementById('locationsList');
        container.innerHTML = '';

        if (this.locations.length === 0) {
            container.innerHTML = '<div class="empty-state">Add your first location to start tracking your journey!</div>';
            return;
        }

        // Create SVG container for all paths
        const svgContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgContainer.style.position = 'absolute';
        svgContainer.style.top = '0';
        svgContainer.style.left = '0';
        svgContainer.style.width = '100%';
        svgContainer.style.height = '100%';
        svgContainer.style.pointerEvents = 'none';
        container.appendChild(svgContainer);

        // Create and position location elements
        const locationElements = this.locations.map((location, index) => {
            const el = this.createLocationElement(location, index);
            container.appendChild(el);
            return el;
        });

        // Draw connectors after elements are positioned
        setTimeout(() => {
            locationElements.forEach((el, index) => {
                if (index < locationElements.length - 1) {
                    this.drawConnector(svgContainer, el, locationElements[index + 1]);
                }
            });
        }, 100);
    }

    createLocationElement(location, index) {
        const div = document.createElement('div');
        div.className = 'location-item';
        div.style.top = index % 2 === 0 ? '20%' : '60%';
        div.style.left = `${(index * 25) + 10}%`;
        div.style.position = 'absolute';
        
        const time = new Date(location.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        div.innerHTML = `
            <div class="event-content">
                ${location.image ? `
                    <div class="event-image">
                        <img src="${location.image}" alt="${location.name}">
                        <div class="time-badge">${time}</div>
                    </div>
                ` : ''}
                <h3>${location.name}</h3>
                ${location.description ? `
                    <p class="event-description">${location.description}</p>
                ` : ''}
                <div class="marker"></div>
            </div>
        `;
        return div;
    }

    drawConnector(svg, startEl, endEl) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.classList.add('path-line');

        const startRect = startEl.getBoundingClientRect();
        const endRect = endEl.getBoundingClientRect();
        const containerRect = startEl.parentElement.getBoundingClientRect();

        const startX = startRect.left - containerRect.left + (startRect.width / 2);
        const startY = startRect.top - containerRect.top + (startRect.height / 2);
        const endX = endRect.left - containerRect.left + (endRect.width / 2);
        const endY = endRect.top - containerRect.top + (endRect.height / 2);

        const controlPoint1X = startX + (endX - startX) / 3;
        const controlPoint1Y = startY;
        const controlPoint2X = startX + (endX - startX) * 2/3;
        const controlPoint2Y = endY;

        const d = `M ${startX},${startY} 
                  C ${controlPoint1X},${controlPoint1Y} 
                    ${controlPoint2X},${controlPoint2Y} 
                    ${endX},${endY}`;

        path.setAttribute('d', d);
        svg.appendChild(path);
    }
}

// Initialize timeline when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Timeline();
});