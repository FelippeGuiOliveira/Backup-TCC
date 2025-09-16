import { charts } from './initDashboards.js';

let db = {};
const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

/** Carrega os dados do localStorage para a memória. */
function loadFromStorage() {
    const savedData = localStorage.getItem('dashboardData');
    db = savedData ? JSON.parse(savedData) : {};
}

/** Salva os dados da memória no localStorage. */
function saveToStorage() {
    localStorage.setItem('dashboardData', JSON.stringify(db));
}

/** Garante que a estrutura de um mês/ano exista e a retorna. */
function getMonthData(year, monthName) {
    if (!db[year]) db[year] = {};
    if (!db[year][monthName]) {
        db[year][monthName] = {
            energia: { equipamentos: [], totalConsumo: 0 },
            agua: { consumoReal: 0, consumoTotal: 0, custoTotal: 0, valorEconomizado: 0 },
            residuos: { reciclavel: 0, organico: 0, rejeito: 0, taxaReciclagem: 0 },
            ti: { equipamentos: [], totalReaproveitados: 0 }
        };
    }
    return db[year][monthName];
}

/** Retorna todos os dados de um ano. */
function getYearData(year) {
    return db[year] || {};
}

// --- Funções de Atualização da Interface ---

/**
 *  Atualiza todos os gráficos e cards de resumo com base nos dados de uma data.
 */
function updateUI(year, monthName) {
    const monthData = getMonthData(year, monthName);
    const yearData = getYearData(year);
    const summary = document.querySelectorAll('.summary-cards .summary-card strong');
    const chartTitleWithYear = `${monthName} ${year}`;

    // 1. Energia
    const totalConsumoEnergia = monthData.energia.equipamentos.reduce((acc, curr) => acc + (curr.consumo || 0), 0);
    if (summary.length > 0) summary[0].textContent = `${totalConsumoEnergia.toFixed(0)} kWh`;
    if (charts.energy) {
        charts.energy.data.labels = monthData.energia.equipamentos.map(e => e.nome);
        charts.energy.data.datasets[0].data = monthData.energia.equipamentos.map(e => e.consumo);
        charts.energy.options.plugins.title.text = chartTitleWithYear;
        charts.energy.update();
    }

    // 2. Água (Anual)
    const consumoTotalAgua = monthData.agua.consumoTotal || 0;
    if (summary.length > 1) summary[1].textContent = `${consumoTotalAgua.toLocaleString('pt-BR')} m³`;
    if (charts.water) {
        monthNames.forEach((mName, index) => {
            const dataOfMonth = yearData[mName]?.agua || { consumoReal: 0, consumoTotal: 0, custoTotal: 0, valorEconomizado: 0 };
            charts.water.data.datasets[0].data[index] = dataOfMonth.consumoReal;
            charts.water.data.datasets[1].data[index] = dataOfMonth.consumoTotal;
            charts.water.data.datasets[2].data[index] = dataOfMonth.custoTotal;
            charts.water.data.datasets[3].data[index] = dataOfMonth.valorEconomizado;
        });
        charts.water.options.plugins.title.text = `Uso de Água (Anual) - ${year}`;
        charts.water.update();
    }

    // 3. Resíduos
    const taxaReciclagem = monthData.residuos.taxaReciclagem || 0;
    if (summary.length > 2) summary[2].textContent = `${taxaReciclagem.toFixed(0)}%`;
    if (charts.waste) {
        charts.waste.data.datasets[0].data = [monthData.residuos.reciclavel, monthData.residuos.organico, monthData.residuos.rejeito];
        charts.waste.options.plugins.title.text = chartTitleWithYear;
        charts.waste.update();
    }

    // 4. TI
    const totalReaproveitados = monthData.ti.equipamentos.reduce((acc, curr) => acc + (curr.reaproveitados || 0), 0);
    if (summary.length > 3) summary[3].textContent = totalReaproveitados;
    if (charts.ti) {
        charts.ti.data.datasets = monthData.ti.equipamentos.length > 0
            ? monthData.ti.equipamentos.map(equip => ({
                label: equip.nome,
                data: [equip.reaproveitados, equip.descartados],
                backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.5)`,
            }))
            : [{ label: 'Nenhum equipamento', data: [0, 0], backgroundColor: 'rgba(200, 200, 200, 0.5)' }];
        charts.ti.options.plugins.title.text = chartTitleWithYear;
        charts.ti.update();
    }
}

// --- Inicialização e Event Listeners ---

export function initDashboardManager() {
    // Carrega os dados do storage ao iniciar
    loadFromStorage();

    const monthSelect = document.getElementById('month-select');
    const yearInput = document.getElementById('year-input');
    const saveBtn = document.querySelector('.save-dashboard-btn');
    const clearButtons = document.querySelectorAll('.btn-clear-chart');
    const clearYearButtons = document.querySelectorAll('.btn-clear-year');

    // Define data inicial e carrega a UI
    const today = new Date();
    monthSelect.value = today.getMonth();
    yearInput.value = today.getFullYear();
    updateUI(yearInput.value, monthNames[monthSelect.value]);

    // Mudança de data
    const handleDateChange = () => {
        updateUI(yearInput.value, monthNames[parseInt(monthSelect.value)]);
    };
    monthSelect.addEventListener('change', handleDateChange);
    yearInput.addEventListener('change', handleDateChange);

    // Botão de salvar
    saveBtn.addEventListener('click', () => {
        const year = yearInput.value;
        const monthName = monthNames[parseInt(monthSelect.value)];
        const monthData = getMonthData(year, monthName);
        const activeTabId = document.querySelector('.tab-content.active')?.id;

        switch (activeTabId) {
            case 'energia':
                const equipamento = document.querySelector('#equipamento')?.value || 'Não especificado';
                const consumo = parseFloat(document.querySelector('#energia .energiaConsumida')?.textContent.replace(',', '.')) || 0;
                const equipIndex = monthData.energia.equipamentos.findIndex(e => e.nome === equipamento);
                if (equipIndex !== -1) {
                    monthData.energia.equipamentos[equipIndex].consumo = consumo;
                } else {
                    monthData.energia.equipamentos.push({ nome: equipamento, consumo: consumo });
                }
                break;
            case 'agua':
                monthData.agua.consumoTotal = parseFloat(document.querySelector('#agua-consumo')?.value) || 0;
                const reutilizada = parseFloat(document.querySelector('#agua-reutilizada')?.value) || 0;
                const tarifa = parseFloat(document.querySelector('#agua-tarifa')?.value.replace(',', '.')) || 0;
                monthData.agua.consumoReal = monthData.agua.consumoTotal - reutilizada;
                monthData.agua.custoTotal = monthData.agua.consumoTotal * tarifa;
                monthData.agua.valorEconomizado = reutilizada * tarifa;
                break;
            case 'residuos':
                monthData.residuos.reciclavel = parseFloat(document.querySelector('#residuos-reciclavel')?.value) || 0;
                monthData.residuos.organico = parseFloat(document.querySelector('#residuos-organico')?.value) || 0;
                monthData.residuos.rejeito = parseFloat(document.querySelector('#residuos-rejeito')?.value) || 0;
                const totalResiduos = monthData.residuos.reciclavel + monthData.residuos.organico + monthData.residuos.rejeito;
                monthData.residuos.taxaReciclagem = totalResiduos > 0 ? (monthData.residuos.reciclavel / totalResiduos) * 100 : 0;
                break;
            case 'ti':
                const nomeEquip = (document.querySelector('#equipamentosTI')?.value.trim() || 'Equipamento').replace(/-/g, ' ');
                const reaproveitados = parseInt(document.querySelector('#ti-reaproveitados')?.value) || 0;
                const descartados = parseInt(document.querySelector('#ti-descartados')?.value) || 0;
                const tiIndex = monthData.ti.equipamentos.findIndex(e => e.nome === nomeEquip);
                if (tiIndex !== -1) {
                    monthData.ti.equipamentos[tiIndex] = { nome: nomeEquip, reaproveitados, descartados };
                } else {
                    monthData.ti.equipamentos.push({ nome: nomeEquip, reaproveitados, descartados });
                }
                break;
        }
        saveToStorage();
        updateUI(year, monthName);
        document.getElementById('dashboards')?.scrollIntoView({ behavior: 'smooth' });
    });

    // Botões de deletar
    clearButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const chartKey = event.currentTarget.dataset.chart;
            const year = yearInput.value;
            const monthName = monthNames[parseInt(monthSelect.value)];

            if (confirm(`Tem certeza que deseja limpar os dados de "${chartKey}" para ${monthName} de ${year}?`)) {
                const monthData = getMonthData(year, monthName);
                const dbKey = chartKey === 'energy' ? 'energia' : chartKey === 'water' ? 'agua' : chartKey === 'waste' ? 'residuos' : 'ti';

                // Reseta a categoria para o estado inicial
                const initialState = {
                    energia: { equipamentos: [], totalConsumo: 0 },
                    agua: { consumoReal: 0, consumoTotal: 0, custoTotal: 0, valorEconomizado: 0 },
                    residuos: { reciclavel: 0, organico: 0, rejeito: 0, taxaReciclagem: 0 },
                    ti: { equipamentos: [], totalReaproveitados: 0 }
                };
                db[year][monthName][dbKey] = initialState[dbKey];

                saveToStorage(); // Salva a alteração permanentemente
                updateUI(year, monthName); // Atualiza a UI sem recarregar
                alert(`Dados de "${chartKey}" para ${monthName}/${year} foram limpos.`);
            }
        });
    });

    // Listener para os botões de deletar o ano inteiro
    clearYearButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const chartKey = event.currentTarget.dataset.chart;
            const year = yearInput.value;

            if (chartKey === 'water') {
                if (confirm(`Tem certeza que deseja limpar TODOS os dados de água do ano de ${year}?`)) {
                    if (db[year]) {
                        Object.keys(db[year]).forEach(monthName => {
                            db[year][monthName].agua = { consumoReal: 0, consumoTotal: 0, custoTotal: 0, valorEconomizado: 0 };
                        });
                        saveToStorage();
                        updateUI(year, monthNames[parseInt(monthSelect.value)]);
                        alert(`Todos os dados de água para ${year} foram limpos.`);
                    }
                }
            }
        });
    });
}