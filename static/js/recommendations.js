// Recommendations JavaScript functions

document.addEventListener('DOMContentLoaded', function() {
    // Add event listener for class selector
    const classSelector = document.getElementById('class-selector');
    if (classSelector) {
        classSelector.addEventListener('change', function() {
            const classId = this.value;
            if (classId) {
                window.location.href = `/recommendations?class_id=${classId}`;
            } else {
                window.location.href = '/recommendations';
            }
        });
    }
    
    // Initialize categories summary chart if data is available
    if (typeof recommendationStats !== 'undefined' && recommendationStats) {
        createRecommendationSummaryChart(recommendationStats);
    }
    
    // Add filter functionality
    initializeFilters();
    
    // Initialize sortable tables
    initSortableTables();
});

/**
 * Create a bar chart summarizing recommendation categories
 * @param {Object} stats - Statistics about recommendation categories
 */
function createRecommendationSummaryChart(stats) {
    const ctx = document.getElementById('recommendation-summary-chart');
    if (!ctx) return;
    
    const categories = [
        'Kelas Khusus',
        'Tidak Diperlukan',
        'Diperlukan',
        'Sangat Diperlukan'
    ];
    
    const data = categories.map(cat => stats[cat] || 0);
    const colors = [
        '#1565C0', // Primary (Special Class)
        '#2E7D32', // Secondary (Unnecessary)
        '#FFA000', // Warning (Required)
        '#C62828', // Danger (Very Necessary)
        '#9E9E9E', // Grey (Not Started)
        '#8E24AA'  // Purple (Complete Prerequisites)
    ];
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Number of Recommendations',
                data: data,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Count'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Recommendation Category'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

/**
 * Initialize filtering functionality for recommendations
 */
function initializeFilters() {
    const filterSelect = document.getElementById('category-filter');
    if (!filterSelect) return;
    
    filterSelect.addEventListener('change', function() {
        const selectedCategory = this.value;
        const rows = document.querySelectorAll('.recommendation-row');
        
        rows.forEach(row => {
            if (selectedCategory === 'all') {
                row.style.display = '';
            } else {
                const category = row.dataset.category;
                row.style.display = category === selectedCategory ? '' : 'none';
            }
        });
    });
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
                    // Special handling for recommendation categories
                    if (index === 3) { // Assuming recommendation column is index 3
                        const aCategory = a.dataset.category;
                        const bCategory = b.dataset.category;
                        
                        // Define category order
                        const categoryOrder = {
                            'Very Necessary': 0,
                            'Required': 1,
                            'Unnecessary': 2,
                            'Special Class': 3,
                            'Complete Prerequisites': 4,
                            'Not Started': 5
                        };
                        
                        if (categoryOrder[aCategory] !== undefined && categoryOrder[bCategory] !== undefined) {
                            return isAscending ? 
                                categoryOrder[aCategory] - categoryOrder[bCategory] : 
                                categoryOrder[bCategory] - categoryOrder[aCategory];
                        }
                    }
                    
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
