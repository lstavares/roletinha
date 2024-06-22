document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('td[contenteditable="true"]');

    cells.forEach(cell => {
        cell.addEventListener('input', handleInput);
        cell.addEventListener('keypress', handleKeyPress);
//        cell.addEventListener('blur', handleBlur);  // Adiciona o evento blur para validação de duplicidade
    });

    updateTable();
    createChart();
});

const redGroup = [1, 5, 8, 10, 11, 16, 20, 23, 24, 30, 33, 36];
const greenGroup = [3, 7, 9, 12, 14, 18, 22, 26, 28, 29, 31, 35];
const blueGroup = [2, 4, 6, 13, 15, 17, 19, 21, 25, 27, 32, 34];
const allowedNumbers = [...redGroup, ...greenGroup, ...blueGroup, 0];

let chart;

function handleBlur(event) {
    const value = event.target.textContent;

    if (value !== '' && isDuplicate(value, event.target)) {
        alert('Número duplicado não é permitido.');
        event.target.textContent = '';
    }

    updateTable();
}

function handleInput(event) {
    let value = event.target.textContent;
    
    // Remove non-numeric characters
    value = value.replace(/[^0-9]/g, '');
    
    // Trim leading zeros unless the value is '0'
    if (value.length > 1 && value[0] === '0') {
        value = value.substring(1);
    }

    event.target.textContent = value;
    
    updateTable();
}

function handleKeyPress(event) {
    if (!/^\d$/.test(event.key)) {
        event.preventDefault();
    }
}

function isDuplicate(value, currentCell) {
    const cells = document.querySelectorAll('td[contenteditable="true"]');
    let duplicate = false;

    cells.forEach(cell => {
        if (cell !== currentCell && cell.textContent === value) {
            duplicate = true;
        }
    });

    return duplicate;
}

function updateTable() {
    const cells = document.querySelectorAll('td[contenteditable="true"]');

    let redCount = 0, blueCount = 0, greenCount = 0, totalCount = 0;

    cells.forEach(cell => {
        const value = parseInt(cell.textContent);
        if (!isNaN(value)) {
            if (!allowedNumbers.includes(value)) {
                cell.textContent = '';
            } else {
                totalCount++;
                if (value === 0) {
                    cell.style.color = 'black';
                } else if (redGroup.includes(value)) {
                    cell.style.color = 'red';
                    redCount++;
                } else if (greenGroup.includes(value)) {
                    cell.style.color = 'green';
                    greenCount++;
                } else if (blueGroup.includes(value)) {
                    cell.style.color = 'blue';
                    blueCount++;
                } else {
                    cell.style.color = 'black';
                }
            }
        } else {
            cell.style.color = 'black';
        }
    });

    const redPercentage = totalCount === 0 ? 0 : (redCount / totalCount) * 100;
    const bluePercentage = totalCount === 0 ? 0 : (blueCount / totalCount) * 100;
    const greenPercentage = totalCount === 0 ? 0 : (greenCount / totalCount) * 100;

    document.getElementById('percent-red').textContent = redPercentage.toFixed(2) + '%';
    document.getElementById('percent-blue').textContent = bluePercentage.toFixed(2) + '%';
    document.getElementById('percent-green').textContent = greenPercentage.toFixed(2) + '%';

    updateChart(redPercentage, bluePercentage, greenPercentage);
}

function createChart() {
    const ctx = document.getElementById('percentageChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Red', 'Blue', 'Green'],
            datasets: [{
                label: 'Porcentagem',
                data: [0, 0, 0],
                backgroundColor: ['red', 'blue', 'green']
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function updateChart(redPercentage, bluePercentage, greenPercentage) {
    chart.data.datasets[0].data = [redPercentage, bluePercentage, greenPercentage];
    chart.update();
}

function saveData() {
    const rows = document.querySelectorAll('tr');
    let data = '';
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        cells.forEach(cell => {
            data += cell.textContent + ';';
        });
        data += '\n';
    });
    window.api.saveData(data);
}

async function loadData() {
    const data = await window.api.loadData();
    if (data) {
        const rows = data.split('\n');
        rows.forEach((row, rowIndex) => {
            const cells = row.split(';');
            cells.forEach((cell, cellIndex) => {
                const tableCell = document.querySelectorAll('tr')[rowIndex].querySelectorAll('td')[cellIndex];
                tableCell.textContent = cell;
            });
        });
        updateTable();
    }
}

function clearTable() {
    if (confirm('Tem certeza de que deseja limpar todos os dados?')) {
        const cells = document.querySelectorAll('td[contenteditable="true"]');
        cells.forEach(cell => {
            cell.textContent = '';
        });
        updateTable();
    }
}
