// #region Глобальные переменные
let CehListData; // список со всеми цехами, заполняется при вызове функции loadCehList_SE
let Operation_PSP_SE; // список со всеми ПСП и операциями по конкретному цеху и номенклатуре, заполняется при вызове функции loadOperation_SE
let allChecked = false;
//let optionCompositionPSP; //Значение внутри тега option для списка состава ПСп
//#endregion

// #region События при изменении данных
document.getElementById("sectorFilter_SE").addEventListener("change", function () { // при выборе участка прогружать данные в поле для номенклатур
    loadNMK_SE()
    });

document.getElementById('Workbench_SE').addEventListener('change', function () {
    const tbody = document.querySelector('#TableOperation_SE tbody');
    const selectedNMK_SE = document.getElementById("Workbench_SE");

    if (tbody.innerHTML !== '')
    {
        ColorRow();
    }
    else {
        alert("Выберите ПСп!");
        selectedNMK_SE.value = "";
    }
});

document.getElementById('Worker_SE').addEventListener('change', function () {
    const tbody = document.querySelector('#TableOperation_SE tbody');
    const selectedWorker_SE = document.getElementById("Worker_SE");

    if (tbody.innerHTML === '')
    {
        alert("Выберите ПСп!");
        selectedWorker_SE.value = "";
    }
});

document.getElementById("cehFilter_SE").addEventListener("change", function () {
            fillDropdownSectorFilter_SE("cehFilter_SE","sectorFilter_SE","Выберите участок...",CehListData)
            loadNMK_SE();
            });
//

// Открытие/закрытие модальных окон
document.addEventListener('DOMContentLoaded', () => {
    //// Выбор номенклатуры
    // Закрытие модального окна (Назначить рабочих и оборудование на операции) (по нажатию вне модального окна)
    document.getElementById('assignmentOfWorksAndEquupmentModalOverlay').addEventListener('click', () => {
        QuestionOpenForms_SE ();
    });
    // Закрытие модального окна (Назначить рабочих и оборудование на операции) (по нажатию на кнопку "Отмена")
    document.getElementById('cancel_NMK_SE').addEventListener('click', () => {
        clearAssignmentOfWorksAndEquupmentModal();
    });
    /*document.getElementById("sortTable(0, 'TableOperation_SE')").addEventListener('click', () => {
        alert("VBIG!");
    });*/
    // Открытие модального окна (Назначить рабочих и оборудование на операции)
    document.getElementById('openAssignmentOfWorksAndEquupmentModalButton').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('assignmentOfWorksAndEquupmentModalOverlay').style.display = "block";
        document.getElementById('assignmentOfWorksAndEquupmentModal').style.display = "block";
    });
    //// Выбор операции
    // Закрытие модального окна (Назначить рабочих и оборудование на операции) (по нажатию на кнопку "Отмена")
    document.getElementById('cancel_Operation_SE').addEventListener('click', () => {
        clearOperation_SE();
        clearWorker_SE();
        clearWorkbench_SE();
        document.getElementById('assignmentOfWorksAndEquupmentModal').style.display = "block";
        document.getElementById("OperationsOnEquipmentEquupmentModal").style.display = "none";
    });
    // Переход в модальное окно "Выбор ПСп операции" (Назначить рабочих и оборудование на операции)
    document.getElementById('continue_NMK_SE').addEventListener('click', () => {
        const selectedNMK_SE = document.getElementById("NMK_SE");
        const selectedCount = selectedNMK_SE.selectedOptions.length;

        if (selectedCount === 0 || selectedCount > 1) {
            alert("Выберите номенклатуру");
            return;
        }

        loadOperation_SE();
        document.getElementById('OperationsOnEquipmentEquupmentModal').style.display = "block";
        document.getElementById("assignmentOfWorksAndEquupmentModal").style.display = "none";
    });

    document.getElementById('PSP_SE_Oper').addEventListener('click', (e) => { // при нажатии на список ПСп обновлять таблицу с операциями (Назначить рабочих и оборудование на операции)
        e.preventDefault();
        const select = document.querySelector('#PSP_SE_Oper');
        const selectedWB_SE = document.getElementById("Workbench_SE");
        const selectedWorkers_SE = document.getElementById("Worker_SE");
        const selectedValues = Array.from(select.selectedOptions).map(option => option.value);
        fillTableOperation(Operation_PSP_SE,selectedValues);
        selectedWB_SE.value = "";
        selectedWorkers_SE.value = "";
    });

    document.getElementById("load_Workers_and_Workbench").addEventListener("click", (e) => { // событие на нажатие кнопки "Записать" (Назначить рабочих и оборудование на операции)
    e.preventDefault();

    let ProvWorker = false;
    let ProvWorkbench = false;
    let CountWorkbenchFalse = 0;

    const WorkbenchSelect = document.getElementById('Workbench_SE').value;
    const WorkerSelect = document.getElementById('Worker_SE').value;
    const checkbox_true = document.querySelectorAll('#TableOperation_SE .rowCheckbox:checked');

    if (checkbox_true.length > 0) {
        if ((WorkbenchSelect == '') && (WorkerSelect == '')){
            alert("Выберите работника и/или оборудование!");
            return;
        }
        checkbox_true.forEach((row) => {
            let ProvWorkbenchTrue = true;
            if (WorkbenchSelect != ''){
                if (row.dataset.workbanch_add_true === "true"){
                    UpdateOrders(false,row);
                    ProvWorkbench = true;
                }
                else {
                    ProvWorkbenchTrue = false;
                    CountWorkbenchFalse = Number(CountWorkbenchFalse) + Number(1);
                }
            }
            if (ProvWorkbenchTrue === true){
                if (WorkerSelect != ''){
                    const rowParent = row.closest('tr');
                    const cells = rowParent.querySelectorAll('td');
                    const FIOCell = cells[8].textContent; // проверяет данные в ячейке с ФИО
                    if (FIOCell === '(не назначено)'){
                         InsertWorker(row);
                    }
                    else {
                         DeleteWorkersForOperation(row);
                         InsertWorker(row);
                    }
                    ProvWorker = true;
                };
            }
        });
        if (Number(CountWorkbenchFalse) > 0){alert ("На те операции, где привязано иное оборудование назначение не пройдено!");}
        if (ProvWorker == true && ProvWorkbench == false){alert ("Работник назначен!");}
        if (ProvWorker == false && ProvWorkbench == true){alert ("Оборудование назначено!");}
        if (ProvWorker == true && ProvWorkbench == true){alert ("Работник и оборудование назначены!");}
        document.getElementById('OperationsOnEquipmentEquupmentModal').style.display = "block";
        document.getElementById("assignmentOfWorksAndEquupmentModal").style.display = "none";
        setTimeout(() => { // КОСТЫЛЬ! Для того, чтобы форма вывода обновлялась ПОСЛЕ добавления данных 
            loadOperation_SE();
          }, 1);
    }
    else {alert("Выберите хотя бы одну операцию!");}     
    });

    document.getElementById("delete_Workers_SE").addEventListener("click", (e) => { // событие на нажатие кнопки "Отменить" (Назначить рабочих и оборудование на операции)
        e.preventDefault();
        const checkbox_true = document.querySelectorAll('#TableOperation_SE .rowCheckbox:checked');
        if (checkbox_true.length > 0) {
            checkbox_true.forEach((item)=>{
                DeleteWorkersForOperation(item);
                UpdateOrders(true,item);
            })
            alert ("Работник и/или оборудование откреплены!");
            document.getElementById('OperationsOnEquipmentEquupmentModal').style.display = "block";
            document.getElementById("assignmentOfWorksAndEquupmentModal").style.display = "none";
            setTimeout(() => { // КОСТЫЛЬ! Для того, чтобы форма вывода обновлялась ПОСЛЕ добавления данных 
                loadOperation_SE();
            }, 1);
        }

    else {alert("Выберите хотя бы одну операцию!");}
    });


    //#region Модальные окна Сформировать сменно-суточное задание
    // Открытие модального окна (Сформировать сменно-суточное задание)
    document.getElementById('openFormationOfShiftDailyAssignmentsButton').addEventListener('click', (e)=>{
        e.preventDefault();
        document.getElementById('formationOfShiftDailyAssignmentsOverlay').style.display = "block";
        document.getElementById('formationOfShiftDailyAssignments').style.display = "block";
    });

    // Закрытие модального окна (Сформировать сменно-суточное задание) (по нажатию вне модального окна)
    document.getElementById('formationOfShiftDailyAssignmentsOverlay').addEventListener('click', () => {
        QuestionOpenFormsShiftDaily();
    });

    // Закрытие модального окна (Выбор состава ПСп) (по нажатию вне модального окна)
    document.getElementById('compositionPSPAndBatchesOverlay').addEventListener('click', () =>{
        closeCompositionPSPAndParty();
        clearPSP();        
    });

    // Закрытие модального окна (Выбор заказов) (по нажатию вне модального окна)
    document.getElementById('orderPSPOverlay').addEventListener('click', () =>{
        clearOrderList();   
        clearPSP();
        closeCompositionPSPAndParty();    
    });

    // Закрытие модального окна (Сформировать сменно-суточное задание) (по нажатию на кнопку "Отмена")
    document.getElementById('cancel_PSP_SE').addEventListener('click', () => {
        clearPSP();
    });
    
    // Возврат к выбору ПСп (по нажатию на кнопку "Назад")
    document.getElementById('back_PSP_Party').addEventListener('click', () => {
        clearPSP();
        closeCompositionPSPAndParty();
        loadPSP_SE();
        document.getElementById('compositionPSPAndBatchesOverlay').style.display = "none";
        document.getElementById('compositionPSPAndBatches').style.display = "none";
        document.getElementById('formationOfShiftDailyAssignmentsOverlay').style.display = "block";
        document.getElementById('formationOfShiftDailyAssignments').style.display = "block";        
    });

    // Возврат к выбору состава ПСп (по нажатию на кнопку "Назад")
    document.getElementById('back_order').addEventListener('click', () => {
        document.getElementById('orderPSPOverlay').style.display = "none";
        document.getElementById('orderPSP').style.display = "none";
        document.getElementById('compositionPSPAndBatchesOverlay').style.display = "block";
        document.getElementById('compositionPSPAndBatches').style.display = "block";        
    });
    //#endregion
});



// Загрузка данных при загрузке страницы 
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("openAssignmentOfWorksAndEquupmentModalButton").addEventListener("click", function () {
        fillDropdownCeha_SE("cehFilter_SE","Выберите цех..."); // заполнение списка цехов
    });
});

//#region Назначить рабочих и оборудование на операции
function QuestionOpenForms_SE (){ // функция закрывает форму (Назначить рабочих и оборудование на операции), при нажатии за границу модального окна
    if (document.getElementById("assignmentOfWorksAndEquupmentModal").style.display !== "block") {
        const result = confirm("Выбранные Вами данные могут быть потеряны!\nВы действительно хотите закрыть окно?");
        if (result) {
            clearAssignmentOfWorksAndEquupmentModal();
        } else {
            return;
        }
    }
    else {
        clearAssignmentOfWorksAndEquupmentModal();
    } 
}

//#region Выберите участок и номенклатуру

async function FillNMK_SE(data){ // наполнение данными поля "Номенклатуры"
    if (!data.length) loadNMK_SE();

    data.forEach(item => {
        const option = document.createElement("option");
        option.value = item.nmK_ID;
        option.textContent = item.nmkNameDesigntaion;
        NMK_SE.appendChild(option);
    });
    NMK_SE.value = 0;
}

async function loadNMK_SE() { // загрузка номенклатур на основании выбранных ранее цехов
    const selectedNMK_SE = document.getElementById("sectorFilter_SE");
    const values = selectedNMK_SE.value;

    clearNMK_SE();
    // Отправляем данные на сервер через AJAX
    fetch(`${pathBack}/api/AssigOfWorksAndEquup/nmk_se`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            CEH_ID: values
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data == null || (typeof data === 'object' && Object.keys(data).length === 0)) {
            alert('На данном участке нет операций по данной номенклатуре');
            return;}
            FillNMK_SE(data)
    })
    .catch(error => {
        console.error("Ошибка:", error);
        document.getElementById("LoadingModalOverlay").style.display = "none";
        document.getElementById("LoadingModal").style.display = "none";
        alert("Произошла ошибка при отправке данных.");
    });
}

function clearAssignmentOfWorksAndEquupmentModal() {
    clearNMK_SE_All();
    clearOperation_SE();
    clearWorker_SE();
    document.getElementById("OperationsOnEquipmentEquupmentModal").style.display = "none";
    document.getElementById("assignmentOfWorksAndEquupmentModalOverlay").style.display = "none";
    document.getElementById("assignmentOfWorksAndEquupmentModal").style.display = "none";
}

async function loadCehList_SE() {
    try {
        const response = await fetch(`${pathBack}/api/ceha_se/get_ceha_se`);
        if (!response.ok) {
            throw new Error(`Ошибка загрузки цехов: ${response.status}`);
        }

        CehListData = await response.json();

        // Если данные внутри поля "data", используем их
        if (CehListData && CehListData.data) {
            CehListData = CehListData.data;
        }

        // Проверяем, является ли результат массивом
        if (!Array.isArray(CehListData)) {
            console.warn("Данные цехов не являются массивом", CehListData);
            return [];
        }
        // Группируем полученные данные для вывода списка цехов
        const groupedData = CehListData.reduce((acc, item) => {
            if (!acc[item.cehNumber]) {
              acc[item.cehNumber] = [];
            }
            acc[item.cehNumber].push(item);
            return acc;
          }, {});

        return Object.keys(groupedData).map(cehNumber => ({
            "№ цеха": cehNumber
          }));

    } catch (error) {
        console.error('Не удалось загрузить список цехов:', error);
        alert('Произошла ошибка при загрузке списка цехов.');
        return [];
    }
}

async function fillDropdownCeha_SE(dropdownId, placeholderText) {
    
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) {
        console.error(`Элемент с "${dropdownId}" не найден.`);
        return;
    }

    // Очищаем список и добавляем плейсхолдер
    dropdown.innerHTML = `<option value="" disabled selected>${placeholderText}</option>`;

    // Очищаем список и добавляем плейсхолдер для участков
    document.getElementById("sectorFilter_SE").innerHTML = `<option value="" disabled selected>Выберите участок...</option>`;


    // Получаем список цехов
    const cehList = await loadCehList_SE();

    // Проверяем, является ли результат массивом
    if (!Array.isArray(cehList)) {
        console.warn("Полученные данные не являются массивом", cehList);
        return;
    }

    // Заполняем выпадающий список
    cehList.forEach(ceh => {
        const option = document.createElement("option");
        option.value = ceh["№ цеха"]; 
        option.textContent = ceh["№ цеха"];
        dropdown.appendChild(option);
    });
}

async function fillDropdownSectorFilter_SE(IdCeh,dropdownIdSector,placeholderText,dataAllCeha) {
    const cehFilterValue = document.getElementById(IdCeh).value;
    const selectorFilterLabel  = document.getElementById(dropdownIdSector);
    const CehListData_L = dataAllCeha; // берём уже выгруженные раннее данные и заносим их в локальную переменную, для "местного использования"
    const sectorFilter_SE = CehListData_L .filter(item =>item.cehNumber === cehFilterValue && item.cehName && item.cehName.trim() !== "").sort((a, b) => a.cehSector - b.cehSector);
    if (!Array.isArray(sectorFilter_SE)) {
        console.warn("Полученные данные не являются массивом", cehList);
        return;
    }

    selectorFilterLabel.options.length = 0;

    // Очищаем список и добавляем плейсхолдер
    dropdownIdSector.innerHTML = `<option value="" disabled selected>${placeholderText}</option>`;

    sectorFilter_SE.forEach(sector => {
        const option = document.createElement("option");
        option.value = sector.id;
        let NameUCh
        switch (sector.cehNumber) {
            case "ОМТС": // так как ОМТС в cehSector и cehName дублируются номера, их не дублировать
                NameUCh = sector.cehName;
              break;
            default:
                NameUCh = `${sector.cehSector} - ${sector.cehName}`;
              break;
          }

        option.textContent =  NameUCh;
        selectorFilterLabel.appendChild(option);
    });
}

function toggleCheckboxes() {
const table = document.getElementById('TableOperation_SE');
const checkboxes = table.querySelectorAll('tbody input[type="checkbox"]');

// Переключаем состояние
allChecked = !allChecked;

// Устанавливаем чекбоксы в нужное состояние
checkboxes.forEach(checkbox => {
    checkbox.checked = allChecked;
});
}

function fillTableOperation(dataAllCeha,cehFilterValue) {
    //const cehFilterValue = document.getElementById(IdCeh).value;
    const CehListData_L = dataAllCeha; // берём уже выгруженные раннее данные и заносим их в локальную переменную, для "местного использования"
    const tbody = document.querySelector('#TableOperation_SE tbody');
    let DannVrem;
    tbody.innerHTML = '';
    cehFilterValue.forEach(dann=>{
        const sectorFilter_SE = CehListData_L.filter(item => item.n_ORD_ID == dann);
        if (!Array.isArray(sectorFilter_SE)) {
            console.warn("Полученные данные не являются массивом", cehList);
            return;
        }
        sectorFilter_SE.forEach(item => {
            let row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" class="rowCheckbox" data-N_ORDMOVE_ID_=${item.n_ORDMOVE_ID} data-N_ORD_ID_=${item.n_ORD_ID} data-N_ORDMOVEWM_TR_=${item.n_ORDMOVEWM_TR} 
                data-N_ORDMOVEVM_PROF_=${item.n_ORDMOVEVM_PROF} data-N_ORDTRTP_CATEGORY_=${item.n_ORDTRTP_CATEGORY} data-ID_WORKBANCH_PLAN_=${item.iD_WORKBANCH_PLAN} data-WORKBANCH_ADD_TRUE=false></td>
                <td>${item.n_ord_note}</td>
                <td>${item.opeR_CODE}</td>
                <td>${item.opeR_NAME}</td>
                <td>${FormatDataAndTime(item.n_ORDMOVE_START)}</td>
                <td>${FormatDataAndTime(item.n_ORDMOVE_END)}</td>
                <td>${item.workkinD_NAME}</td>
                <td>${item.workbencH_NAZ !== null ? item.workbencH_NAZ : '(не назначено)'}</td>
                <td>${item.fiO_WORKERS !== null ? item.fiO_WORKERS : '(не назначено)'}</td>
                <td>${item.n_ORDMOVEST_NOTE}</td>
            `;
            tbody.appendChild(row);
        });
    });
}

function FormatDataAndTime(dateString){ // функция форматирования даты и времени
    const date = new Date(dateString);

    // Формат: день.месяц.год часы:минуты:секунды
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const formattedDateTime = `${day}.${month}.${year} ${hours}:${minutes}`;
    return formattedDateTime
}


// Функция для фильтрации номенклатур ()
function filterNMK_SE() {
    const searchText = document.getElementById("NMK_SE_Filter").value.toLowerCase();
    const options = document.querySelectorAll("#NMK_SE option");

    options.forEach(option => {
        const text = option.textContent.toLowerCase();
        option.style.display = text.includes(searchText) ? "" : "none";
    });
}

function ColorRow(){
    const SelectWorkbench = document.getElementById('Workbench_SE').value;
    const rows = document.querySelectorAll('#TableOperation_SE input.rowCheckbox');

    rows.forEach((row) => {
        const datasetId = row.dataset.id_workbanch_plan_; // возвращает строку или undefined
        const prov = row.dataset.workbanch_add_true;
        const rowParent = row.closest('tr');
        if (SelectWorkbench === '') {
            rowParent.style.backgroundColor = '';
        } else if (datasetId === 'null' || datasetId === SelectWorkbench){
            rowParent.style.backgroundColor = 'lightgreen';
            row.dataset.workbanch_add_true = true;
        }
        else {
        rowParent.style.backgroundColor = 'lightcoral';
        row.dataset.workbanch_add_true = false;
    }
    });
}

function DeleteWorkersForOperation(row_checkbox) {
    let SelectCellsWorkers = [];

    SelectCellsWorkers.push({
        N_ORDMOVE_ID:Number(row_checkbox.dataset.n_ordmove_id_),
        N_ORD_ID:Number(row_checkbox.dataset.n_ord_id_)
    })

fetch(`${pathBack}/api/AssigOfWorksAndEquup/delete_workers_se`,{
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(SelectCellsWorkers)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Ошибка сети или сервера');
        }
        return response.text();
      })
      .then(data => {
        console.log('Ответ сервера:', data);
      })
      .catch(error => {
        console.error('Ошибка при вызове API:', error);
      });
}

function UpdateOrders(isDell,checkbox) {
    const SelectWorkbench = document.getElementById('Workbench_SE').value;
    let SelectCellsWorkbench = [];

        if (isDell===false){
            SelectCellsWorkbench.push({
                N_ORDMOVE_ID:Number(checkbox.dataset.n_ordmove_id_),
                N_ORD_ID:Number(checkbox.dataset.n_ord_id_),
                ID_WORKBENCH:Number(SelectWorkbench)
            })
        }
        else{
            SelectCellsWorkbench.push({
                N_ORDMOVE_ID:Number(checkbox.dataset.n_ordmove_id_),
                N_ORD_ID:Number(checkbox.dataset.n_ord_id_),
                ID_WORKBENCH:null
            })
        }
    
        fetch(`${pathBack}/api/AssigOfWorksAndEquup/update_operation_se`,{
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body:  JSON.stringify(SelectCellsWorkbench)
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Ошибка сети или сервера');
            }
            return response.text(); // или response.text(), если ответ не JSON
          })
          .then(data => {
            console.log('Ответ сервера:', data);
          })
          .catch(error => {
            console.error('Ошибка при вызове API:', error);
          });
}

function InsertWorker(row_checkbox) {
    //let rowsArray = Array.from(row_checkbox);
    const SelectWorkers = document.getElementById('Worker_SE').value;
    const SelectCellsWorkers = [];

    SelectCellsWorkers.push({
        N_ORDMOVE_ID:Number(row_checkbox.dataset.n_ordmove_id_),
        N_ORD_ID:Number(row_checkbox.dataset.n_ord_id_),
        WORKMAN_ID:Number(SelectWorkers),
        N_ORDMOVEWM_TR:Number(row_checkbox.dataset.n_ordmovewm_tr_),
        N_ORDMOVEVM_PROF:Number(row_checkbox.dataset.n_ordmovevm_prof_),
        N_ORDTRTP_CATEGORY:Number(row_checkbox.dataset.n_ordtrtp_category_),
        CREATOR:Number(localStorage.getItem('userData'))
    })

    fetch (`${pathBack}/api/AssigOfWorksAndEquup/insert_workers_se`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(SelectCellsWorkers)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        return response.text();
    })
    .then(data => {
        console.log('Ответ сервера:', data);
      })
      .catch(error => {
        console.error('Ошибка при вызове API:', error);
      });    
}


function clearNMK_SE() {
    // Очищаем модальное окно номенклатур
    const NMK_SE = document.getElementById('NMK_SE');
    document.getElementById('NMK_SE_Filter').value = '';
    // Очищаем списки данных (Номенклатуры)
    NMK_SE.options.length = 0;
}

function clearNMK_SE_All() {
    // Очищаем модальное окно номенклатур
    const NMK_SE = document.getElementById('NMK_SE');
    const cehFilter_SE = document.getElementById('cehFilter_SE');
    const sectorFilter_SE =  document.getElementById('sectorFilter_SE');
    document.getElementById('NMK_SE_Filter').value = '';
    // Очищаем списки данных (Номенклатуры)
    NMK_SE.options.length = 0;
    cehFilter_SE.options.length = 0;
    sectorFilter_SE.options.length = 0;
}

function loadWorkers_SE(){
    const cehFilter_SE = document.getElementById("cehFilter_SE");

    const value_Filter_SE = cehFilter_SE.value;

    // Отправляем данные на сервер через AJAX
    fetch(`${pathBack}/api/AssigOfWorksAndEquup/workers_se`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            
            CEHA_NUMBER: value_Filter_SE
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data == null || (typeof data === 'object' && Object.keys(data).length === 0)) {
            alert('На данный цех не заведены работники');
            return false;}
            FillWorkers_SE(data,"Выберите работников...")
    })
    .catch(error => {
        console.error("Ошибка:", error);
        document.getElementById("LoadingModalOverlay").style.display = "none";
        document.getElementById("LoadingModal").style.display = "none";
        alert("Произошла ошибка при отправке данных.");
    });
}

function loadWorkbanch_SE(){
    const sectorFilter_SE = document.getElementById("sectorFilter_SE");
    const value_sectorFilter_SE = sectorFilter_SE.value;

    // Отправляем данные на сервер через AJAX
    fetch(`${pathBack}/api/AssigOfWorksAndEquup/workbench_se`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            
            CEHA_ID: value_sectorFilter_SE
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data == null || (typeof data === 'object' && Object.keys(data).length === 0)) {
            alert('На данный цех не заведено оборудование');
            return false;}
            FillWorkbench_SE(data,"Выберите оборудование...")
    })
    .catch(error => {
        console.error("Ошибка:", error);
        document.getElementById("LoadingModalOverlay").style.display = "none";
        document.getElementById("LoadingModal").style.display = "none";
        alert("Произошла ошибка при отправке данных.");
    });
}

function loadOperation_SE(){
    const selectedNMK_SE = document.getElementById("NMK_SE");
    const selectedSector_SE = document.getElementById("sectorFilter_SE");
    const value_NMK_SE = selectedNMK_SE.value;
    const value_Sector_SE = selectedSector_SE.value;
    
    // Отправляем данные на сервер через AJAX
    fetch(`${pathBack}/api/AssigOfWorksAndEquup/psp_se`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            NMK_ID: value_NMK_SE,
            CEHA_ID: value_Sector_SE
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(datal => {
        if (datal == null || (typeof datal === 'object' && Object.keys(datal).length === 0)) {
            alert('По данной номенклатуре нет заказов');
            return;}
            Operation_PSP_SE = datal;
            FillOperation_SE(datal)
            clearWorker_SE();
            clearWorkbench_SE();
            if (loadWorkers_SE()===false) return;
            if (loadWorkbanch_SE()===false) return; 
    })
    .catch(error => {
        console.error("Ошибка:", error);
        document.getElementById("LoadingModalOverlay").style.display = "none";
        document.getElementById("LoadingModal").style.display = "none";
        alert("Произошла ошибка при отправке данных.");
    });
    const tbody = document.querySelector('#TableOperation_SE tbody');
    tbody.innerHTML = '';
}


async function FillOperation_SE(data){
    clearOperation_SE();
    const Value_PSP = Array.from(
        new Set(
          data.map(item => JSON.stringify({ n_ORD_ID: item.n_ORD_ID, n_ord_note: item.n_ord_note }))
        )
      ).map(str => JSON.parse(str));

      Value_PSP.forEach(item => {
            const option = document.createElement("option");
            option.value = item.n_ORD_ID;
            option.textContent = item.n_ord_note;
            PSP_SE_Oper.appendChild(option);
        });
    }

async function FillWorkers_SE(data,placeholderText){
    Worker_SE.innerHTML = `<option value="">${placeholderText}</option>`;
      data.forEach(item => {
            const option = document.createElement("option");
            option.value = item.workmaN_ID;
            option.textContent = item.workmaN_FIO;
            Worker_SE.appendChild(option);
        }); 
    }
    
async function FillWorkbench_SE(data,placeholderText){
    Workbench_SE.innerHTML = `<option value="">${placeholderText}</option>`;
    data.forEach(item => {
            const option = document.createElement("option");
            option.value = item.iD_WORKBENCH;
            option.textContent = `Сер № ${item.serialnuM_NUMBER} - ${item.workbench}`
            Workbench_SE.appendChild(option);
        }); 
    } 

function filterPSP_Operacion_SE() {
    const searchText = document.getElementById("PSP_SE_Oper_Filter").value.toLowerCase();
    const options = document.querySelectorAll("#PSP_SE_Oper option");

    options.forEach(option => {
        const text = option.textContent.toLowerCase();
        option.style.display = text.includes(searchText) ? "" : "none";
    });
}

function filter_Operacion_SE() {
    const searchText = document.getElementById("Operation_SE_Filter").value.toLowerCase();
    const options = document.querySelectorAll("Operation_SE_ option");

    options.forEach(option => {
        const text = option.textContent.toLowerCase();
        option.style.display = text.includes(searchText) ? "" : "none";
    });
}


function clearOperation_SE() {
    // Очищаем модальное окно ПСп
    const PSP_SE_Oper = document.getElementById('PSP_SE_Oper');
    // Очищаем списки данных (ПСп)
    document.getElementById('PSP_SE_Oper_Filter').value = '';
    PSP_SE_Oper.options.length = 0;
}

function clearWorker_SE() {
    // Очищаем выпадающий список работников
    const Worker_SE = document.getElementById('Worker_SE');
    // Очищаем списки данных (работники))
    Worker_SE.options.length = 0;
}
function clearWorkbench_SE() {
    // Очищаем выпадающий список оборудования
    const Workbench_SE = document.getElementById('Workbench_SE');
    // Очищаем списки данных (работники))
    Workbench_SE.options.length = 0;
}
//#endregion

//#region Функции модального окна (Сформировать сменно-суточное задание)
// Загрузка данных ПСП при загрузке страницы 
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("openFormationOfShiftDailyAssignmentsButton").addEventListener("click", function () {
        loadPSP_SE();
    });
});

// Переход в модальное окно "План изготовления" (Сформировать сменно-суточное задание)
// Загрузка данных состава ПСП при загрузке страницы 
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("continue_PSP_SE").addEventListener("click", function () {
        selectPSP();
    });
});


// Переход в модальное окно "Выбор заказа" (Сформировать сменно-суточное задание)
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('continue_PSP_Party').addEventListener('click', (e) => {
        openGenerateReport();
    });
});

// Кнопка "Сформировать" на экране выбора заказов (Сформировать сменно-суточное задание)
document.getElementById('generate_report').addEventListener('click', (e) => {
    clearOrderList() 
});

// функция закрывает форму (Сформировать сменно-суточное задание), при нажатии за границу модального окна
function QuestionOpenFormsShiftDaily (){ 
    if (document.getElementById("formationOfShiftDailyAssignments").style.display !== "block") {
        const result = confirm("Выбранные Вами данные могут быть потеряны!\nВы действительно хотите закрыть окно?");
        if (result) {
            clearPSP();
        } else {
            return;
        }
    }
    else {
        clearPSP();
    } 
}

// функция закрывает форму (Выбор состава ПСп), при нажатии за границу модального окна
function closeCompositionPSPAndParty (){ 
    if (document.getElementById("compositionPSPAndBatches").style.display !== "block") {
        const result = confirm("Выбранные Вами данные могут быть потеряны!\nВы действительно хотите закрыть окно?");
        if (result) {
            clearCompositionPSPAndBatches();
        } else {
            return;
        }
    }
    else {
        clearCompositionPSPAndBatches();
    } 
}


// загрузка списка ПСП
async function loadPSP_SE() { 
    try {
        const response = await fetch(`${pathBack}/api/psp`); // используется ранее созданная API, так как она выдаёт только сборочные единицы
        if (!response.ok) {
            throw new Error('Ошибка загрузки данных');
        }
        dataPSP = await response.json();
        openFormationOfShiftDailyAssignments(dataPSP);
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить данные');
    }
}

//Выберите ПСП
async function openFormationOfShiftDailyAssignments(dataShiftDaily){
    if (!dataShiftDaily.length) loadPSP_SE();
    const PSP_SE = document.getElementById("PSP_SE");
    dataShiftDaily.forEach(itemShiftDaily => {
        const designation = itemShiftDaily["designation"]; // Обозначение
        const name = itemShiftDaily["name"]; // Наименование
        const id = itemShiftDaily["id_PSP"];
        const option = document.createElement("option");
        option.value = id;
        option.textContent = `${designation} - ${name}`;
        PSP_SE.appendChild(option);
    });
    // Показываем модальное окно
    document.getElementById('formationOfShiftDailyAssignmentsOverlay').classList.remove('hidden');
    document.getElementById('formationOfShiftDailyAssignments').classList.remove('hidden');
}

//список состав ПСП
async function listCompositionPSP(dataCompositionPSP){
    if (!dataCompositionPSP.length) selectPSP();
    const compositionPSP = document.getElementById("composition_PSP");
    dataCompositionPSP.forEach(itemCompositionPSP => {
        const note = itemCompositionPSP["NMK_NOTE"]; // Обозначение
        const name = itemCompositionPSP["NMK_NAME"]; // Наименование
        const optionCompositionPSP = document.createElement("option");
        optionCompositionPSP.dataset.lvl = itemCompositionPSP["N_ORDTREE_LEV"]; // Уровень вложенности
        optionCompositionPSP.value = itemCompositionPSP["N_ORDTREE_ID"];//ID состава
        optionCompositionPSP.dataset.classifType = itemCompositionPSP["NMK_CLASSIF_TYPE_ID"];     
        optionCompositionPSP.textContent = "_".repeat(optionCompositionPSP.dataset.lvl) +` ${note} - ${name}`;
        compositionPSP.appendChild(optionCompositionPSP);
    });
    document.getElementById('formationOfShiftDailyAssignmentsOverlay').style.display = "none";
    document.getElementById('formationOfShiftDailyAssignments').style.display = "none";
    document.getElementById('compositionPSPAndBatchesOverlay').style.display = "block";
    document.getElementById('compositionPSPAndBatches').style.display = "block";
    // Показываем модальное окно
    document.getElementById('formationOfShiftDailyAssignmentsOverlay').classList.remove('hidden');
    document.getElementById('formationOfShiftDailyAssignments').classList.remove('hidden');
}

//список производственных партий
async function listBatches(dataBatches){
    if (!dataBatches.length) selectCompositionPSP();
    const batches = document.getElementById("batches");
    dataBatches.forEach(itemBatches => {
        const note = itemBatches["N_ORD_PART_NOTE"]; // Наименование
        const option = document.createElement("option");
        option.value = itemBatches["N_ORD_PART_ID"];
        option.textContent = `${note}`;
        batches.appendChild(option);
    });
}

//список заказов
async function listOrder(dataOrder){
    if (!dataOrder.length) selectBatchesPSP();
    const order = document.querySelector("#TableOperationOrder tbody");
    order.innerHTML = '';
    dataOrder.forEach((itemOrder,index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td><input type="checkbox" class="rowCheckbox" data-n_ORDTRTP_ID=${itemOrder["n_ORDTRTP_ID"]} onchange="updateSelection(${index})"</td>
        <td>${itemOrder["n_ord_note"]}</td>
        <td>${itemOrder["tR_NOTE"]}</td>
        <td>${itemOrder["tR_NAME"]}</td>
        <td>${itemOrder["n_ordtree_spquan"]}</td>
        <td>${itemOrder["n_ORDMOVE_START"]}</td>
        <td>${itemOrder["n_ORDMOVE_END"]}</td>
        <td>${itemOrder["opeR_NAME"]}</td>
        <td>(нет примечаний)</td>`
        order.appendChild(row);
    });
}

// Функция для фильтрации номенклатур ()
function filterPSP_SE() {
    const searchText = document.getElementById("PSP_SE_Filter").value.toLowerCase();
    const options = document.querySelectorAll("#PSP_SE option");

    options.forEach(option => {
        const text = option.textContent.toLowerCase();
        option.style.display = text.includes(searchText) ? "" : "none";
    });
}

function clearPSP() {
    // Очищаем модальное окно ПСП
    const PSP_SE = document.getElementById('PSP_SE');
    document.getElementById('PSP_SE_Filter').value = '';
    // Очищаем списки данных (ПСП)
    PSP_SE.options.length = 0;
    document.getElementById("formationOfShiftDailyAssignmentsOverlay").style.display = "none";
    document.getElementById("formationOfShiftDailyAssignments").style.display = "none";
    document.getElementById('formationOfShiftDailyAssignmentsOverlay').classList.add('hidden');
    document.getElementById('formationOfShiftDailyAssignments').classList.add('hidden');
}

function clearCompositionPSPAndBatches() {
    // Очищаем модальное окно состав ПСП
    const composition_PSP = document.getElementById('composition_PSP');
    document.getElementById('PSP_SE_Filter').value = '';
    // Очищаем списки данных (ПСП)
    composition_PSP.options.length = 0;
    batches.options.length = 0;
    document.getElementById("compositionPSPAndBatchesOverlay").style.display = "none";
    document.getElementById("compositionPSPAndBatches").style.display = "none";
    document.getElementById('compositionPSPAndBatchesOverlay').classList.add('hidden');
    document.getElementById('compositionPSPAndBatches').classList.add('hidden');
}

function clearOrderList(){
    document.getElementById("orderPSPOverlay").style.display = "none";
    document.getElementById("orderPSP").style.display = "none";
    clearPSP();
}

//Загрузка состава ПСП после выбора ПСП
async function selectPSP() {
    try {
        const selectedPSP_SE = document.getElementById("PSP_SE");
        const values = selectedPSP_SE.value;
        if (!values){
            alert("Выберите ТОЛЬКО одно ПСп.");
            return;
        }
        fetch(`${pathBack}/api/CompositionAndBatches/composition`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                PSPlist: values
            })
        })
        .then(response => {
             if (!response.ok) {
                 throw new Error(`Ошибка HTTP: ${response.status}`);
             }
             return response.json();
        })
        .then(data => {
            if(data == null || (typeof data === 'object' && Object.keys(data).length === 0))
            {
                alert('у данного ПСп нет состава');
                return;
            }
            listCompositionPSP(data);
        })
        .catch(error => {
            console.error("Ошибка:", error);
            document.getElementById("formationOfShiftDailyAssignmentsOverlay").style.display = "none";
            document.getElementById("formationOfShiftDailyAssignments").style.display = "none";
            document.getElementById('compositionPSPAndBatchesOverlay').style.display = "none";
            document.getElementById('compositionPSPAndBatches').style.display = "none";
            alert("Произошла ошибка при отправке данных (1).");
        });
    }
    catch (error){
        console.error("Ошибка:", error);
        document.getElementById("formationOfShiftDailyAssignmentsOverlay").style.display = "none";
        document.getElementById("formationOfShiftDailyAssignments").style.display = "none";
        document.getElementById('compositionPSPAndBatchesOverlay').style.display = "none";
        document.getElementById('compositionPSPAndBatches').style.display = "none";
        alert("Произошла ошибка при отправке данных (2).");
    }
}

//Загрузка Производственных партий после выбора состава ПСП
async function selectCompositionPSP() {
    try {
        const PSPlist = document.getElementById("PSP_SE")
        const valuesPSPlist = PSPlist.value;
        const compositionList = document.getElementById("composition_PSP")
        const valuesCompositionList = compositionList.value;
        const compositionLVL = Array.from(compositionList.options)
            .find(option => option.value === valuesCompositionList).dataset.lvl;
        const classifTypeID = Array.from(compositionList.options)
            .find(option=>option.value===valuesCompositionList).dataset.classifType;
        document.body.classList.add('wait-cursor');    
        fetch(`${pathBack}/api/CompositionAndBatches/batches`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                LVLOrdtree: compositionLVL,
                Ordtree: valuesCompositionList,
                PSPlist: valuesPSPlist,
                ClassifTypeID: classifTypeID
            })
        })
        .then(response => {
             if (!response.ok) {
                 throw new Error(`Ошибка HTTP: ${response.status}`);
             }
             return response.json();
        })
        .then(data => {
            if(data == null || (typeof data === 'object' && Object.keys(data).length === 0))
            {
                alert('у данного состава ПСп нет производсвенной партии');
                document.getElementById("batches").options.length = 0;
                return;
            }
            document.getElementById("batches").options.length = 0;
            listBatches(data);
            document.body.classList.add('default-cursor');
        })
        .catch(error => {
            console.error("Ошибка:", error);
            document.getElementById("formationOfShiftDailyAssignmentsOverlay").style.display = "none";
            document.getElementById("formationOfShiftDailyAssignments").style.display = "none";
            document.getElementById('compositionPSPAndBatchesOverlay').style.display = "none";
            document.getElementById('compositionPSPAndBatches').style.display = "none";
            alert("Произошла ошибка при отправке данных.");
        });
    }
    catch (error){
        console.error("Ошибка:", error);
        document.getElementById("formationOfShiftDailyAssignmentsOverlay").style.display = "none";
        document.getElementById("formationOfShiftDailyAssignments").style.display = "none";
        document.getElementById('compositionPSPAndBatchesOverlay').style.display = "none";
        document.getElementById('compositionPSPAndBatches').style.display = "none";
        alert("Произошла ошибка при получении данных.");
    }
}

//Загрузка заказов после выбора состава ПСП и производственной партии 
async function selectBatchesPSP() {
    try {
        const valuesPSP = document.getElementById("PSP_SE").value;
        const valuesBatch = document.getElementById("batches").value;
        fetch(`${pathBack}/api/OrderPSP/list_order_psp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ord_id: valuesPSP,
                ord_part_id: valuesBatch
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if(data == null || (typeof data === 'object' && Object.keys(data).length === 0))
            {
                alert('нет заказов');
                return;
            }
            tableData = data;
            listOrder(data);
        })
        .catch(error => {
            console.error("Ошибка:", error);
            document.getElementById("formationOfShiftDailyAssignmentsOverlay").style.display = "none";
            document.getElementById("formationOfShiftDailyAssignments").style.display = "none";
            document.getElementById('compositionPSPAndBatchesOverlay').style.display = "none";
            document.getElementById('compositionPSPAndBatches').style.display = "none";
            alert("Произошла ошибка при отправке данных (1)selectBatchesPSP.");
        });
    }
    catch (error){
        console.error("Ошибка:", error);
        document.getElementById("formationOfShiftDailyAssignmentsOverlay").style.display = "none";
        document.getElementById("formationOfShiftDailyAssignments").style.display = "none";
        document.getElementById('compositionPSPAndBatchesOverlay').style.display = "none";
        document.getElementById('compositionPSPAndBatches').style.display = "none";
        alert("Произошла ошибка при отправке данных (2)selectBatchesPSP.");
    }
}

//Данные для выгрузки
let tableData = [];

// Обновление состояния выбора
function updateSelection(index) {
    const checkbox = event.target;
    tableData[index].selected = checkbox.checked;
}

// Генерация отчета
async function generateReport() {
    try {
        const selectedItems = tableData.filter(item => item.selected);
        if (selectedItems.length === 0) {
            alert('Пожалуйста, выберите хотя бы одну строку');
            return;
        }

        const response = await fetch(`${pathBack}/api/OrderPSP/generate_report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(selectedItems)
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Отчет сменна-сутоное задание ${new Date().toLocaleString()}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            const error = await response.text();
            alert('Ошибка: ' + error);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при генерации отчета');
    }
}

function openGenerateReport(){
    const selectedValue = document.getElementById("batches").value;
    if (!selectedValue) {
        alert("Выберите состав ПСп и производсвенную партию")
        return;
    }
    selectBatchesPSP();
    document.getElementById('compositionPSPAndBatchesOverlay').style.display = "none";
    document.getElementById('compositionPSPAndBatches').style.display = "none";
    document.getElementById("orderPSPOverlay").style.display = "block";
    document.getElementById("orderPSP").style.display = "block";
}
//#endregion
//#endregion