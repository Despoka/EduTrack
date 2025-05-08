// Classes management JavaScript functions

document.addEventListener('DOMContentLoaded', function() {
    // Add event listener for academic year form
    const yearForm = document.getElementById('add-year-form');
    if (yearForm) {
        yearForm.addEventListener('submit', function(e) {
            const yearNameInput = document.getElementById('year-name');
            if (!yearNameInput.value.trim()) {
                e.preventDefault();
                showFormError(yearNameInput, 'Academic year name is required');
            }
        });
    }
    
    // Add event listener for class form
    const classForm = document.getElementById('add-class-form');
    if (classForm) {
        classForm.addEventListener('submit', function(e) {
            const classNameInput = document.getElementById('class-name');
            const yearSelect = document.getElementById('year-id');
            
            let isValid = true;
            
            if (!classNameInput.value.trim()) {
                showFormError(classNameInput, 'Class name is required');
                isValid = false;
            }
            
            if (yearSelect.value === '') {
                showFormError(yearSelect, 'Academic year is required');
                isValid = false;
            }
            
            if (!isValid) {
                e.preventDefault();
            }
        });
    }
    
    // Initialize sortable tables
    initSortableTables();
});

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
 * Initialize sortable tables using vanilla JavaScript
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
            header.style.position = 'relative';
            
            // Add indicator arrows
            const arrow = document.createElement('span');
            arrow.className = 'sort-arrow';
            arrow.textContent = '⇅';
            arrow.style.marginLeft = '5px';
            arrow.style.fontSize = '0.8em';
            header.appendChild(arrow);
        });
    });
    
    // Add style for sort indicators
    const style = document.createElement('style');
    style.textContent = `
        th.sortable:hover {
            background-color: rgba(21, 101, 192, 0.1);
        }
        th.sort-asc .sort-arrow:after {
            content: '↑';
            margin-left: 5px;
        }
        th.sort-desc .sort-arrow:after {
            content: '↓';
            margin-left: 5px;
        }
        th.sortable .sort-arrow {
            opacity: 0.3;
        }
        th.sort-asc .sort-arrow, th.sort-desc .sort-arrow {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
}
