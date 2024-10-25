const processRepetitions = {};
const processCounts = {};
let allocationInProgress = false;
let simulationRunning = false;
let simulationInterval;
let activeAnimations = [];
let activeTimeouts = [];

const simulationButton = document.querySelector('.simulation-btn');
simulationButton.addEventListener('click', () => {
    toggleSimulation();
});

function toggleSimulation() {
    simulationRunning = !simulationRunning;
    simulationButton.textContent = simulationRunning ? 'Parar Simulação' : 'Iniciar Simulação';

    if (simulationRunning) {
        simulationButton.classList.add('stop-btn');
        tryAllocateProcess();
    } else {
        simulationButton.classList.remove('stop-btn');
        pauseAllProcesses();
        clearAllBoxes();
        moveAllToFinalizedWithDelay();
        clearInterval(simulationInterval);
        logCancellationDetails();
    }
}

function tryAllocateProcess() {
    if (!simulationRunning) return;
    if (allocationInProgress) {
        const timeout = setTimeout(tryAllocateProcess, 500);
        activeTimeouts.push(timeout);
        return;
    }

    const processList = document.querySelector('.process-column:first-child .process-list');
    const nextProcess = processList.querySelector('li');

    if (nextProcess) {
        const processName = nextProcess.textContent;

        if (canExecuteProcess(processName)) {
            const allocated = allocateProcess(processName);
            if (allocated) {
                incrementProcessCount(processName);
                processList.removeChild(nextProcess);
            }
        }
    }

    simulationInterval = setTimeout(tryAllocateProcess, 500);
    activeTimeouts.push(simulationInterval);
}

function allocateProcess(processName) {
    const freeBoxes = document.querySelectorAll('.box-wrapper');

    for (const boxWrapper of freeBoxes) {
        const label = boxWrapper.querySelector('.box-label');
        if (label.textContent === 'Espaço Livre') {
            label.textContent = processName;

            const processTime = getProcessTime(processName);
            logProcessInfo(processName, boxWrapper);
            startProgressAnimation(boxWrapper, processName, processTime);
            return true;
        }
    }

    return false;
}

function startProgressAnimation(boxWrapper, processName, processTime) {
    const progressBar = boxWrapper.querySelector('.progress');
    progressBar.style.height = '0%';

    let startTime = Date.now();
    const visualTime = Math.min(processTime, 1000);

    function updateProgress() {
        const elapsedVisual = Date.now() - startTime;
        const percentage = Math.min((elapsedVisual / visualTime) * 100, 100);
        progressBar.style.height = `${percentage}%`;

        if (percentage < 100) {
            const animation = requestAnimationFrame(updateProgress);
            activeAnimations.push(animation);
        } else {
            const timeout = setTimeout(() => {
                boxWrapper.querySelector('.box-label').textContent = 'Espaço Livre';
                progressBar.style.height = '0%';
                handleProcessCompletion(processName);
                applyAllocationDelay();
            }, processTime - visualTime);
            activeTimeouts.push(timeout);
        }
    }

    const animation = requestAnimationFrame(updateProgress);
    activeAnimations.push(animation);
}

function handleProcessCompletion(processName) {
    // Verifica se o processo precisa ser executado novamente ou movido para finalizados
    if (canExecuteProcess(processName)) {
        scheduleNextExecution(processName);
    } 
    moveToFinalized(processName); // Garante que o processo será movido para finalizados, mesmo que precise ser reexecutado
}

function applyAllocationDelay() {
    allocationInProgress = true;
    const timeout = setTimeout(() => {
        allocationInProgress = false;
    }, 500);
    activeTimeouts.push(timeout);
}

function moveToFinalized(processName, emoji = '✅') {
    const finalizedList = document.querySelector('.process-column:nth-child(2) .process-list');

    const listItem = document.createElement('li');
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('finalized-content');

    const processText = document.createElement('span');
    processText.textContent = processName;

    const statusBox = document.createElement('span');
    statusBox.classList.add('status-box');
    statusBox.textContent = emoji;

    contentWrapper.appendChild(processText);
    contentWrapper.appendChild(statusBox);
    listItem.appendChild(contentWrapper);
    finalizedList.appendChild(listItem);
}

function moveAllToFinalizedWithDelay() {
    const boxWrappers = document.querySelectorAll('.box-wrapper');
    const processList = document.querySelector('.process-column:first-child .process-list');
    let delay = 0;

    // Mover processos ativos nas boxes
    boxWrappers.forEach((boxWrapper) => {
        const label = boxWrapper.querySelector('.box-label');
        if (label.textContent !== 'Espaço Livre') {
            setTimeout(() => {
                const processName = label.textContent;
                logCancellation(processName, 'box');
                moveToFinalized(processName, '⛔');
                label.textContent = 'Espaço Livre';
            }, delay);
            delay += 300;
        }
    });

    // Mover processos restantes na lista de "Próximos Processos"
    processList.querySelectorAll('li').forEach((process) => {
        setTimeout(() => {
            const processName = process.textContent;
            logCancellation(processName, 'lista');
            moveToFinalized(processName, '⛔');
            process.remove();
        }, delay);
        delay += 300;
    });
}

function logCancellationDetails() {
    const processList = document.querySelector('.process-column:first-child .process-list');
    console.log(`Processos restantes na lista de "Próximos Processos": ${processList.children.length}`);
}

function logCancellation(processName, location) {
    const remainingExecutions = getRepetitions(processName) - (processCounts[processName] || 0);
    console.log(
        `Processo cancelado: ${processName}, Local: ${location}, Motivo: Parada da simulação, Execuções restantes: ${remainingExecutions}`
    );
}

function clearAllBoxes() {
    const progressBars = document.querySelectorAll('.progress');
    progressBars.forEach((progressBar) => {
        progressBar.style.height = '0%';
    });
}

function scheduleNextExecution(processName) {
    const timeout = setTimeout(() => {
        const processList = document.querySelector('.process-column:first-child .process-list');
        const listItem = document.createElement('li');
        listItem.textContent = processName;
        processList.appendChild(listItem);
    }, 1000);
    activeTimeouts.push(timeout);
}

function getProcessTime(processName) {
    return 1000; // Teste com 1 segundo para todos os processos
}

function canExecuteProcess(processName) {
    if (!processCounts[processName]) {
        processCounts[processName] = 0;
    }
    return processCounts[processName] < getRepetitions(processName);
}

function incrementProcessCount(processName) {
    processCounts[processName]++;
}

function getRepetitions(processName) {
    switch (processName) {
        case 'Processo 1': return 1;
        case 'Processo 2': return 5;
        case 'Processo 3': return 3;
        case 'Processo 4': return 4;
        case 'Processo 5': return 5;
        case 'Processo 6': return 4;
        case 'Processo 7': return 3;
        case 'Processo 8': return 3;
        case 'Processo 9': return 5;
        case 'Processo 10': return 4;
        default: return 0;
    }
}

function logProcessInfo(processName, boxWrapper) {
    const boxIndex = boxWrapper.getAttribute('data-index');
    const executionCount = processCounts[processName];
    console.log(`Processo: ${processName}, Box: ${boxIndex}, Execução: ${executionCount}`);
}

function pauseAllProcesses() {
    activeAnimations.forEach(animation => cancelAnimationFrame(animation));
    activeAnimations = [];

    activeTimeouts.forEach(timeout => clearTimeout(timeout));
    activeTimeouts = [];
}
