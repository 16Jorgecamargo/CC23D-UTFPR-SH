const processRepetitions = {}; // Armazena as repetições restantes de cada processo
const processCounts = {}; // Contador de execuções para cada processo

document.querySelector('.simulation-btn').addEventListener('click', () => {
    const processList = document.querySelector('.process-list');
    const firstProcess = processList.querySelector('li');

    if (firstProcess) {
        const processName = firstProcess.textContent;

        if (canExecuteProcess(processName)) {
            processList.removeChild(firstProcess);

            const freeBoxes = document.querySelectorAll('.box-wrapper');
            let allocated = false;

            freeBoxes.forEach((boxWrapper) => {
                const label = boxWrapper.querySelector('.box-label');
                if (label.textContent === 'Espaço Livre' && !allocated) {
                    label.textContent = processName;
                    allocated = true;

                    incrementProcessCount(processName);
                    const processTime = getProcessTime(processName);
                    logProcessInfo(processName, boxWrapper); // Log no console
                    startProgressAnimation(boxWrapper, processName, processTime);
                }
            });

            if (!allocated) {
                alert('Não há mais espaços livres disponíveis.');
            }
        } else {
            console.log(`Processo ${processName} já atingiu o limite de execuções.`);
        }
    } else {
        alert('Não há mais processos na lista.');
    }
});

// Função para definir o tempo do processo
function getProcessTime(processName) {
    switch (processName) {
        case 'Processo 1': return 60000; // 1 minuto (60.000ms)
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

// Controle de repetições do processo
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

// Verifica se o processo pode ser executado
function canExecuteProcess(processName) {
    if (!processCounts[processName]) {
        processCounts[processName] = 0;
    }
    return processCounts[processName] < getRepetitions(processName);
}

// Incrementa o contador de execuções do processo
function incrementProcessCount(processName) {
    processCounts[processName]++;
}

// Anima a barra de progresso
function startProgressAnimation(boxWrapper, processName, processTime) {
    const progressBar = boxWrapper.querySelector('.progress');
    progressBar.style.height = '0%';

    let startTime = Date.now();
    const visualTime = Math.min(processTime, 10000); // 10 segundos de animação visual
    const actualTime = processTime; // Tempo real de execução

    function updateProgress() {
        const elapsedVisual = Date.now() - startTime;
        const percentage = Math.min((elapsedVisual / visualTime) * 100, 100);
        progressBar.style.height = `${percentage}%`;

        if (percentage < 100) {
            requestAnimationFrame(updateProgress);
        } else {
            // Após a animação visual, espera o restante do tempo
            setTimeout(() => {
                boxWrapper.querySelector('.box-label').textContent = 'Espaço Livre';
                progressBar.style.height = '0%';
                moveToFinalized(processName);
            }, actualTime - visualTime);
        }
    }

    requestAnimationFrame(updateProgress);
}

// Move o processo para "Processos Finalizados"
function moveToFinalized(processName) {
    const finalizedList = document.querySelector('.process-column:nth-child(2) .process-list');
    const listItem = document.createElement('li');
    listItem.textContent = processName;
    finalizedList.appendChild(listItem);

    if (canExecuteProcess(processName)) {
        scheduleNextExecution(processName);
    }
}

// Agenda a próxima execução do processo
function scheduleNextExecution(processName) {
    setTimeout(() => {
        const processList = document.querySelector('.process-column:first-child .process-list');
        const listItem = document.createElement('li');
        listItem.textContent = processName;
        processList.appendChild(listItem);
    }, 1000);
}

// Loga as informações do processo no console
function logProcessInfo(processName, boxWrapper) {
    const boxIndex = boxWrapper.getAttribute('data-index');
    const executionCount = processCounts[processName];
    console.log(`Processo: ${processName}, Box: ${boxIndex}, Execução: ${executionCount}`);
}
