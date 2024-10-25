let totalProcesses = 10;
let currentProcess = 1;  // Começa com o processo 1

function getRandomTime() {
    return Math.floor(Math.random() * 3000) + 1000;
}

function simulateOverlay() {
    let processToBoxMap = {
        1: 'process1',
        2: 'process2',
        3: 'process3',
        4: 'process4'
    };

    const firstBox = document.getElementById(processToBoxMap[1]);

    // Executa o processo 1 com barra de progresso e mantém verde após a conclusão
    animateProgress(firstBox, getRandomTime(), true);

    const interval = setInterval(() => {
        let executingProcess = (currentProcess % totalProcesses) + 1;
        let boxId = processToBoxMap[Math.min(executingProcess, 4)];
        let box = document.getElementById(boxId);

        // Limpar todas as caixas (exceto o Processo 1, que deve permanecer verde)
        document.querySelectorAll('.process').forEach(b => {
            if (b !== firstBox) {
                b.classList.remove('active');
                b.style.background = '#fff';  // Resetar cor de fundo
            }
        });

        if (box !== firstBox) {
            box.classList.add('active');
            animateProgress(box, getRandomTime(), false);
        }

        currentProcess++;

        if (currentProcess >= totalProcesses) {
            clearInterval(interval);
        }
    }, 3500);
}

function animateProgress(element, duration, keepGreen) {
    let startTime = Date.now();

    function update() {
        let elapsed = Date.now() - startTime;
        let progress = Math.min(elapsed / duration, 1);  // Progresso de 0 a 1
        element.style.background = `linear-gradient(to right, #4caf50 ${progress * 100}%, #fff ${progress * 100}%)`;

        if (progress < 1) {
            requestAnimationFrame(update);  // Continuar a animação
        } else if (keepGreen) {
            element.style.background = '#4caf50';  // Manter verde após conclusão
        }
    }

    requestAnimationFrame(update);
}