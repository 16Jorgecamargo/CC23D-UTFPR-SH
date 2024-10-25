const processRepetitions = {};
const processCounts = {};
let allocationInProgress = false; // Flag para controlar o atraso global
let simulationRunning = false; // Flag para controlar o estado da simulação
let simulationInterval; // Armazena o intervalo da simulação

const simulationButton = document.querySelector('.simulation-btn');
simulationButton.addEventListener('click', () => {
    toggleSimulation(); // Alterna o estado da simulação
});

function toggleSimulation() {
    simulationRunning = !simulationRunning; // Alterna o estado
    simulationButton.textContent = simulationRunning ? 'Parar Simulação' : 'Iniciar Simulação';

    if (simulationRunning) {
        tryAllocateProcess(); // Inicia a alocação contínua
    } else {
        clearInterval(simulationInterval); // Para a simulação
    }
}

function tryAllocateProcess() {
    if (!simulationRunning) return; // Interrompe se a simulação não estiver ativa
    if (allocationInProgress) {
        setTimeout(tryAllocateProcess, 500); // Reagenda a tentativa após 0,5s
        return;
    }

    const processList = document.querySelector('.process-column:first-child .process-list');
    const nextProcess = processList.querySelector('li'); // Pega o primeiro processo da lista

    if (nextProcess) {
        const processName = nextProcess.textContent;

        if (canExecuteProcess(processName)) {
            const allocated = allocateProcess(processName);
            if (allocated) {
                incrementProcessCount(processName);
                processList.removeChild(nextProcess); // Remove da lista de próximos processos
            }
        }
    }

    simulationInterval = setTimeout(tryAllocateProcess, 500); // Recheca após 0,5s
}

function allocateProcess(processName) {
    const freeBoxes = document.querySelectorAll('.box-wrapper');
    let allocated = false;

    freeBoxes.forEach((boxWrapper) => {
        const label = boxWrapper.querySelector('.box-label');
        if (label.textContent === 'Espaço Livre' && !allocated) {
            label.textContent = processName;
            allocated = true;

            const processTime = getProcessTime(processName);
            logProcessInfo(processName, boxWrapper);
            startProgressAnimation(boxWrapper, processName, processTime);
        }
    });

    return allocated;
}

function startProgressAnimation(boxWrapper, processName, processTime) {
    const progressBar = boxWrapper.querySelector('.progress');
    progressBar.style.height = '0%';

    let startTime = Date.now();
    const visualTime = Math.min(processTime, 10000);

    function updateProgress() {
        const elapsedVisual = Date.now() - startTime;
        const percentage = Math.min((elapsedVisual / visualTime) * 100, 100);
        progressBar.style.height = `${percentage}%`;

        if (percentage < 100) {
            requestAnimationFrame(updateProgress);
        } else {
            setTimeout(() => {
                boxWrapper.querySelector('.box-label').textContent = 'Espaço Livre';
                progressBar.style.height = '0%';
                moveToFinalized(processName);
                applyAllocationDelay(); // Atraso de 0,5 segundos após finalização
            }, processTime - visualTime);
        }
    }

    requestAnimationFrame(updateProgress);
}

function applyAllocationDelay() {
    allocationInProgress = true; // Ativa a flag para impedir novas alocações
    setTimeout(() => {
        allocationInProgress = false; // Libera após 0,5s
    }, 500); // Atraso de 0,5s antes de permitir outra alocação
}

function moveToFinalized(processName) {
    const finalizedList = document.querySelector('.process-column:nth-child(2) .process-list');
    const listItem = document.createElement('li');
    listItem.textContent = processName;
    finalizedList.appendChild(listItem);

    if (canExecuteProcess(processName)) {
        scheduleNextExecution(processName);
    }
}

function scheduleNextExecution(processName) {
    setTimeout(() => {
        const processList = document.querySelector('.process-column:first-child .process-list');
        const listItem = document.createElement('li');
        listItem.textContent = processName;
        processList.appendChild(listItem);
    }, 1000); // Adiciona o processo novamente após 1s se ainda puder ser executado
}

function getProcessTime(processName) {
    switch (processName) {
        case 'Processo 1': return 197000;
        case 'Processo 2': return 4000;
        case 'Processo 3': return 6000;
        case 'Processo 4': return 8000;
        case 'Processo 5': return 2000;
        case 'Processo 6': return 5000;
        case 'Processo 7': return 7000;
        case 'Processo 8': return 3000;
        case 'Processo 9': return 9000;
        case 'Processo 10': return 1000;
        default: return Math.floor(Math.random() * 9000) + 1000;
    }
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
