// Dashboard JavaScript functions

document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts if performance data is available
    if (typeof performanceData !== 'undefined' && performanceData) {
        initializeCharts(performanceData);
    }
    
    // Add event listener for class selector
    const classSelector = document.getElementById('class-selector');
    if (classSelector) {
        classSelector.addEventListener('change', function() {
            const classId = this.value;
            if (classId) {
                window.location.href = `/dashboard?class_id=${classId}`;
            } else {
                window.location.href = '/dashboard';
            }
        });
    }
});

/**
 * Initialize all charts on the dashboard
 * @param {Object} data - Performance data for the selected class
 */
function initializeCharts(data) {
    // Performance distribution chart
    createPerformanceDistributionChart(data.performance_categories);
    
    // Average scores chart
    createAverageScoresChart(data.chapter_names, data.average_scores);
    
    // Student performance heatmap
    createPerformanceHeatmap(data);
}

/**
 * Create a pie chart showing the distribution of performance categories
 * @param {Object} categories - Performance categories data
 */
function createPerformanceDistributionChart(categories) {
    const ctx = document.getElementById('performance-distribution-chart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [
                'Kelas Khusus (>90)', 
                'Tidak Diperlukan (80-90)', 
                'Diperlukan (70-80)', 
                'Sangat Diperlukan (<70)',
                'Tidak Ada Data'
            ],
            datasets: [{
                data: [
                    categories.special_class || 0,
                    categories.unnecessary || 0,
                    categories.required || 0,
                    categories.very_necessary || 0,
                    categories.no_data || 0
                ],
                backgroundColor: [
                    '#1565C0', // Primary (Special Class)
                    '#2E7D32', // Secondary (Unnecessary)
                    '#FFA000', // Warning (Required)
                    '#C62828', // Danger (Very Necessary)
                    '#E0E0E0'  // No Data
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                }
            }
        }
    });
}

/**
 * Create a bar chart showing average scores by chapter
 * @param {Array} chapterNames - Names of all chapters
 * @param {Array} averageScores - Average scores for each chapter
 */
function createAverageScoresChart(chapterNames, averageScores) {
    const ctx = document.getElementById('average-scores-chart');
    if (!ctx) return;
    
    // Filter out chapters with no data
    const filteredChapters = [];
    const filteredScores = [];
    
    for (let i = 0; i < chapterNames.length; i++) {
        if (averageScores[i] !== null) {
            filteredChapters.push(chapterNames[i]);
            filteredScores.push(averageScores[i]);
        }
    }
    
    // Create the chart
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: filteredChapters,
            datasets: [{
                label: 'Nilai Rata-rata',
                data: filteredScores,
                backgroundColor: '#1565C0',
                borderColor: '#1565C0',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Nilai'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Bab'
                    }
                }
            }
        }
    });
}

/**
 * Create a heatmap showing student performance across chapters
 * @param {Object} data - Performance data including student scores
 */
function createPerformanceHeatmap(data) {
    const container = document.getElementById('performance-heatmap');
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
    data.chapter_names.forEach(chapterName => {
        const th = document.createElement('th');
        th.textContent = chapterName;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    // Add student rows
    data.student_data.forEach(student => {
        const row = document.createElement('tr');
        
        // Add student name
        const nameCell = document.createElement('td');
        nameCell.className = 'student-name';
        nameCell.textContent = student.name;
        row.appendChild(nameCell);
        
        // Add score cells
        student.scores.forEach(score => {
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
                cell.textContent = 'T/A';
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
