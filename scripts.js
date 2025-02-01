/**
 * @fileoverview Simulador de Overlay de Memória Virtual
 * @version 1.0.0
 * @author Jorge Camargo
 * @copyright 2024
 * @description 
 * Este arquivo contém a implementação da lógica de simulação do sistema de overlay.
 * Gerencia a alocação, execução e remoção de processos em espaços de memória virtual,
 * controlando tempos de execução, repetições e estados dos processos.
 *
 * Funcionalidades principais:
 * - Gerenciamento de processos e subprocessos
 * - Controle de tempo de execução
 * - Sistema de fila de processos
 * - Animações de progresso
 * - Cancelamento manual de processos
 * - Logging de eventos
 */

/**
 * Variáveis globais para controle da simulação
 */
// Controla quantas vezes cada processo foi executado
const processRepetitions = {};
// Contador de execuções para cada processo
const processCounts = {};
// Conjunto de processos cancelados manualmente
const manuallyCancelledProcesses = new Set();
// Flags de controle
let allocationInProgress = false;
let simulationRunning = false;
let simulationInterval;
// Arrays para controle de animações e timeouts ativos
let activeAnimations = [];
let activeTimeouts = [];
// Tempo total de processamento
let totalProcessTime = 0;
let allOtherProcessesCompleted = false;

/**
 * Inicialização de elementos e eventos
 */
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

/**
 * Controla o início e parada da simulação
 * @description Alterna entre iniciar e parar a simulação, atualizando a interface
 */
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

/**
 * Gerencia os ícones de documento nas boxes
 * @description Adiciona e atualiza ícones em cada box da simulação
 */
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

/**
 * Atualiza o ícone do documento baseado no estado da box
 * @param {HTMLElement} boxWrapper - Elemento container da box
 */
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

/**
 * Tenta alocar um novo processo
 * @description Verifica e aloca processos da fila para boxes disponíveis
 */
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

/**
 * Aloca um processo em uma box livre
 * @param {string} processName - Nome do processo a ser alocado
 * @returns {boolean} - Sucesso ou falha na alocação
 */
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

/**
 * Inicia a animação de progresso do processo
 * @param {HTMLElement} boxWrapper - Elemento container da box
 * @param {string} processName - Nome do processo
 * @param {number} processTime - Tempo de execução do processo
 */
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

/**
 * Lida com a conclusão de um processo
 * @param {string} processName - Nome do processo concluído
 */
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

/**
 * Finaliza o processo principal
 */
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

/**
 * Aplica um atraso na alocação de processos
 */
function applyAllocationDelay() {
    console.log('Applying allocation delay');
    allocationInProgress = true;
    const timeout = setTimeout(() => {
        allocationInProgress = false;
        console.log('Allocation delay ended');
    }, 500);
    activeTimeouts.push(timeout);
}

/**
 * Move um processo para a lista de finalizados
 * @param {string} processName - Nome do processo
 * @param {string} [emoji='✅'] - Emoji de status do processo
 */
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

/**
 * Move todos os processos para a lista de finalizados com atraso
 */
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

/**
 * Registra detalhes de cancelamento de processos
 */
function logCancellationDetails() {
    const processList = document.querySelector('.process-column:first-child .process-list');
    console.log(`Processos restantes na lista de "Próximos Processos": ${processList.children.length}`);
}

/**
 * Registra o cancelamento de um processo
 * @param {string} processName - Nome do processo
 * @param {string} location - Local do cancelamento (box ou lista)
 */
function logCancellation(processName, location) {
    const remainingExecutions = getRepetitions(processName) - (processCounts[processName] || 0);
    console.log(
        `Processo cancelado: ${processName}, Local: ${location}, Motivo: Parada da simulação, Execuções restantes: ${remainingExecutions}`
    );
}

/**
 * Limpa todas as boxes
 */
function clearAllBoxes() {
    console.log('Clearing all boxes');
    const progressBars = document.querySelectorAll('.progress');
    progressBars.forEach((progressBar) => {
        progressBar.style.height = '0%';
    });
}

/**
 * Agenda a próxima execução de um processo
 * @param {string} processName - Nome do processo
 */
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

/**
 * Retorna o tempo de execução para cada tipo de processo
 * @param {string} processName - Nome do processo
 * @returns {number} - Tempo de execução em milissegundos
 */
function getProcessTime(processName) {
    console.log(`Getting process time for: ${processName}`);
    let processTime;
    switch (processName) {
        case 'Processo Principal':
            processTime = 5000 + totalProcessTime; // 5 segundos + tempo acumulado
            break;
        case 'Sub Processo 1': processTime = 5000; break; 
        case 'Sub Processo 2': processTime = 4000; break; 
        case 'Sub Processo 3': processTime = 6000; break; 
        case 'Sub Processo 4': processTime = 8000; break; 
        case 'Sub Processo 5': processTime = 3000; break; 
        case 'Sub Processo 6': processTime = 5000; break;
        case 'Sub Processo 7': processTime = 7000; break; 
        case 'Sub Processo 8': processTime = 3000; break; 
        case 'Sub Processo 9': processTime = 9000; break; 
        case 'Sub Processo 10': processTime = 4000; break; 
        default: processTime = Math.floor(Math.random() * 9000) + 1000; 
    }
    
    if (processName !== 'Processo Principal') {
        totalProcessTime += processTime; 
    }
    
    return processTime;
}

/**
 * Verifica se um processo pode ser executado
 * @param {string} processName - Nome do processo
 * @returns {boolean} - Se o processo pode ser executado
 */
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

/**
 * Incrementa o contador de execuções de um processo
 * @param {string} processName - Nome do processo
 */
function incrementProcessCount(processName) {
    console.log(`Incrementing process count for: ${processName}`);
    processCounts[processName]++;
}

/**
 * Retorna o número de repetições para cada tipo de processo
 * @param {string} processName - Nome do processo
 * @returns {number} - Número de repetições
 */
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

/**
 * Registra informações sobre o processo
 * @param {string} processName - Nome do processo
 * @param {HTMLElement} boxWrapper - Elemento container da box
 */
function logProcessInfo(processName, boxWrapper) {
    const boxIndex = boxWrapper.getAttribute('data-index');
    const executionCount = processCounts[processName];
    console.log(`Processo: ${processName}, Box: ${boxIndex}, Execução: ${executionCount}`);
}

/**
 * Pausa todas as animações e timeouts ativos
 */
function pauseAllProcesses() {
    console.log('Pausing all processes');
    activeAnimations.forEach(animation => cancelAnimationFrame(animation));
    activeAnimations = [];

    activeTimeouts.forEach(timeout => clearTimeout(timeout));
    activeTimeouts = [];
}

/**
 * Adiciona efeito de hover aos ícones de documento
 */
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



