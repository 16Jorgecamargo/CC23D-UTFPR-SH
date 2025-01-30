# Simulação de Overlay de Memória Virtual

<div style="display: inline-block">
    <img align="center" alt="HTML5" src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
    <img align="center" alt="CSS3" src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white">
    <img align="center" alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
    <img align="center" alt="Visual Studio Code" src="https://img.shields.io/badge/Visual_Studio_Code-0078D4?style=for-the-badge&logo=visual%20studio%20code&logoColor=white">
</div>

## Sobre o Projeto
Este projeto é um trabalho acadêmico desenvolvido para a disciplina de Arquitetura e Organização de Computadores da UTFPR. Consiste em uma simulação visual do mecanismo de Overlays em Sistemas de Memória Virtual, demonstrando o gerenciamento de processos e sub-processos em um ambiente controlado.

## Características
- Interface gráfica web interativa
- Visualização em tempo real do progresso dos processos
- Sistema de gerenciamento de múltiplos processos
- Controle visual de estados dos processos
- Animações suaves de progresso
- Sistema de fila de processos
- Registro de processos finalizados

## Funcionalidades Principais
1. **Gerenciamento de Processos**
   - Um processo principal e 10 sub-processos
   - Tempos de execução variáveis para cada processo
   - Sistema de repetições configurável por processo

2. **Interface Visual**
   - 4 slots de memória para execução simultânea
   - Barra de progresso para cada processo em execução
   - Lista de próximos processos
   - Lista de processos finalizados

3. **Controles**
   - Botão de início/parada da simulação
   - Cancelamento individual de processos
   - Sistema de recarga da simulação

## Como Executar
1. Clone o repositório
2. Abra o arquivo `index.html` em um navegador web moderno
3. Clique em "Iniciar Simulação" para começar

## Estrutura do Projeto
```
CC23D-UTFPR-SH/
│
├── index.html      # Página principal da aplicação
├── styles.css      # Estilos da interface
├── scripts.js      # Lógica da simulação
└── README.md       # Documentação
```

## Detalhes da Implementação

### Sistema de Processos
- **Processo Principal**: Controla o fluxo geral da simulação
- **Sub-processos**: Executam tarefas específicas com tempos variados
- Cada processo possui:
  - Tempo de execução próprio
  - Número definido de repetições
  - Estado visual de progresso
  - Identificação única

### Gerenciamento de Memória
- 4 slots de memória simulados
- Sistema de alocação dinâmica
- Controle de processos simultâneos
- Liberação automática após conclusão

### Interface do Usuário
- Design responsivo
- Feedback visual em tempo real
- Indicadores de status claros
- Controles intuitivos

## Autor
Jorge Camargo

UTFPR-SH - 2024

## Disciplina
Arquitetura e Organização de Computadores - Universidade Tecnológica Federal do Paraná (UTFPR)

---
Projeto desenvolvido como trabalho acadêmico para demonstração do conceito de Overlays em Sistemas de Memória Virtual.
