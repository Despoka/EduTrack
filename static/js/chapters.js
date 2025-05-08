// Chapters management JavaScript functions

document.addEventListener('DOMContentLoaded', function() {
    // Add event listener for chapter form
    const chapterForm = document.getElementById('add-chapter-form');
    if (chapterForm) {
        chapterForm.addEventListener('submit', function(e) {
            const chapterNameInput = document.getElementById('chapter-name');
            
            if (!chapterNameInput.value.trim()) {
                e.preventDefault();
                showFormError(chapterNameInput, 'Chapter name is required');
            }
        });
    }
    
    // Add event listener for dependency form
    const dependencyForm = document.getElementById('add-dependency-form');
    if (dependencyForm) {
        dependencyForm.addEventListener('submit', function(e) {
            const chapterSelect = document.getElementById('chapter-id');
            const dependencySelect = document.getElementById('dependency-id');
            
            let isValid = true;
            
            if (chapterSelect.value === '') {
                showFormError(chapterSelect, 'Chapter is required');
                isValid = false;
            }
            
            if (dependencySelect.value === '') {
                showFormError(dependencySelect, 'Dependency chapter is required');
                isValid = false;
            }
            
            if (chapterSelect.value === dependencySelect.value) {
                showFormError(dependencySelect, 'A chapter cannot depend on itself');
                isValid = false;
            }
            
            if (!isValid) {
                e.preventDefault();
            }
        });
    }
    
    // Render dependency graph if data is available
    if (typeof dependencyMapData !== 'undefined' && dependencyMapData) {
        renderDependencyGraph(dependencyMapData);
    }
    
    // Initialize sortable tables
    initSortableTables();
});

/**
 * Render chapter dependency graph using D3.js
 * @param {Object} dependencyMap - Map of chapter dependencies
 */
function renderDependencyGraph(dependencyMap) {
    // Check if D3.js is loaded
    if (typeof d3 === 'undefined') {
        console.error('D3.js is required for the dependency graph');
        return;
    }
    
    const container = document.getElementById('dependency-graph');
    if (!container) return;
    
    // Get all chapters
    const chapters = Array.from(document.querySelectorAll('#chapter-id option'))
        .filter(option => option.value !== '')
        .map(option => ({
            id: parseInt(option.value),
            name: option.textContent.trim()
        }));
    
    // Prepare nodes and links for the graph
    const nodes = chapters.map(chapter => ({
        id: chapter.id,
        name: chapter.name
    }));
    
    const links = [];
    for (const [chapterId, dependencies] of Object.entries(dependencyMap)) {
        for (const dependencyId of dependencies) {
            links.push({
                source: parseInt(dependencyId),  // Dependency chapter
                target: parseInt(chapterId)      // Dependent chapter
            });
        }
    }
    
    // Set up the SVG
    const width = container.clientWidth;
    const height = 400;
    
    const svg = d3.select(container).append('svg')
        .attr('width', width)
        .attr('height', height);
    
    // Create a group to contain the graph
    const g = svg.append('g');
    
    // Add zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.1, 3])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });
    
    svg.call(zoom);
    
    // Create a force simulation
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2));
    
    // Add links (arrows)
    const link = g.append('g')
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrow)');
    
    // Define arrow marker
    svg.append('defs').append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 20)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('fill', '#999')
        .attr('d', 'M0,-5L10,0L0,5');
    
    // Add nodes (circles with text)
    const node = g.append('g')
        .selectAll('.node')
        .data(nodes)
        .join('g')
        .attr('class', 'node')
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));
    
    // Add circles for nodes
    node.append('circle')
        .attr('r', 8)
        .attr('fill', '#1565C0');
    
    // Add text labels
    node.append('text')
        .attr('dx', 12)
        .attr('dy', '.35em')
        .text(d => d.name)
        .attr('font-family', 'Roboto, sans-serif')
        .attr('font-size', '12px')
        .attr('fill', '#212121');
    
    // Update positions on each tick of the simulation
    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        node.attr('transform', d => `translate(${d.x}, ${d.y})`);
    });
    
    // Drag functions
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}

/**
 * Show error message for form field
 * @param {HTMLElement} element - Form element with error
 * @param {string} message - Error message to display
 */
function showFormError(element, message) {
    // Remove any existing error
    clearFormError(element);
    
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'form-error text-danger';
    errorElement.textContent = message;
    
    // Add error class to input
    element.classList.add('is-invalid');
    
    // Insert error after input
    element.parentNode.insertBefore(errorElement, element.nextSibling);
    
    // Focus the element
    element.focus();
}

/**
 * Clear error message for form field
 * @param {HTMLElement} element - Form element to clear error
 */
function clearFormError(element) {
    // Remove error class
    element.classList.remove('is-invalid');
    
    // Find and remove error message if it exists
    const errorElement = element.nextElementSibling;
    if (errorElement && errorElement.classList.contains('form-error')) {
        errorElement.remove();
    }
}

/**
 * Initialize sortable tables
 */
function initSortableTables() {
    document.querySelectorAll('table.sortable').forEach(table => {
        table.querySelectorAll('th').forEach(header => {
            // Don't make action columns sortable
            if (header.classList.contains('no-sort')) return;
            
            header.addEventListener('click', () => {
                const index = Array.from(header.parentNode.children).indexOf(header);
                const isAscending = header.classList.contains('sort-asc');
                
                // Remove sort classes from all headers
                table.querySelectorAll('th').forEach(th => {
                    th.classList.remove('sort-asc', 'sort-desc');
                });
                
                // Set new sort class
                header.classList.add(isAscending ? 'sort-desc' : 'sort-asc');
                
                // Sort the table
                const rows = Array.from(table.querySelectorAll('tbody tr'));
                const sortedRows = rows.sort((a, b) => {
                    const aValue = a.children[index].textContent.trim();
                    const bValue = b.children[index].textContent.trim();
                    
                    // Try to sort as numbers if possible
                    const aNum = parseFloat(aValue);
                    const bNum = parseFloat(bValue);
                    
                    if (!isNaN(aNum) && !isNaN(bNum)) {
                        return isAscending ? aNum - bNum : bNum - aNum;
                    }
                    
                    // Otherwise sort as strings
                    return isAscending ? 
                        aValue.localeCompare(bValue) : 
                        bValue.localeCompare(aValue);
                });
                
                // Reorder table
                const tbody = table.querySelector('tbody');
                sortedRows.forEach(row => tbody.appendChild(row));
            });
            
            // Add sort indicator and cursor
            header.classList.add('sortable');
            header.style.cursor = 'pointer';
            
            // Add indicator arrows
            const arrow = document.createElement('span');
            arrow.className = 'sort-arrow';
            arrow.textContent = '⇅';
            arrow.style.marginLeft = '5px';
            arrow.style.fontSize = '0.8em';
            header.appendChild(arrow);
        });
    });
}
