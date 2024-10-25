const processRepetitions = {};
const processCounts = {};
let allocationInProgress = false;
let simulationRunning = false;
let simulationInterval;
let activeAnimations = [];
let activeTimeouts = [];

const simulationButton = document.querySelector('.simulation-btn');
simulationButton.addEventListener('click', () => {
    console.log('Simulation button clicked');
    toggleSimulation();
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('Document loaded');
    // Adiciona o ícone de documento ao lado da label de cada box
    addDocumentIconsToBoxes();
});

function toggleSimulation() {
    console.log('Toggling simulation');
    simulationRunning = !simulationRunning;
    simulationButton.textContent = simulationRunning ? 'Parar Simulação' : 'Iniciar Simulação';

    if (simulationRunning) {
        console.log('Simulation started');
        simulationButton.classList.add('stop-btn');
        tryAllocateProcess();
    } else {
        console.log('Simulation stopped');
        simulationButton.classList.remove('stop-btn');
        pauseAllProcesses();
        clearAllBoxes();
        moveAllToFinalizedWithDelay();
        clearInterval(simulationInterval);
        logCancellationDetails();
    }
}

function addDocumentIconsToBoxes() {
    console.log('Adding document icons to boxes');
    const boxWrappers = document.querySelectorAll('.box-wrapper');
    boxWrappers.forEach((boxWrapper) => {
        let documentIconWrapper = boxWrapper.querySelector('.document-icon');
        
        // Se já existir o elemento, apenas atualiza o ícone
        if (!documentIconWrapper) {
            documentIconWrapper = document.createElement('div');
            documentIconWrapper.classList.add('document-icon');
            boxWrapper.appendChild(documentIconWrapper);
        }
        
        updateDocumentIcon(boxWrapper);
    });
}

function updateDocumentIcon(boxWrapper) {
    console.log('Updating document icon');
    const label = boxWrapper.querySelector('.box-label');
    const documentIconWrapper = boxWrapper.querySelector('.document-icon');
    const documentIcon = documentIconWrapper.querySelector('span') || document.createElement('span');

    if (label.textContent === 'Espaço Livre') {
        documentIcon.textContent = '📃';
    } else {
        documentIcon.textContent = '⌛';
    }

    // Se o span ainda não está no documentIconWrapper, anexa ele
    if (!documentIconWrapper.contains(documentIcon)) {
        documentIconWrapper.appendChild(documentIcon);
    }
}

function tryAllocateProcess() {
    console.log('Trying to allocate process');
    if (!simulationRunning) return;
    if (allocationInProgress) {
        console.log('Allocation in progress, retrying...');
        const timeout = setTimeout(tryAllocateProcess, 500);
        activeTimeouts.push(timeout);
        return;
    }

    const processList = document.querySelector('.process-column:first-child .process-list');
    const nextProcess = processList.querySelector('li');

    if (nextProcess) {
        const processName = nextProcess.textContent;
        console.log(`Next process to allocate: ${processName}`);

        if (canExecuteProcess(processName)) {
            const allocated = allocateProcess(processName);
            if (allocated) {
                console.log(`Process ${processName} allocated successfully`);
                incrementProcessCount(processName);
                processList.removeChild(nextProcess);
            } else {
                console.log(`Failed to allocate process ${processName}`);
            }
        }
    }

    simulationInterval = setTimeout(tryAllocateProcess, 500);
    activeTimeouts.push(simulationInterval);
}

function allocateProcess(processName) {
    console.log(`Allocating process: ${processName}`);
    const freeBoxes = document.querySelectorAll('.box-wrapper');

    for (const boxWrapper of freeBoxes) {
        const label = boxWrapper.querySelector('.box-label');
        if (label.textContent === 'Espaço Livre') {
            label.textContent = processName;
            updateDocumentIcon(boxWrapper); // Atualiza o ícone para ⌛

            const processTime = getProcessTime(processName);
            logProcessInfo(processName, boxWrapper);
            startProgressAnimation(boxWrapper, processName, processTime);
            return true;
        }
    }

    console.log(`No free boxes available for process: ${processName}`);
    return false;
}

function startProgressAnimation(boxWrapper, processName, processTime) {
    console.log(`Starting progress animation for process: ${processName}`);
    const progressBar = boxWrapper.querySelector('.progress');
    progressBar.style.height = '0%';

    let startTime = Date.now();
    const visualTime = Math.min(processTime, 10000);

    function updateProgress() {
        const elapsedVisual = Date.now() - startTime;
        const percentage = Math.min((elapsedVisual / visualTime) * 100, 100);
        progressBar.style.height = `${percentage}%`;
        console.log(`Progress for process ${processName}: ${percentage}%`);

        if (percentage < 100) {
            const animation = requestAnimationFrame(updateProgress);
            activeAnimations.push(animation);
        } else {
            const timeout = setTimeout(() => {
                console.log(`Process ${processName} completed`);
                boxWrapper.querySelector('.box-label').textContent = 'Espaço Livre';
                progressBar.style.height = '0%';
                updateDocumentIcon(boxWrapper); // Atualiza o ícone para 📃
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
    console.log(`Handling process completion for: ${processName}`);
    if (canExecuteProcess(processName)) {
        scheduleNextExecution(processName);
    }
    moveToFinalized(processName);
}

function applyAllocationDelay() {
    console.log('Applying allocation delay');
    allocationInProgress = true;
    const timeout = setTimeout(() => {
        allocationInProgress = false;
        console.log('Allocation delay ended');
    }, 500);
    activeTimeouts.push(timeout);
}

function moveToFinalized(processName, emoji = '✅') {
    console.log(`Moving process ${processName} to finalized with emoji ${emoji}`);
    const finalizedList = document.querySelector('.process-column:nth-child(2) .process-list');

    const listItem = document.createElement('li');
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('finalized-content');

    const processText = document.createElement('span');
    processText.textContent = processName;

    const statusBox = document.createElement('span');
    statusBox.classList.add('status-box');
    statusBox.textContent = emoji;

    // Altera a cor do quadrado dependendo do emoji
    if (emoji === '⛔') {
        statusBox.style.backgroundColor = '#f44336'; // Cor vermelha
    } else {
        statusBox.style.backgroundColor = '#4caf50'; // Cor verde
    }

    contentWrapper.appendChild(processText);
    contentWrapper.appendChild(statusBox);
    listItem.appendChild(contentWrapper);
    finalizedList.appendChild(listItem);

    // Adiciona a rolagem automática para o fim da lista
    finalizedList.scrollTop = finalizedList.scrollHeight;
}

function moveAllToFinalizedWithDelay() {
    console.log('Moving all processes to finalized with delay');
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
                updateDocumentIcon(boxWrapper); // Atualiza o ícone para 📃
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
    console.log('Clearing all boxes');
    const progressBars = document.querySelectorAll('.progress');
    progressBars.forEach((progressBar) => {
        progressBar.style.height = '0%';
    });
}

function scheduleNextExecution(processName) {
    console.log(`Scheduling next execution for process: ${processName}`);
    const timeout = setTimeout(() => {
        const processList = document.querySelector('.process-column:first-child .process-list');
        const listItem = document.createElement('li');
        listItem.textContent = processName;
        processList.appendChild(listItem);
        console.log(`Process ${processName} scheduled for next execution`);
    }, 1000);
    activeTimeouts.push(timeout);
}

function getProcessTime(processName) {
    console.log(`Getting process time for: ${processName}`);
    switch (processName) {
        case 'Processo 1': return 60000; // 1 minuto
        case 'Processo 2': return 4000; // 4 segundos
        case 'Processo 3': return 6000; // 6 segundos
        case 'Processo 4': return 8000; // 8 segundos
        case 'Processo 5': return 2000; // 2 segundos
        case 'Processo 6': return 5000; // 5 segundos
        case 'Processo 7': return 7000; // 7 segundos
        case 'Processo 8': return 3000; // 3 segundos
        case 'Processo 9': return 9000; // 9 segundos
        case 'Processo 10': return 1000; // 1 segundo
        default: return Math.floor(Math.random() * 9000) + 1000; // Entre 1 e 10 segundos
    }
}

function canExecuteProcess(processName) {
    console.log(`Checking if process can execute: ${processName}`);
    if (!processCounts[processName]) {
        processCounts[processName] = 0;
    }
    return processCounts[processName] < getRepetitions(processName);
}

function incrementProcessCount(processName) {
    console.log(`Incrementing process count for: ${processName}`);
    processCounts[processName]++;
}

function getRepetitions(processName) {
    console.log(`Getting repetitions for process: ${processName}`);
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
    console.log('Pausing all processes');
    activeAnimations.forEach(animation => cancelAnimationFrame(animation));
    activeAnimations = [];

    activeTimeouts.forEach(timeout => clearTimeout(timeout));
    activeTimeouts = [];
}
