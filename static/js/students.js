// Students management JavaScript functions

document.addEventListener('DOMContentLoaded', function() {
    // Add event listener for student form
    const studentForm = document.getElementById('add-student-form');
    if (studentForm) {
        studentForm.addEventListener('submit', function(e) {
            const studentNameInput = document.getElementById('student-name');
            const classSelect = document.getElementById('class-id');
            
            let isValid = true;
            
            if (!studentNameInput.value.trim()) {
                showFormError(studentNameInput, 'Student name is required');
                isValid = false;
            }
            
            if (classSelect.value === '') {
                showFormError(classSelect, 'Class is required');
                isValid = false;
            }
            
            if (!isValid) {
                e.preventDefault();
            }
        });
    }
    
    // Add event listener for grade form
    const gradeForms = document.querySelectorAll('.grade-form');
    gradeForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const scoreInput = form.querySelector('.score-input');
            if (!validateScore(scoreInput.value)) {
                e.preventDefault();
                showFormError(scoreInput, 'Score must be a number between 0 and 100');
            }
        });
    });
    
    // Add event listener for class selector
    const classSelector = document.getElementById('class-selector');
    if (classSelector) {
        classSelector.addEventListener('change', function() {
            const classId = this.value;
            if (classId) {
                window.location.href = `/students?class_id=${classId}`;
            } else {
                window.location.href = '/students';
            }
        });
    }
    
    // Initialize edit score functionality
    initializeScoreEditing();
    
    // Initialize sortable tables
    initSortableTables();
});

/**
 * Initialize in-place score editing
 */
function initializeScoreEditing() {
    const scoreDisplays = document.querySelectorAll('.score-display');
    
    scoreDisplays.forEach(display => {
        display.addEventListener('click', function() {
            const studentId = this.dataset.studentId;
            const chapterId = this.dataset.chapterId;
            const currentScore = this.dataset.score || '';
            
            // Hide the display
            this.style.display = 'none';
            
            // Show the form
            const form = document.querySelector(`.grade-form[data-student-id="${studentId}"][data-chapter-id="${chapterId}"]`);
            form.style.display = 'block';
            
            // Focus and select the input
            const input = form.querySelector('.score-input');
            input.focus();
            input.select();
        });
    });
    
    // Handle cancel buttons
    const cancelButtons = document.querySelectorAll('.cancel-edit');
    cancelButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const form = this.closest('.grade-form');
            const studentId = form.dataset.studentId;
            const chapterId = form.dataset.chapterId;
            
            // Hide form
            form.style.display = 'none';
            
            // Show display
            const display = document.querySelector(`.score-display[data-student-id="${studentId}"][data-chapter-id="${chapterId}"]`);
            display.style.display = 'block';
        });
    });
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
 * Validate score value
 * @param {string} score - Score value to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateScore(score) {
    if (score === '') return false;
    
    const numScore = parseFloat(score);
    return !isNaN(numScore) && numScore >= 0 && numScore <= 100;
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
