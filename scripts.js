const processRepetitions = {};
const processCounts = {};
const manuallyCancelledProcesses = new Set();
let allocationInProgress = false;
let simulationRunning = false;
let simulationInterval;
let activeAnimations = [];
let activeTimeouts = [];
let totalProcessTime = 0;
let allOtherProcessesCompleted = false; 


const simulationButton = document.querySelector('.simulation-btn');
const reloadButton = document.querySelector('.reload-btn');
simulationButton.addEventListener('click', () => {
    console.log('Simulation button clicked');
    toggleSimulation();
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('Document loaded');
    addDocumentIconsToBoxes();
    addHoverEffectToIcons();
});

function toggleSimulation() {
    console.log('Toggling simulation');
    simulationRunning = !simulationRunning;

    if (simulationRunning) {
        console.log('Simulation started');
        simulationButton.textContent = 'Parar Simulação';
        simulationButton.classList.add('stop-btn');
        reloadButton.style.display = 'inline-block'; 
        tryAllocateProcess();
    } else {
        console.log('Simulation stopped');
        pauseAllProcesses();
        clearAllBoxes();
        moveAllToFinalizedWithDelay();
        clearInterval(simulationInterval);
        logCancellationDetails();
    }
}

reloadButton.addEventListener('click', () => {
    console.log('Reload button clicked');
    window.location.reload(); 
});

function addDocumentIconsToBoxes() {
    console.log('Adding document icons to boxes');
    const boxWrappers = document.querySelectorAll('.box-wrapper');
    boxWrappers.forEach((boxWrapper) => {
        let documentIconWrapper = boxWrapper.querySelector('.document-icon');
        if (!documentIconWrapper) {
            documentIconWrapper = document.createElement('div');
            documentIconWrapper.classList.add('document-icon');
            boxWrapper.querySelector('.box-label-container').appendChild(documentIconWrapper);
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
            updateDocumentIcon(boxWrapper); 

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

                if (processName !== 'Processo Principal' || allOtherProcessesCompleted) {
                    boxWrapper.querySelector('.box-label').textContent = 'Espaço Livre';
                    progressBar.style.height = '0%';
                    updateDocumentIcon(boxWrapper); 
                    handleProcessCompletion(processName);
                }

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
    
    if (manuallyCancelledProcesses.has(processName)) {
        console.log(`Process ${processName} was manually cancelled, skipping completion.`);
        return;
    }

    if (processName !== 'Processo Principal') {
        moveToFinalized(processName, manuallyCancelledProcesses.has(processName) ? '⛔' : '✅');
        if (canExecuteProcess(processName)) {
            scheduleNextExecution(processName);
        }
    }

    const activeBoxes = Array.from(document.querySelectorAll('.box-wrapper .box-label'))
        .filter(label => label.textContent !== 'Espaço Livre' && label.textContent !== 'Processo Principal');

    const remainingProcesses = document.querySelector('.process-column:first-child .process-list').children.length + activeBoxes.length;
    
    if (remainingProcesses === 0 && processName !== 'Processo Principal') {
        allOtherProcessesCompleted = true;
        finalizeProcesso1(); 
    }
}



function finalizeProcesso1() {
    console.log('Finalizing Processo Principal');
    const processBox = document.querySelector('.box-wrapper .box-label');
    if (processBox && processBox.textContent === 'Processo Principal') {
        const progressBar = processBox.closest('.box-wrapper').querySelector('.progress');
        processBox.textContent = 'Espaço Livre';
        progressBar.style.height = '0%';
        updateDocumentIcon(processBox.closest('.box-wrapper'));
        moveToFinalized('Processo Principal', '✅');
    }
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

    if (emoji === '⛔') {
        statusBox.style.backgroundColor = '#f44336'; 
    } else {
        statusBox.style.backgroundColor = '#4caf50'; 
    }

    contentWrapper.appendChild(processText);
    contentWrapper.appendChild(statusBox);
    listItem.appendChild(contentWrapper);
    finalizedList.appendChild(listItem);
    finalizedList.scrollTop = finalizedList.scrollHeight;
}

function moveAllToFinalizedWithDelay() {
    console.log('Moving all processes to finalized with delay');
    const boxWrappers = document.querySelectorAll('.box-wrapper');
    const processList = document.querySelector('.process-column:first-child .process-list');
    let delay = 0;

    boxWrappers.forEach((boxWrapper) => {
        const label = boxWrapper.querySelector('.box-label');
        if (label.textContent !== 'Espaço Livre') {
            setTimeout(() => {
                const processName = label.textContent;
                logCancellation(processName, 'box');
                moveToFinalized(processName, '⛔');
                label.textContent = 'Espaço Livre';
                updateDocumentIcon(boxWrapper);
            }, delay);
            delay += 300;
        }
    });

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
    let processTime;
    switch (processName) {
        case 'Processo Principal':
            processTime = 5000 + totalProcessTime; // 5 segundos + tempo acumulado
            break;
        case 'Sub Processo 1': processTime = 5000; break; // 5 segundos
        case 'Sub Processo 2': processTime = 4000; break; // 4 segundos
        case 'Sub Processo 3': processTime = 6000; break; // 6 segundos
        case 'Sub Processo 4': processTime = 8000; break; // 8 segundos
        case 'Sub Processo 5': processTime = 3000; break; // 2 segundos
        case 'Sub Processo 6': processTime = 5000; break; // 5 segundos
        case 'Sub Processo 7': processTime = 7000; break; // 7 segundos
        case 'Sub Processo 8': processTime = 3000; break; // 3 segundos
        case 'Sub Processo 9': processTime = 9000; break; // 9 segundos
        case 'Sub Processo 10': processTime = 4000; break; // 1 segundo
        default: processTime = Math.floor(Math.random() * 9000) + 1000; // Entre 1 e 10 segundos
    }
    
    if (processName !== 'Processo Principal') {
        totalProcessTime += processTime; 
    }
    
    return processTime;
}

function canExecuteProcess(processName) {
    console.log(`Checking if process can execute: ${processName}`);
    if (manuallyCancelledProcesses.has(processName)) {
        console.log(`Process ${processName} was manually cancelled and will not execute again.`);
        return false;
    }
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
        case 'Processo Principal': return 1;
        case 'Sub Processo 1': return 3;
        case 'Sub Processo 2': return 5;
        case 'Sub Processo 3': return 3;
        case 'Sub Processo 4': return 4;
        case 'Sub Processo 5': return 5;
        case 'Sub Processo 6': return 4;
        case 'Sub Processo 7': return 3;
        case 'Sub Processo 8': return 3;
        case 'Sub Processo 9': return 4;
        case 'Sub Processo 10': return 4;
    
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

function addHoverEffectToIcons() {
    console.log('Adding hover effect to icons');
    const documentIcons = document.querySelectorAll('.document-icon span');

    documentIcons.forEach((icon) => {
        icon.addEventListener('mouseover', () => {
            if (icon.textContent === '⌛') {
                icon.textContent = '❌';
                icon.parentElement.classList.add('hovering');
            }
        });

        icon.addEventListener('mouseout', () => {
            if (icon.textContent === '❌') {
                icon.textContent = '⌛';
                icon.parentElement.classList.remove('hovering');
            }
        });

        icon.addEventListener('click', () => {
            if (icon.textContent === '❌') {
                const boxWrapper = icon.closest('.box-wrapper');
                const label = boxWrapper.querySelector('.box-label');
                const progressBar = boxWrapper.querySelector('.progress');
                const processName = label.textContent;
        
                if (processName !== 'Espaço Livre') {
                    console.log(`Removing process ${processName} by user action`);
                    moveToFinalized(processName, '⛔');
                    label.textContent = 'Espaço Livre';
        
                    progressBar.remove();
                    const newProgressBar = document.createElement('div');
                    newProgressBar.classList.add('progress');
                    newProgressBar.style.height = '0%';
                    boxWrapper.querySelector('.box').appendChild(newProgressBar);
        
                    updateDocumentIcon(boxWrapper);
                    
                    manuallyCancelledProcesses.add(processName);
                }
            }
        });
    });
}



