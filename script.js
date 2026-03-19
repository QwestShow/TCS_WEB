const pathBack = "http://192.168.1.26:5000";

// Функция загрузки ПСП данных с сервера
async function loadPSPData() {
    try {
        const response = await fetch(`${pathBack}/api/psp`);
        if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
        }
        data = await response.json();

        // Преобразование данных к нужному формату (если необходимо)
        data = data.map(item => ({
            "Вид ПСП": item.type,
            "Обозначение": item.designation,
            "Наименование": item.name,
            "Классификатор": item.classifier,
            "Состояние": item.status,
            "Комментарий": item.comment,
            "Дата запуска": item.launchDate ? formatDate(item.launchDate) : '',
            "Дата выпуска": item.releaseDate ? formatDate(item.releaseDate) : '',
            "Используется в заказе": item.orderUsedIn
        }));

        fillPSPTable(data);
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить данные');
    }
}

async function loadNMKData(selectedValue , ForWhy) {
    const params = new URLSearchParams();
    selectedValue.forEach(item=>{params.append('NMK_CLASSIF_TYPE',item)})
    try {
        //const response = await fetch(${pathBack}/api/forms_4_6/GetNMK?NMK_CLASSIF_TYPE=${encodeURIComponent(params)});
        const response = await fetch(`${pathBack}/api/forms_4_6/GetNMK?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
        }
        dataNMK = await response.json();

        if(ForWhy==="Forms4And6")
        {
            open4and6formsModal(dataNMK);
        }
        else if(ForWhy==="AssemblyDownload")
        {
            openAssemblyDownloadModal(dataNMK);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить данные');
    }
}

// Функция загрузки ПСП данных с сервера
async function loadPlanData() {
    try {
        const response = await fetch(`${pathBack}/api/plan`);
        if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
        }
        data = await response.json();

        // Преобразование данных к нужному формату (если необходимо)
        data = data.map(item => ({
            "Номенклатура": item.nmkNote - item.nmkName,
            "№заказа/индекс": item.psp,
            "Кол-во": item.count,
            "н/ч на ед.": item.standPerUnit,
            "н/ч общее": item.standForAll,
            "Операция": item.operation,
            "Оборудование": item.equipment,
            "Исполнитель": item.worker
        }));

        fillTable(data);
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить данные');
    }
}

// Функция для форматирования даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Формат YYYY-MM-DD
}

// Заполнение таблицы ПСП данными
function fillPSPTable(data) {
    const tbody = document.querySelector('#psp-table tbody');
    tbody.innerHTML = '';
    data.forEach(item => {
        let row = document.createElement('tr');
        row.innerHTML = `
            <td>${item["Вид ПСП"]}</td>
            <td>${item["Обозначение"]}</td>
            <td>${item["Наименование"]}</td>
            <td>${item["Классификатор"]}</td>
            <td>${item["Состояние"]}</td>
            <td>${item["Комментарий"]}</td>
            <td>${item["Дата запуска"]}</td>
            <td>${item["Дата выпуска"]}</td>
            <td>${item["Используется в заказе"]}</td>
        `;
        tbody.appendChild(row);
    });
}

// Заполнение таблицы данными
function fillPlanTable(data) {
    const tbody = document.querySelector('#plan-table tbody');
    tbody.innerHTML = '';
    data.forEach(item => {
        let row = document.createElement('tr');
        row.innerHTML = `
            <td>${item["Номенклатура"]}</td>
            <td>${item["№заказа/индекс"]}</td>
            <td>${item["Кол-во"]}</td>
            <td>${item["н/ч на ед."]}</td>
            <td>${item["н/ч общее"]}</td>
            <td>${item["Операция"]}</td>
            <td>${item["Оборудование"]}</td>
            <td>${item["Исполнитель"]}</td>
        `;
        tbody.appendChild(row);
    });
}

function filterTable(tableId) {
    // Получаем значение из поля поиска
    let input = document.getElementById("tableFilter").value.toLowerCase();
    
    // Находим строки таблицы по её идентификатору
    let rows = document.querySelectorAll(`#${tableId} tbody tr`);

    rows.forEach(row => {
        let cells = row.getElementsByTagName('td');
        let showRow = false;

        for (let i = 0; i < cells.length; i++) {
            let cellText = cells[i].textContent.toLowerCase();
            if (cellText.includes(input)) {
                showRow = true;
                break;
            }
        }

        // Показываем или скрываем строку
        row.style.display = showRow ? "" : "none";
    });
}

function filterDate() {
    let dateInput = document.getElementById("dateFilter").value.trim().toLowerCase();
    let rows = document.querySelectorAll("#psp-table tbody tr"); 

    rows.forEach(row => {
        let cells = row.getElementsByTagName('td');
        let showRow = dateInput === ''; 

        if (dateInput) {
            let dateColumns = [6, 7]; 
            showRow = false; 
            
            for (let colIndex of dateColumns) {
                let cellText = cells[colIndex].textContent.trim().toLowerCase();
                if (cellText.includes(dateInput)) {
                    showRow = true;
                    break; 
                }
            }
        }

        row.style.display = showRow ? "" : "none";
    });
}

// Направление сортировки для каждой таблицы
let sortDirection = {
    'psp-table': Array(9).fill(true), // 9 столбцов в таблице psp-table
    'plan-table': Array(8).fill(true) // 8 столбцов в таблице plan-table
};

function sortTable(columnIndex, tableId) {

    // Клонируем данные для сортировки
    let sortedData = [...data];

    // Удаляем все значки сортировки
    document.querySelectorAll(`#${tableId} .sort-icon`).forEach(icon => {
        icon.classList.remove('asc', 'desc');
    });

    // Добавляем значок для текущего столбца
    const icon = document.querySelector(`#${tableId} th:nth-child(${columnIndex + 1}) .sort-icon`);
    icon.classList.add(sortDirection[tableId][columnIndex] ? 'desc' : 'asc');

    // Сортируем данные
    sortedData.sort((a, b) => {
        let valA = Object.values(a)[columnIndex];
        let valB = Object.values(b)[columnIndex];

        if (typeof valA === "number" && typeof valB === "number") {
            return sortDirection[tableId][columnIndex] ? valA - valB : valB - valA;
        } else if (valA instanceof Date && valB instanceof Date) {
            return sortDirection[tableId][columnIndex] ? valA - valB : valB - valA;
        } else {
            return sortDirection[tableId][columnIndex]
                ? valA.localeCompare(valB, "ru")
                : valB.localeCompare(valA, "ru");
        }
    });

    // Инвертируем направление сортировки
    sortDirection[tableId][columnIndex] = !sortDirection[tableId][columnIndex];

    // Заполняем таблицу отсортированными данными
    if (tableId === 'psp-table') {
        fillPSPTable(sortedData);
    } else if (tableId === 'plan-table') {
        fillPlanTable(sortedData);
    }
}

//АВТОРИЗАЦИЯ
document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('authForm');
    const togglePasswordButton = document.getElementById('togglePassword');
    const eyeIcon = document.getElementById('eyeIcon');
    const passwordInput = document.getElementById('password');

    // Переключение видимости пароля
    if (togglePasswordButton) {
        togglePasswordButton.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeIcon.src = 'images/eye-open.png';
            } else {
                passwordInput.type = 'password';
                eyeIcon.src = 'images/eye-closed.png';
            }
        });
    }

    // Проверка авторизации
    const token = localStorage.getItem('authToken');
    const currentPage = window.location.pathname;
    if (token && currentPage === '/auth.html') {
        // Если пользователь уже авторизован, перенаправляем его на защищенную страницу
        window.location.href = '/production.html';
    } else if (!token && currentPage !== '/auth.html') {
        // Если токена нет и пользователь пытается зайти на защищенную страницу
        window.location.href = '/auth.html';
    }

    // Авторизация
    if (authForm) {
        authForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const login = document.getElementById('login').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`${pathBack}/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ Login: login, Password: password })
                });

                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('authToken', data.token); // Сохраняем токен
                    window.location.href = '/index.html'; // Перенаправляем на защищенную страницу
                } else {
                    alert(data.message || 'Ошибка авторизации.');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert(error.message || 'Произошла ошибка при авторизации.');
            }
        });
    }

    // Обработка кнопки "Выход"
    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault(); // Предотвращаем переход по ссылке
            logout(); // Вызываем функцию выхода
        });
    }
});

// Функция выхода
function logout() {
    console.log("Выполняется выход из системы...");
    localStorage.removeItem('authToken'); // Удаляем токен
    console.log("Токен удален:", !localStorage.getItem('authToken'));
    window.location.href = '/auth.html'; // Перенаправляем на страницу авторизации
}

document.addEventListener('DOMContentLoaded', () => {
    // Получаем все ссылки в навигации
    const links = document.querySelectorAll('nav ul li a');

    // Получаем текущий путь страницы
    const currentPage = window.location.pathname.split('/').pop();

    // Проходим по всем ссылкам
    links.forEach(link => {
        // Получаем путь из href ссылки
        const linkPath = link.getAttribute('href').split('/').pop();

        // Если путь совпадает с текущей страницей, добавляем класс 'active'
        if (linkPath === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active'); // Удаляем класс для остальных ссылок
        }
    });
});

//закрывает модальное окно при нажатии за границу модального окна
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("generateZKV").addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("zkvModalOverlay").style.display = "block";
        document.getElementById("zkvModal").style.display = "block";
    });

    document.getElementById("zkvModalOverlay").addEventListener("click", function () {
        closeZKVModal();
        document.getElementById("zkvModalOverlay").style.display = "none";
        document.getElementById("zkvModal").style.display = "none";
    });

    // Открытие второго модального окна (Требование-накладная М11)
    document.getElementById('openRequirementModal').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('requirementModalOverlay').style.display = "block";
        document.getElementById('requirementModal').style.display = "block";
    });

    // Закрытие второго модального окна (Требование-накладная М11)
    document.getElementById('requirementModalOverlay').addEventListener('click', () => {
        document.getElementById('requirementModalOverlay').style.display = "none";
        document.getElementById('requirementModal').style.display = "none";
    });

    // Открытие модального окна (Формирование Формы 4 и 6)
    document.getElementById('generate4and6forms').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('4and6formsModalOverlay').style.display = "block";
        document.getElementById('4and6formsModal').style.display = "block";
    });

    // Закрытие модального окна (Формирование Формы 4 и 6)
    document.getElementById('4and6formsModalOverlay').addEventListener('click', () => {
        clear4and6formsModal();
        close4and6formsModal();
    });

    // Открытие модального выгрзки сборки
    document.getElementById('generateAssemblyDownload').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('AssemblyDownloadModalOverlay').style.display = "block";
        document.getElementById('AssemblyDownloadModal').style.display = "block";
    });

    // Закрытие модального окна выгрзки сборки
    document.getElementById('AssemblyDownloadModalOverlay').addEventListener('click', () => {
        clear4and6formsModal();
        close4and6formsModal();
    });
});

// Функция для открытия модального окна
function openZKVModal() {
    // Заполняем список доступных ПСП данными из массива `data`
    data.forEach(item => {
        const designation = item["Обозначение"]; // Обозначение
        const name = item["Наименование"]; // Наименование

        const option = document.createElement('option');
        option.value = designation; // Значение для отправки (например, "Обозначение")
        option.textContent = `${designation} - ${name}`; // Текст для отображения
        availablePSP.appendChild(option);
    });

    // Показываем модальное окно
    document.getElementById('zkvModalOverlay').classList.remove('hidden');
    document.getElementById('zkvModal').classList.remove('hidden');

    // Показываем модальное окно
    document.getElementById('requirementModalOverlay').classList.remove('hidden');
    document.getElementById('requirementModal').classList.remove('hidden');
}

// Заполнение выпадающего списка
function fillDropdown(dropdownId, placeholderText) {
    const dropdown = document.getElementById(dropdownId);
    dropdown.innerHTML = `<option value="" disabled selected>${placeholderText}</option>`;

    data.forEach(item => {
        const option = document.createElement("option");
        option.value = item["Обозначение"];
        option.textContent = `${item["Обозначение"]} - ${item["Наименование"]}`;
        dropdown.appendChild(option);
    });
}

// Загрузка списка цехов
async function loadCehList() {
    try {
        const response = await fetch(`${pathBack}/api/psp/ceh`);
        if (!response.ok) {
            throw new Error(`Ошибка загрузки цехов: ${response.status}`);
        }

        let data = await response.json();

        // Если данные внутри поля "data", используем их
        if (data && data.data) {
            data = data.data;
        }

        // Проверяем, является ли результат массивом
        if (!Array.isArray(data)) {
            console.warn("Данные цехов не являются массивом", data);
            return [];
        }

        // Фильтруем null, undefined, пустые строки и дубликаты
        const filtered = data
            .filter(item => typeof item === 'string' && item.trim() !== '') // оставляем только непустые строки
            .filter((item, index, self) => self.indexOf(item) === index);  // убираем дубликаты

        // Возвращаем данные в нужном формате для fillDropdownForCeh
        return filtered.map(name => ({ "Наименование": name }));

    } catch (error) {
        console.error('Не удалось загрузить список цехов:', error);
        alert('Произошла ошибка при загрузке списка цехов.');
        return [];
    }
}

// Заполнение выпадающего списка
async function fillDropdownForCeh(dropdownId, placeholderText) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) {
        console.error(`Элемент с ID "${dropdownId}" не найден.`);
        return;
    }

    // Очищаем список и добавляем плейсхолдер
    dropdown.innerHTML = `<option value="" disabled selected>${placeholderText}</option>`;

    // Получаем список цехов
    const cehList = await loadCehList();

    // Проверяем, является ли результат массивом
    if (!Array.isArray(cehList)) {
        console.warn("Полученные данные не являются массивом", cehList);
        return;
    }

    // Заполняем выпадающий список
    cehList.forEach(ceh => {
        const option = document.createElement("option");
        option.value = ceh["Наименование"]; 
        option.textContent = ceh["Наименование"];
        dropdown.appendChild(option);
    });
}

async function openRequirementModal(){
    // Загружаем данные (если они еще не загружены)
    if (!data.length) loadPSPData();

    // Заполняем выпадающий список
    fillDropdown("pspFilter", "Выберите ПСП...");
    await fillDropdownForCeh("departmentFilter","Выберите подразделение...");
    
    // Только после этого инициализируем TomSelect
    if (!document.getElementById('pspFilter').tomselect) {
        new TomSelect('#pspFilter', {
            create: false,
            sortField: { field: "text", direction: "asc" },
            placeholder: 'Выберите ПСП...'
        });
    }   
    if (!document.getElementById('departmentFilter').tomselect) {
        new TomSelect('#departmentFilter', {
            create: false,
            sortField: { field: "text", direction: "asc" },
            placeholder: 'Выберите подразделение...'
        });
    }
    
    // Показываем модальное окно
    document.getElementById('requirementModalOverlay').classList.remove('hidden');
    document.getElementById('requirementModal').classList.remove('hidden');
}

//#region Выгрузка сборки
async function openAssemblyDownloadModal(data){
    const Nomencl_4And6 = document.getElementById('Nomencl_AssemblyDownload');
    // Загружаем данные (если они еще не загружены)
    if (!data.length) loadNMKData();
        data.forEach(item => {
            const option = document.createElement("option");
            option.value = item.nmK_ID;
            option.textContent = item.nmkNameDesigntaion;
            Nomencl_4And6.appendChild(option);
        });
    // Показываем модальное окно
    const dd = document.getElementById('AssemblyDownloadModalOverlay');
    document.getElementById('AssemblyDownloadModalOverlay').classList.remove('hidden');
    const ddnew = document.getElementById('AssemblyDownloadModalOverlay');
    document.getElementById('AssemblyDownloadModal').classList.remove('hidden');
}

// Обработка кнопки "Отмена"
document.getElementById("cancelAssemblyDownloadButton").addEventListener("click", function () {
    clearAssemblyDownloadModal();
    closeAssemblyDownloadModal();
});

// Функция для закрытия модального окна
function closeAssemblyDownloadModal() {
    document.getElementById("AssemblyDownloadModalOverlay").style.display = "none";
    document.getElementById("AssemblyDownloadModal").style.display = "none";
    document.getElementById('AssemblyDownloadModalOverlay').classList.add('hidden');
    document.getElementById('AssemblyDownloadModal').classList.add('hidden');
}

function clearAssemblyDownloadModal() {
    // Очищаем выпадающий список ПСП
    const Nomencl_4And6 = document.getElementById('Nomencl_AssemblyDownload');
    document.getElementById('AssemblyNMKFilter').value = '';
    // Очищаем списки данных 
    Nomencl_4And6.options.length = 0;
    document.getElementById("requirementModalOverlay").style.display = "none";
    document.getElementById("AssemblyDownloadModal").style.display = "none";
    document.getElementById('requirementModalOverlay').classList.add('hidden');
    document.getElementById('AssemblyDownloadModal').classList.add('hidden');
}

// Обработка кнопки "Сформировать"
document.getElementById("generateAssemblyDownloadButton").addEventListener("click", async function () {
    try {
        // Получаем выбранную ПСП
        const pspSelect = document.getElementById("Nomencl_AssemblyDownload");
        const selectedPSP = pspSelect.value;

        if (!selectedPSP) {
            alert("Выберите Номенклатуру для формирования документов.");
            return;
        }

        fetch(`${pathBack}/api/UnloadingTheAssembly/Post`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nmklist: selectedPSP
            })
          })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            return response.blob();
        })
        .then(blob => {
            // Создаем ссылку для скачивания файла
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Выгрузка сборки для ID ${selectedPSP} от ${new Date().toISOString().slice(0, 10)}.xlsx`; // Имя файла
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url); // Освобождаем объект URL
            alert("Отчет успешно сформирован!");
        })
        .catch(error => {
            console.error("Ошибка:", error);
            alert("Произошла ошибка при отправке данных.");
        });
    
        // Закрываем модальное окно
        clear4and6formsModal();
        close4and6formsModal();
    } catch (error) {
        console.error("Ошибка:", error);
        alert("Произошла ошибка при формировании документов.");
    }
});
//#endregion Выгрузка сборки

async function open4and6formsModal(data){
    const Nomencl_4And6 = document.getElementById('Nomencl_4And6');
    // Загружаем данные (если они еще не загружены)
    if (!data.length) loadNMKData();
        data.forEach(item => {
            const option = document.createElement("option");
            option.value = item.nmK_ID;
            option.textContent = item.nmkNameDesigntaion;
            Nomencl_4And6.appendChild(option);
        });
    // Показываем модальное окно
    document.getElementById('4and6formsModalOverlay').classList.remove('hidden');
    document.getElementById('4and6formsModal').classList.remove('hidden');
}

function clear4and6formsModal() {
    // Очищаем выпадающий список ПСП
    const Nomencl_4And6 = document.getElementById('Nomencl_4And6');
    document.getElementById('NMKFilter').value = '';
    // Очищаем списки данных 
    Nomencl_4And6.options.length = 0;
    document.getElementById("4and6formsModalOverlay").style.display = "none";
    document.getElementById("4and6formsModal").style.display = "none";
    document.getElementById('4and6formsModalOverlay').classList.add('hidden');
    document.getElementById('4and6formsModal').classList.add('hidden');
}

// Обработка кнопки "Отмена"
document.getElementById("cancel4and6forms").addEventListener("click", function () {
    clear4and6formsModal();
    close4and6formsModal();
});

// Функция для закрытия модального окна
function close4and6formsModal() {
    document.getElementById("4and6formsModalOverlay").style.display = "none";
    document.getElementById("4and6formsModal").style.display = "none";
    document.getElementById('4and6formsModalOverlay').classList.add('hidden');
    document.getElementById('4and6formsModal').classList.add('hidden');
}

// Обработка кнопки "Сформировать"
document.getElementById("generate4and6formsButton").addEventListener("click", async function () {
    try {
        // Получаем выбранную ПСП
        const pspSelect = document.getElementById("Nomencl_4And6");
        const selectedPSP = pspSelect.value;

        if (!selectedPSP) {
            alert("Выберите Номенклатуру для формирования документов.");
            return;
        }

        fetch(`${pathBack}/api/forms_4_6/Post`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nmklist: selectedPSP
            })
          })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            return response.blob();
        })
        .then(blob => {
            // Создаем ссылку для скачивания файла
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Формы 4 и 6 для ${selectedPSP} от ${new Date().toISOString().slice(0, 10)}.xlsx`; // Имя файла
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url); // Освобождаем объект URL
            alert("Отчет успешно сформирован!");
        })
        .catch(error => {
            console.error("Ошибка:", error);
            alert("Произошла ошибка при отправке данных.");
        });
    
        // Закрываем модальное окно
        clear4and6formsModal();
        close4and6formsModal();
    } catch (error) {
        console.error("Ошибка:", error);
        alert("Произошла ошибка при формировании документов.");
    }
});

function openAssignmentOfWorksAndEquupmentModal(){
    document.getElementById('assignmentOfWorksAndEquupmentModalOverlay').classList.remove('hidden');
    document.getElementById('assignmentOfWorksAndEquupmentModal').classList.remove('hidden');
}


const radioButtons = document.querySelectorAll('input[name="fullType"]');

// Добавляем обработчик изменения состояния радиокнопок
radioButtons.forEach(radio => {
    radio.addEventListener('change', function () {
        const selectedResourceType = this.value; // Значение выбранной радиокнопки

        // Перебираем все строки таблицы
        const rows = document.querySelectorAll("#selectedPSPTable tbody tr");
        rows.forEach(row => {
            const inputField = row.querySelector('input'); // Поле ввода в столбце "ДОБАВЛЕНО В ДОКУМЕНТ"
            const required = parseFloat(row.cells[3].textContent); // Значение из столбца "Требуется"
            const deficit = parseFloat(row.cells[5].textContent); // Значение из столбца "Дефицит"

            if (selectedResourceType === 'purchased') {
                // Если выбрано "По потребности", подставляем значение "Требуется"
                inputField.value = required;
            } else if (selectedResourceType === 'purchasedAndSTD') {
                // Если выбрано "По дефициту", подставляем значение "Дефицит"
                inputField.value = deficit;
            } else {
                // Если выбрано "Вручную", очищаем поле ввода
                inputField.value = '';
            }

            // Проверяем, нужно ли подсветить строку
            const value = parseFloat(inputField.value);
            if (value > 0) {
                row.style.backgroundColor = '#ffffcc'; // Подсветка бледно-желтым
            } else {
                row.style.backgroundColor = ''; // Сброс подсветки
            }
        });
    });
});

document.getElementById('pspFilter').addEventListener('change', function () {
    const selectedValue = this.value; // Получаем выбранное значение
    if (!selectedValue) return;

    // Очищаем таблицу перед добавлением новых данных
    const tableBody = document.querySelector("#selectedPSPTable tbody");
    tableBody.innerHTML = "";

    // Отправляем запрос на сервер
    fetch(`${pathBack}/api/ZKV/GetPSPData?pspList=${encodeURIComponent(selectedValue)}&resourceType=all`)
        .then(response => {
            if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (data.length === 0) {
                alert("Данные для выбранной ПСП не найдены.");
                return;
            }

            // Получаем текущее значение выбранной радиокнопки
            const selectedResourceType = document.querySelector('input[name="fullType"]:checked').value;

            // Заполняем таблицу данными
            data.forEach(item => {
                const row = document.createElement('tr');

                // Создаем ячейку с полем ввода для столбца "ДОБАВЛЕНО В ДОКУМЕНТ"
                const inputCell = document.createElement('td');
                const inputField = document.createElement('input');
                inputField.type = 'number';
                inputField.min = '0'; // Минимальное значение 0
                inputField.style.width = '180px'; // Устанавливаем ширину поля ввода

                // Устанавливаем значение в зависимости от выбранной радиокнопки
                if (selectedResourceType === 'purchased') {
                    inputField.value = item.general; // Значение "Требуется"
                } else if (selectedResourceType === 'purchasedAndSTD') {
                    inputField.value = item.default; // Значение "Дефицит"
                } else {
                    inputField.value = ''; // Очищаем поле ввода
                }

                // Добавляем обработчик изменения значения
                inputField.addEventListener('input', function () {
                    const value = parseFloat(this.value);
                    if (value > 0) {
                        row.style.backgroundColor = '#ffffcc'; // Подсветка бледно-желтым
                    } else {
                        row.style.backgroundColor = ''; // Сброс подсветки
                    }
                });

                inputCell.appendChild(inputField);

                // Заполняем остальные ячейки
                row.innerHTML = `
                    <td>${item.designation}</td>
                    <td>${item.name}</td>
                    <td>${item.unitsOFMeasurement}</td>
                    <td>${item.general}</td>
                    <td>${item.remainingStock}</td>
                    <td>${item.default}</td>
                `;

                // Добавляем ячейку с полем ввода
                row.appendChild(inputCell);
                tableBody.appendChild(row);
            });

            console.log("Данные успешно загружены:", data);
        })
        .catch(error => {
            console.error("Ошибка:", error);
            alert("Произошла ошибка при получении данных.");
        });
});

// Функция для фильтрации номенклатур (Форма 4 и 6)
function filterAvailableForm4_6() {
    const searchText = document.getElementById("NMKFilter").value.toLowerCase();
    const options = document.querySelectorAll("#Nomencl_4And6 option");

    options.forEach(option => {
        const text = option.textContent.toLowerCase();
        option.style.display = text.includes(searchText) ? "" : "none";
    });
}

// Функция для фильтрации номенклатур (Выгрузка сборки)
function AssemblyDownloadModalFilter() {
    const searchText = document.getElementById("AssemblyNMKFilter").value.toLowerCase();
    const options = document.querySelectorAll("#Nomencl_AssemblyDownload option");

    options.forEach(option => {
        const text = option.textContent.toLowerCase();
        option.style.display = text.includes(searchText) ? "" : "none";
    });
}


// Функция для фильтрации доступных ПСП
function filterAvailablePSP() {
    const searchText = document.getElementById("availablePSPFilter").value.toLowerCase();
    const options = document.querySelectorAll("#availablePSP option");

    options.forEach(option => {
        const text = option.textContent.toLowerCase();
        option.style.display = text.includes(searchText) ? "" : "none";
    });
}

// Функция для фильтрации выбранных ПСП
function filterSelectedPSP() {
    const searchText = document.getElementById("selectedPSPFilter").value.toLowerCase();
    const options = document.querySelectorAll("#selectedPSP option");

    options.forEach(option => {
        const text = option.textContent.toLowerCase();
        option.style.display = text.includes(searchText) ? "" : "none";
    });
}

// Функция для перемещения выбранных элементов между списками
function moveSelected(fromId, toId) {
    const fromList = document.getElementById(fromId);
    const toList = document.getElementById(toId);

    // Перебираем только выбранные и видимые элементы
    Array.from(fromList.selectedOptions)
        .filter(option => option.style.display !== "none") // Учитываем только видимые элементы
        .forEach(option => {
            toList.appendChild(option); // Перемещаем элемент
        });
}

// Функция для перемещения всех видимых элементов между списками
function moveAll(fromId, toId) {
    const fromList = document.getElementById(fromId);
    const toList = document.getElementById(toId);

    // Перебираем все видимые элементы
    Array.from(fromList.options)
        .filter(option => option.style.display !== "none") // Учитываем только видимые элементы
        .forEach(option => {
            toList.appendChild(option); // Перемещаем элемент
        });
}

// Обработка кнопки "Отмена"
document.getElementById("cancelZKV").addEventListener("click", function() {
    console.log("Кнопка 'Отмена' нажата");
    closeZKVModal();
});

// Функция для закрытия модального окна
function closeZKVModal() {
    const availablePSP = document.getElementById('availablePSP');
    const selectedPSP = document.getElementById('selectedPSP');
    document.getElementById('selectedPSPFilter').value = '';
    document.getElementById('availablePSPFilter').value = '';
    document.getElementById('order').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('index').value = '';
    // Очищаем списки данных 
    availablePSP.options.length = 0;
    selectedPSP.options.length = 0;
    document.getElementById("zkvModalOverlay").style.display = "none";
    document.getElementById("zkvModal").style.display = "none";
    document.getElementById('zkvModalOverlay').classList.add('hidden');
    document.getElementById('zkvModal').classList.add('hidden');
}

/*ДЛЯ ДОКУМЕНТА ТМЦ*/
// Функция для очистки модального окна
function clearRequirementModal() {
    // Очищаем выпадающий список ПСП
    const pspFilter = document.getElementById("pspFilter");
    pspFilter.innerHTML = '<option value="" disabled selected>Выберите ПСП...</option>';

    // Очищаем таблицу
    const tableBody = document.querySelector("#selectedPSPTable tbody");
    tableBody.innerHTML = "";

    // Сбрасываем радиокнопки в первоначальное состояние
    document.querySelector('input[name="fullType"][value="all"]').checked = true;
    document.querySelector('input[name="resourceType"][value="all"]').checked = true;
}

// Функция для закрытия модального окна
function closeRequirementModal() {
    document.getElementById("requirementModalOverlay").classList.add("hidden");
    document.getElementById("requirementModal").classList.add("hidden");
}

// Обработчик для кнопки "Отмена"
document.getElementById("cancel").addEventListener("click", function () {
    clearRequirementModal();
    closeRequirementModal();
});

// Закрытие модального окна при клике на оверлей
document.getElementById("requirementModalOverlay").addEventListener("click", function () {
    clearRequirementModal(); // Очищаем модальное окно
    closeRequirementModal(); // Закрываем модальное окно
});

// Обработка кнопки "Сформировать"
document.getElementById("generateZKVButton").addEventListener("click", function () {
    // Собираем данные из формы
    const selectedPSP = Array.from(document.getElementById("selectedPSP").options).map(option => option.value);
    const resourceType = document.querySelector('input[name="resourceType"]:checked').value;
    //const order = document.getElementById("orderField").value;
    //const product = document.getElementById("productField").value;
    let quantity = document.getElementById("quantity").value;

    // Проверяем, выбраны ли ПСП
    if (selectedPSP.length === 0) {
        alert("Выберите хотя бы одну ПСП для формирования документа.");
        return;
    }

    if (quantity === '') {
        quantity = 1;
    }

    // Отправляем данные на сервер через AJAX
    fetch(`${pathBack}/api/ZKV/Post`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            pspList: selectedPSP,
            resourceType: resourceType,
            //order: order,
            //product: product,
            Quantity: quantity
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        return response.blob();
    })
    .then(blob => {
        // Создаем ссылку для скачивания файла
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ОтчетЗКВ_${new Date().toISOString().slice(0, 10)}.xlsx`; // Имя файла
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url); // Освобождаем объект URL
        alert("Отчет успешно сформирован!");
    })
    .catch(error => {
        console.error("Ошибка:", error);
        alert("Произошла ошибка при отправке данных.");
    });

    // Закрываем модальное окно
    //closeModal();
});

// Загрузка данных при загрузке страницы 
document.addEventListener('DOMContentLoaded', () => {
    loadPSPData(); // Загружаем данные в таблицу
    document.getElementById("generateZKV").addEventListener("click", function (e) {
        e.preventDefault(); // Предотвращаем переход по ссылке
        openZKVModal(); // Открываем модальное окно
    });

    document.getElementById("openRequirementModal").addEventListener("click", function () {
        openRequirementModal();
    });

    document.getElementById("generate4and6forms").addEventListener("click", function () {
        const NMK_CLASSIF_TYPE = [26];
        loadNMKData(NMK_CLASSIF_TYPE, "Forms4And6");
        //open4and6formsModal();
    });

    document.getElementById("generateAssemblyDownload").addEventListener("click", function () {
        const NMK_CLASSIF_TYPE = [26];
        loadNMKData(NMK_CLASSIF_TYPE, "AssemblyDownload");
        //open4and6formsModal();
    });
});

// Обработчики событий
document.addEventListener('DOMContentLoaded', () => {
    //loadPlanData();

    // Открытие модального окна
    document.getElementById('openAssignmentOfWorksAndEquupmentModal').addEventListener("click", function () {
        openAssignmentOfWorksAndEquupmentModal();
    });


});