# Documentação do Simulador de Overlay de Memória Virtual

## Visão Geral
Este projeto implementa um simulador visual de overlay de memória virtual, demonstrando como diferentes processos são alocados, executados e removidos da memória. O sistema foi desenvolvido como parte do projeto final da disciplina de Arquitetura e Organização de Computadores.

## Estrutura do Projeto

```
CC23D-UTFPR-SH/
├── index.html      # Interface principal
├── styles.css      # Estilos e layouts
└── scripts.js      # Lógica da simulação
```

## Componentes Principais

### 1. Espaços de Memória
- 4 boxes representando espaços de memória
- Cada box pode estar em dois estados:
  - Livre (📃)
  - Em uso (⌛)

### 2. Processos
#### Processo Principal
- Execução única
- Tempo base: 5 segundos + tempo acumulado dos subprocessos

#### Subprocessos
| Processo | Tempo (ms) | Repetições |
|----------|------------|------------|
| Sub Processo 1 | 5000 | 3 |
| Sub Processo 2 | 4000 | 5 |
| Sub Processo 3 | 6000 | 3 |
| Sub Processo 4 | 8000 | 4 |
| Sub Processo 5 | 3000 | 5 |
| Sub Processo 6 | 5000 | 4 |
| Sub Processo 7 | 7000 | 3 |
| Sub Processo 8 | 3000 | 3 |
| Sub Processo 9 | 9000 | 4 |
| Sub Processo 10 | 4000 | 4 |

## Funcionalidades

### Controle de Simulação
- **Iniciar Simulação**: Começa a alocação e execução dos processos
- **Parar Simulação**: Interrompe todos os processos ativos
- **Recarregar**: Reinicia o simulador

### Gerenciamento de Processos
- Alocação automática em espaços livres
- Barra de progresso visual
- Cancelamento manual de processos
- Sistema de fila para próximas execuções

### Feedback Visual
- 🟦 Processo em execução
- ✅ Processo concluído
- ⛔ Processo cancelado

## Comportamentos Específicos

### Processo Principal
1. Inicia após todos os subprocessos serem concluídos
2. Tempo de execução considera o tempo acumulado de todos os subprocessos
3. Execução única e não cancelável manualmente

### Subprocessos
1. Executam em paralelo quando há espaço disponível
2. Podem ser cancelados manualmente
3. Retornam à fila se tiverem execuções pendentes
4. Mostram progresso visual em tempo real

## Interação do Usuário

### Ações Disponíveis
- Iniciar/Parar simulação
- Cancelar processos individuais
- Reiniciar simulação
- Monitorar progresso dos processos

### Interface Visual
- Boxes de memória com indicadores de estado
- Lista de próximos processos
- Lista de processos finalizados
- Barra de progresso para cada processo ativo

## Estados de Processo

### 1. Em Espera
- Listado em "Próximos Processos"
- Aguardando espaço livre

### 2. Em Execução
- Alocado em uma box
- Mostrando progresso
- Pode ser cancelado

### 3. Finalizado
- Removido da memória
- Registrado com status (✅ ou ⛔)
- Pode retornar à fila se houver repetições pendentes

## Detalhes Técnicos

### Temporização
- Delays entre alocações: 500ms
- Visualização limitada a 10 segundos
- Tempo real mantido internamente

### Logging
- Registro de eventos no console
- Rastreamento de processos
- Informações de debugging

## Autor
Jorge Camargo - 2024