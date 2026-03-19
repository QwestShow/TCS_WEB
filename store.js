async function loadCehaForStore() {

    try {
        const response = await fetch(`${pathBack}/api/Store/GetStoreStructure`);
        if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
        }
        CehaList = await response.json();
        LoadStoreList(CehaList);
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить данные');
    }
}

async function LoadStoreList(CehaList) {
    try{
        const storeListElement = document.getElementById('store-list');
        
        if (CehaList && Array.isArray(CehaList)) {
            // Сохраняем список в глобальной переменной для фильтрации
            window.allCehaList = CehaList;
            
            // Очищаем список
            storeListElement.innerHTML = '';
            
            // Добавляем каждый цех
            CehaList.forEach(item => {
                const li = document.createElement('li');
                li.className = 'store-item';
                
                // Сохраняем ID в data-атрибуте
                li.dataset.id = item.cehA_ID;
                
                // Отображаем только имя для пользователя
                li.textContent = item.cehA_NAME;
                
                storeListElement.appendChild(li);
            });
        }
        initializeStoreList();
    }
    catch (error){
        console.error('Ошибка:', error);
        alert('Не удалось загрузить данные');
    }
}

function initializeStoreList() {
    const searchInput = document.getElementById('search-Input');
    const storeList = document.getElementById('store-list');
    const storeButton = document.querySelector('.store-button');
    const storeContent = document.querySelector('.store-content');
    
    // 1. Фильтрация по поиску
    if (searchInput) {
        searchInput.addEventListener('input', filterStoreList);
    }
    
    // 2. Обработка кликов по элементам списка
    if (storeList) {
        storeList.addEventListener('click', handleStoreItemClick);
    }
    
    // 3. Закрытие выпадающего меню при клике вне его
    document.addEventListener('click', function(event) {
        if (!storeButton.contains(event.target) && !storeContent.contains(event.target)) {
            storeContent.style.display = 'none';
        }
    });
    
    // 4. Переключение видимости выпадающего меню
    if (storeButton) {
        storeButton.addEventListener('click', function(event) {
            event.stopPropagation();
            const isVisible = storeContent.style.display === 'block';
            storeContent.style.display = isVisible ? 'none' : 'block';
            
            // Фокус на поле поиска при открытии
            if (!isVisible && searchInput) {
                setTimeout(() => searchInput.focus(), 100);
            }
        });
    }
}
// Обработка выбора цеха
function handleStoreItemClick(event) {
    if (event.target.classList.contains('store-item')) {
        const item = event.target;
        const cehaId = item.dataset.id;
        const cehaName = item.textContent;
        
        // Убираем выделение у всех элементов
        document.querySelectorAll('.store-item').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Выделяем выбранный элемент
        item.classList.add('selected');
        
        // Обновляем текст кнопки на название выбранного цеха
        const storeButton = document.querySelector('.store-button');
        if (storeButton) {
            storeButton.textContent = cehaName;
            
            // Сохраняем ID в data-атрибут кнопки для последующего использования
            storeButton.dataset.selectedId = cehaId;
        }
        
        // Скрываем выпадающее меню
        const storeContent = document.querySelector('.store-content');
        if (storeContent) {
            storeContent.style.display = 'none';
        }

        SelectedCehaContentLoad(cehaId)
    }
}

async function SelectedCehaContentLoad(cehaId){
    try {
        const response = await fetch(`${pathBack}/api/Store/LoadWarehouseLeftovers?CEH_ID=${encodeURIComponent(cehaId)}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
        });

        if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
        }

        WarehouseLeftovers = await response.json();
        WarehouseLeftovers = WarehouseLeftovers.map(item => ({
            "Id": item.nmK_ID,
            "Тип": item.nmK_CLASSIF_TYPE_NOTE,
            "Обозначение": item.nmK_NOTE,
            "Наименование": item.nmK_NAME,
            "Остаток": item.blcehA_QUAN,
            "Свободный остаток": item.blcehA_QUAN_FREE,
            "Ед. изм": item.mesuR_NOTE,
        }));
        LoadWarehouseLeftovers(WarehouseLeftovers);
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить данные');
    }
}

async function LoadWarehouseLeftovers(WarehouseLeftovers) {
    const tbody = document.querySelector('#store-table-right tbody');
    tbody.innerHTML = '';
    WarehouseLeftovers.forEach(item => {
        let row = document.createElement('tr');
        row.innerHTML = `
            <td>${item["Id"]}</td>
            <td>${item["Тип"]}</td>
            <td>${item["Обозначение"]}</td>
            <td>${item["Наименование"]}</td>
            <td>${item["Остаток"]}</td>
            <td>${item["Свободный остаток"]}</td>
            <td>${item["Ед. изм"]}</td>
        `;
        tbody.appendChild(row);
    });
}

// Функция фильтрации списка
function filterStoreList(event) {
    const searchTerm = event.target.value.toLowerCase();
    const storeItems = document.querySelectorAll('.store-item');
    
    storeItems.forEach(item => {
        const itemText = item.textContent.toLowerCase();
        if (itemText.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}
// Обработка клика кнопок "Приход, Расход, Накладные"
function handleButtonAction(action) {
    
    // Здесь можно добавить логику для каждой кнопки
    switch(action) {
        case 'incoming':
            // Код для Прихода
            loadIncomingData();
            break;
        case 'outgoing':
            // Код для Расхода
            loadOutgoingData();
            break;
        case 'invoices':
            // Код для Накладных
            loadInvoicesData();
            break;
    }
}
// Функция для проверки количества строк и добавления скролла
function checkTableScroll() {
    const table = document.getElementById('store-table-right');
    const tbody = table.querySelector('tbody');
    const rowCount = tbody.querySelectorAll('tr').length;
    const container = table.closest('.table-container.right-table');
    
    if (rowCount > 50) {
        // Добавляем класс со скроллом
        if (!container.classList.contains('has-scroll')) {
            container.classList.add('has-scroll');
            
            // Добавляем стили
            const style = document.createElement('style');
            style.textContent = `
                .table-container.right-table.has-scroll table {
                    display: block;
                    max-height: 500px;
                    overflow-y: auto;
                }
                .table-container.right-table.has-scroll thead {
                    position: sticky;
                    top: 0;
                    background: white;
                    z-index: 10;
                }
            `;
            document.head.appendChild(style);
        }
    } else {
        container.classList.remove('has-scroll');
    }
}
document.addEventListener('DOMContentLoaded', () => {
    loadCehaForStore(); // Загружаем данные в выпадающий список цехов

    // Восстановить выбранный цех из localStorage, если есть
    const savedCeha = localStorage.getItem('selectedCeha');
    if (savedCeha) {
        try {
            const ceha = JSON.parse(savedCeha);
            const storeButton = document.querySelector('.store-button');
            if (storeButton && ceha.name) {
                storeButton.textContent = ceha.name;
                storeButton.dataset.selectedId = ceha.id;
            }
        } catch (e) {
            console.error('Ошибка восстановления цеха:', e);
        }
    }

    const buttons = document.querySelectorAll('#store-button-documents');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Убираем активный класс у всех кнопок
            buttons.forEach(btn => btn.classList.remove('active'));
            
            // Добавляем активный класс нажатой кнопке
            this.classList.add('active');
            
            // Можно выполнить разные действия в зависимости от кнопки
            const action = this.getAttribute('data-action');
            handleButtonAction(action);
        });
    });
});