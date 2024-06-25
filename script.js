const redGroup = [1, 5, 8, 10, 11, 16, 20, 23, 24, 30, 33, 36];
const greenGroup = [3, 7, 9, 12, 14, 18, 22, 26, 28, 29, 31, 35];
const blueGroup = [2, 4, 6, 13, 15, 17, 19, 21, 25, 27, 32, 34];
const allowedNumbers = [...redGroup, ...greenGroup, ...blueGroup, 0];

let chart;

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('number-input');
    input.addEventListener('keypress', handleKeyPress);
    input.addEventListener('input', handleInput);
    input.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            addNumber();
        }
    });

    const cells = document.querySelectorAll('td[contenteditable="true"]');

    cells.forEach(cell => {
        cell.addEventListener('keypress', handleKeyPress);
        cell.addEventListener('input', handleInput);
    });

    loadTableFromStorage();
    updateTable();
    createChart();
});

function handleInput(event) {
    let value = event.target.value;
    
    // Remove non-numeric characters
    value = value.replace(/[^0-9]/g, '');
    
    // Trim leading zeros unless the value is '0'
    if (value.length > 1 && value[0] === '0') {
        value = value.substring(1);
    }

    event.target.value = value;
}

function handleKeyPress(event) {
    let value = event.target.value;

    if (!/^\d$/.test(event.key)) {
        event.preventDefault();
    }

    if (!isNaN(value) & value.length == 2 & !allowedNumbers.includes(value)) {
        event.preventDefault();
        event.target.value = '';
    }
}

function addNumber(event) {
    const input = document.getElementById('number-input');
    const value = parseInt(input.value);

    if (input.value === '') {
        alert('Por favor, insira um número.');
        return;
    }

    if (isNaN(value) | !allowedNumbers.includes(value)) {
        alert('Número inválido. Por favor, insira um número válido.');
        event.preventDefault();
        event.target.value = '';
        return;
    }

    shiftTable();
    const firstCell = document.querySelector('#main-table tr:first-child td:first-child');
    firstCell.textContent = input.value;
    saveTableToStorage();
    updateTable();
    input.value = '';
}

function shiftTable() {
    const rows = document.querySelectorAll('#main-table tr');
    let prevValue = null;

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        cells.forEach(cell => {
            const temp = cell.textContent;
            cell.textContent = prevValue;
            prevValue = temp;
        });
    });

    if (rows[rows.length - 1].querySelector('td:last-child').textContent !== '') {
        const newRow = document.createElement('tr');
        for (let i = 0; i < 10; i++) {
            const newCell = document.createElement('td');
            newRow.appendChild(newCell);
        }
        document.getElementById('main-table').appendChild(newRow);
    }
}

function updateTable() {
    const cells = document.querySelectorAll('#main-table td');

    let redCount = 0, blueCount = 0, greenCount = 0, totalCount = 0;

    cells.forEach(cell => {
        const value = parseInt(cell.textContent);
        if (!isNaN(value)) {
            if (!allowedNumbers.includes(value)) {
                cell.textContent = '';
            } else {
                totalCount++;
                cell.className = '';
                if (value === 0) {
                    cell.classList.add('black');
                } else if (redGroup.includes(value)) {
                    cell.classList.add('red');
                    redCount++;
                } else if (greenGroup.includes(value)) {
                    cell.classList.add('green');
                    greenCount++;
                } else if (blueGroup.includes(value)) {
                    cell.classList.add('blue');
                    blueCount++;
                }
            }
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
    if(chart != undefined){
        chart.data.datasets[0].data = [redPercentage, bluePercentage, greenPercentage];
        chart.update();
    }
}

function clearTable() {
    if (confirm('Tem certeza de que deseja limpar todos os dados?')) {
        const cells = document.querySelectorAll('#main-table td');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = '';
        });
        saveTableToStorage();
        updateTable();
    }
}

function deleteSelectedNumber() {
    const selectedCell = document.querySelector('#main-table td.selected');
    const rows = document.querySelectorAll('#main-table tr');

    if (selectedCell) {
        const cells = Array.from(document.querySelectorAll('#main-table td'));
        const selectedIndex = cells.indexOf(selectedCell);

        for (let i = selectedIndex; i < cells.length - 1; i++) {
            cells[i].textContent = cells[i + 1].textContent;
            cells[i].classList.remove('selected', 'red', 'blue', 'green', 'black');
        }
        cells[cells.length - 1].textContent = '';
        saveTableToStorage();
        updateTable();
    }
}

document.addEventListener('click', function(event) {
    if (event.target.tagName === 'TD') {
        document.querySelectorAll('#main-table td').forEach(cell => {
            cell.classList.remove('selected');
        });
        event.target.classList.add('selected');
    }
});

function saveTableToStorage() {
    const rows = document.querySelectorAll('#main-table tr');
    const data = [];

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const rowData = [];
        cells.forEach(cell => {
            rowData.push(cell.textContent);
        });
        data.push(rowData);
    });

    localStorage.setItem('tableData', JSON.stringify(data));
}

function loadTableFromStorage() {
    const data = JSON.parse(localStorage.getItem('tableData'));

    if (data) {
        const table = document.getElementById('main-table');
        data.forEach((rowData, rowIndex) => {
            if (rowIndex >= table.rows.length) {
                const newRow = table.insertRow();
                for (let i = 0; i < rowData.length; i++) {
                    newRow.insertCell();
                }
            }
            rowData.forEach((cellData, cellIndex) => {
                table.rows[rowIndex].cells[cellIndex].textContent = cellData;
            });
        });
    }
}