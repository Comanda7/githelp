document.addEventListener('DOMContentLoaded', () => {
    let commandsData = [];
    let currentCategory = 'all';
    let searchQuery = '';

    const commandsContainer = document.getElementById('commands-container');
    const filterButtonsContainer = document.getElementById('filter-buttons-container');
    const searchInput = document.getElementById('search-input');
    const currentCategoryTitle = document.getElementById('current-category-title');
    const commandsCounter = document.getElementById('commands-counter');

    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Сетевая ошибка при попытке прочитать data.json');
            }
            return response.json();
        })
        .then(data => {
            commandsData = data;
            renderGlossary();
        })
        .catch(error => {
            console.error('Ошибка:', error);
            commandsContainer.innerHTML = `
                <div class="no-results" style="text-align: left; line-height: 1.8;">
                    <b style="color: #ef4444; font-size: 1.2rem;">⚠️ Ошибка доступа к data.json (Блокировка CORS)</b><br><br>
                    Браузеры блокируют загрузку внешних файлов, если вы открыли HTML-файл напрямую с диска (в строке адреса написано <code>file:///...</code>).<br><br>
                    <b>Как это исправить:</b><br>
                    1. Откройте папку проекта в <b>VS Code</b>.<br>
                    2. Установите расширение <b>Live Server</b>.<br>
                    3. Нажмите правой кнопкой на <code>index.html</code> -> <b>"Open with Live Server"</b>.<br>
                    Или запустите локальный сервер командой в терминале: <code>python -m http.server 8000</code>.
                </div>`;
        });

    function renderGlossary() {
        const filteredData = commandsData.filter(item => {
            const matchesCategory = (currentCategory === 'all' || item.category === currentCategory);
            const matchesSearch = item.command.toLowerCase().includes(searchQuery) ||
                                  item.description.toLowerCase().includes(searchQuery) ||
                                  item.why_when.toLowerCase().includes(searchQuery);
            return matchesCategory && matchesSearch;
        });

        commandsCounter.textContent = `Показано: ${filteredData.length}`;

        if (filteredData.length === 0) {
            commandsContainer.innerHTML = `<div class="no-results">Команны не найдены по заданным критериям фильтрации или поиска.</div>`;
            return;
        }

        commandsContainer.innerHTML = '';
        filteredData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'command-card';
            card.id = `card-${item.id}`;

            const terminalStepsHtml = item.terminal_algorithm.map(step => `<li>${formatCodeInText(step)}</li>`).join('');
            const vscodeStepsHtml = item.vscode_algorithm.map(step => `<li>${formatCodeInText(step)}</li>`).join('');

            card.innerHTML = `
                <button class="card-trigger" aria-expanded="false">
                    <div class="card-summary-left">
                        <span class="command-string">${escapeHtml(item.command)}</span>
                        <span class="command-desc-short">${escapeHtml(item.description)}</span>
                    </div>
                    <div class="card-summary-right">
                        <span class="tag-category">${escapeHtml(item.category_ru)}</span>
                        <span class="arrow-icon">▼</span>
                    </div>
                </button>
                <div class="card-details-content">
                    <div class="detail-block">
                        <h4>💡 Суть команды</h4>
                        <p>${escapeHtml(item.description)}</p>
                    </div>
                    <div class="detail-block">
                        <h4>❓ Когда и Зачем это нужно</h4>
                        <p>${escapeHtml(item.why_when)}</p>
                    </div>
                    <div class="detail-block">
                        <h4>🛠️ Алгоритм использования в рабочих процессах</h4>
                        <div class="algorithm-box">
                            <div class="algo-sub-panel panel-terminal">
                                <h5>Через Консоль / Терминал</h5>
                                <ul class="algo-list">
                                    ${terminalStepsHtml}
                                </ul>
                            </div>
                            <div class="algo-sub-panel panel-vscode">
                                <h5>Через Интерфейс VS Code (Source Control)</h5>
                                <ul class="algo-list">
                                    ${vscodeStepsHtml}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const trigger = card.querySelector('.card-trigger');
            trigger.addEventListener('click', () => {
                const isExpanded = card.classList.contains('expanded');
                if (isExpanded) {
                    card.classList.remove('expanded');
                    trigger.setAttribute('aria-expanded', 'false');
                } else {
                    card.classList.add('expanded');
                    trigger.setAttribute('aria-expanded', 'true');
                }
            });

            commandsContainer.appendChild(card);
        });
    }

    function formatCodeInText(text) {
        return escapeHtml(text).replace(/`([^`]+)`/g, '<code>$1</code>');
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#039;');
    }

    filterButtonsContainer.addEventListener('click', (e) => {
        if (!e.target.classList.contains('filter-btn')) return;

        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        currentCategory = e.target.getAttribute('data-category');
        currentCategoryTitle.textContent = e.target.textContent;

        renderGlossary();
    });

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderGlossary();
    });
});
