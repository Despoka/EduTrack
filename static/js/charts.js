/**
 * Helper functions for creating charts
 */

/**
 * Create a line chart for student progress over time
 * @param {string} elementId - ID of the canvas element
 * @param {Array} labels - X-axis labels (e.g., dates)
 * @param {Array} data - Y-axis data points
 * @param {string} title - Chart title
 */
function createLineChart(elementId, labels, data, title) {
    const ctx = document.getElementById(elementId);
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                borderColor: '#1565C0',
                backgroundColor: 'rgba(21, 101, 192, 0.1)',
                tension: 0.1,
                fill: true
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
                        text: 'Score'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Chapter'
                    }
                }
            }
        }
    });
}

/**
 * Create a bar chart
 * @param {string} elementId - ID of the canvas element
 * @param {Array} labels - X-axis labels
 * @param {Array} data - Y-axis data points
 * @param {string} title - Chart title
 * @param {Array} colors - Optional array of colors
 */
function createBarChart(elementId, labels, data, title, colors = null) {
    const ctx = document.getElementById(elementId);
    if (!ctx) return;
    
    if (!colors) {
        colors = new Array(data.length).fill('#1565C0');
    }
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: title,
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
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * Create a pie chart
 * @param {string} elementId - ID of the canvas element
 * @param {Array} labels - Category labels
 * @param {Array} data - Data points
 * @param {string} title - Chart title
 * @param {Array} colors - Optional array of colors
 */
function createPieChart(elementId, labels, data, title, colors = null) {
    const ctx = document.getElementById(elementId);
    if (!ctx) return;
    
    if (!colors) {
        colors = [
            '#1565C0', // Primary
            '#2E7D32', // Secondary
            '#FFA000', // Warning
            '#C62828', // Danger
            '#9E9E9E', // Grey
            '#673AB7', // Purple
            '#00BCD4'  // Cyan
        ];
    }
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, data.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                title: {
                    display: true,
                    text: title
                }
            }
        }
    });
}

/**
 * Create a radar chart to compare student performance across chapters
 * @param {string} elementId - ID of the canvas element
 * @param {Array} labels - Chapter names
 * @param {Array} datasets - Array of dataset objects with student data
 */
function createRadarChart(elementId, labels, datasets) {
    const ctx = document.getElementById(elementId);
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            }
        }
    });
}

/**
 * Create a heatmap visualization for student performance
 * @param {string} containerId - ID of the container element
 * @param {Array} students - Array of student names
 * @param {Array} chapters - Array of chapter names
 * @param {Array} data - 2D array of scores
 */
function createHeatmap(containerId, students, chapters, data) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Clear previous content
    container.innerHTML = '';
    
    // Create table
    const table = document.createElement('table');
    table.className = 'heatmap-table';
    
    // Create header row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // Add empty cell for the corner
    const cornerCell = document.createElement('th');
    headerRow.appendChild(cornerCell);
    
    // Add chapter names
    chapters.forEach(chapter => {
        const th = document.createElement('th');
        th.textContent = chapter;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    // Add student rows
    students.forEach((student, i) => {
        const row = document.createElement('tr');
        
        // Add student name
        const nameCell = document.createElement('td');
        nameCell.className = 'student-name';
        nameCell.textContent = student;
        row.appendChild(nameCell);
        
        // Add score cells
        data[i].forEach(score => {
            const cell = document.createElement('td');
            
            if (score !== null) {
                cell.textContent = score;
                
                // Add color based on score
                if (score >= 90) {
                    cell.className = 'score-cell special';
                } else if (score >= 80) {
                    cell.className = 'score-cell unnecessary';
                } else if (score >= 70) {
                    cell.className = 'score-cell required';
                } else {
                    cell.className = 'score-cell very-necessary';
                }
            } else {
                cell.textContent = 'N/A';
                cell.className = 'score-cell no-data';
            }
            
            row.appendChild(cell);
        });
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
    
    // Add CSS for the heatmap
    const style = document.createElement('style');
    style.textContent = `
        .heatmap-table {
            width: 100%;
            border-collapse: collapse;
        }
        .heatmap-table th, .heatmap-table td {
            padding: 8px;
            text-align: center;
            border: 1px solid #e0e0e0;
        }
        .heatmap-table th {
            background-color: #f5f7fa;
            font-weight: 500;
        }
        .student-name {
            text-align: left;
            font-weight: 500;
            background-color: #f5f7fa;
        }
        .score-cell.special {
            background-color: rgba(21, 101, 192, 0.8);
            color: white;
        }
        .score-cell.unnecessary {
            background-color: rgba(46, 125, 50, 0.8);
            color: white;
        }
        .score-cell.required {
            background-color: rgba(255, 160, 0, 0.8);
            color: white;
        }
        .score-cell.very-necessary {
            background-color: rgba(198, 40, 40, 0.8);
            color: white;
        }
        .score-cell.no-data {
            background-color: #f5f5f5;
            color: #9e9e9e;
        }
    `;
    document.head.appendChild(style);
}
