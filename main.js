import { PDFDocument } from 'pdf-lib';

// Global state
let pdfDoc = null;
let pdfBytes = null;
let formFields = [];

// DOM elements
const pdfInput = document.getElementById('pdfInput');
const uploadArea = document.getElementById('uploadArea');
const fileInfo = document.getElementById('fileInfo');
const formSection = document.getElementById('formSection');
const dynamicForm = document.getElementById('dynamicForm');
const downloadBtn = document.getElementById('downloadBtn');

// Initialize
init();

function init() {
    // File input handler
    pdfInput.addEventListener('change', handleFileSelect);

    // Drag and drop handlers
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // Download button handler
    downloadBtn.addEventListener('click', handleDownload);
}

// File handling
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
        loadPDF(file);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');

    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
        loadPDF(file);
    }
}

// PDF loading and processing
async function loadPDF(file) {
    try {
        // Show loading state
        fileInfo.textContent = '読み込み中...';
        fileInfo.classList.remove('hidden');

        // Read file
        const arrayBuffer = await file.arrayBuffer();
        pdfBytes = new Uint8Array(arrayBuffer);

        // Load PDF document
        pdfDoc = await PDFDocument.load(pdfBytes);

        // Get form
        const form = pdfDoc.getForm();
        const fields = form.getFields();

        if (fields.length === 0) {
            fileInfo.textContent = '⚠️ このPDFにはフォームフィールドがありません';
            fileInfo.style.background = '#fef3c7';
            fileInfo.style.borderColor = '#f59e0b';
            fileInfo.style.color = '#92400e';
            formSection.classList.add('hidden');
            return;
        }

        // Update UI
        fileInfo.textContent = `✓ ${file.name} を読み込みました（${fields.length}個のフィールド）`;
        fileInfo.style.background = '#ecfdf5';
        fileInfo.style.borderColor = '#10b981';
        fileInfo.style.color = '#047857';

        // Extract and display form fields
        await extractFormFields(form);

    } catch (error) {
        console.error('PDF読み込みエラー:', error);
        fileInfo.textContent = `❌ エラー: ${error.message}`;
        fileInfo.style.background = '#fee2e2';
        fileInfo.style.borderColor = '#ef4444';
        fileInfo.style.color = '#991b1b';
    }
}

// Extract form fields
async function extractFormFields(form) {
    formFields = [];
    const fields = form.getFields();

    for (const field of fields) {
        const fieldData = {
            name: field.getName(),
            type: getFieldType(field),
            value: getFieldValue(field),
            field: field
        };

        formFields.push(fieldData);
    }

    renderForm();
}

// Get field type
function getFieldType(field) {
    // In production builds, constructor names are minified (e.g., "t")
    // So we need to detect type by checking available methods

    // Check for checkbox (has check/uncheck methods)
    if (typeof field.check === 'function' && typeof field.uncheck === 'function') {
        return 'checkbox';
    }

    // Check for radio group (has getOptions and usually fewer methods than dropdown)
    if (typeof field.getOptions === 'function') {
        const options = field.getOptions();
        // Check if it's a radio group by checking if field has select method
        // Dropdowns and lists also have getOptions, but we'll distinguish them later
        // For now, check if it's editable (dropdown) or multiselect (list)
        if (typeof field.isEditable === 'function') {
            // It's a dropdown or list
            if (typeof field.isMultiselect === 'function' && field.isMultiselect()) {
                return 'select'; // Multi-select list
            }
            return 'dropdown'; // Regular dropdown
        }
        // If no isEditable method, it might be a radio group
        return 'radio';
    }

    // Check for text field (has setText method)
    if (typeof field.setText === 'function' && typeof field.getText === 'function') {
        return 'text';
    }

    // Check for button (has appearance update methods but not much else)
    if (typeof field.updateAppearances === 'function' &&
        !field.setText && !field.check && !field.getOptions) {
        return 'button';
    }

    console.warn(`Unknown field type for: ${field.getName()}`);
    return 'text'; // default
}

// Get current field value
function getFieldValue(field) {
    try {
        // Check by methods, not constructor name (which is minified in production)
        if (typeof field.getText === 'function') {
            return field.getText() || '';
        }
        if (typeof field.isChecked === 'function') {
            return field.isChecked();
        }
        if (typeof field.getSelected === 'function') {
            const selected = field.getSelected();
            return Array.isArray(selected) ? selected[0] : selected || '';
        }
    } catch (error) {
        console.warn(`フィールド ${field.getName()} の値取得エラー:`, error);
    }

    return '';
}

// Render dynamic form
function renderForm() {
    dynamicForm.innerHTML = '';

    formFields.forEach((fieldData, index) => {
        const formGroup = createFormGroup(fieldData, index);
        if (formGroup) {
            dynamicForm.appendChild(formGroup);
        }
    });

    formSection.classList.remove('hidden');
}

// Create form group for each field
function createFormGroup(fieldData, index) {
    const { name, type, value } = fieldData;

    // Skip button fields
    if (type === 'button') {
        return null;
    }

    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';

    if (type === 'checkbox') {
        const wrapper = document.createElement('div');
        wrapper.className = 'checkbox-wrapper';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `field-${index}`;
        input.checked = value;
        input.dataset.fieldIndex = index;

        const label = document.createElement('label');
        label.htmlFor = `field-${index}`;
        label.textContent = name;

        wrapper.appendChild(input);
        wrapper.appendChild(label);
        formGroup.appendChild(wrapper);

    } else if (type === 'radio') {
        const label = document.createElement('label');
        label.textContent = name;
        formGroup.appendChild(label);

        const radioWrapper = document.createElement('div');
        radioWrapper.className = 'radio-wrapper';

        // Try to get options for radio group
        try {
            const options = fieldData.field.getOptions();

            options.forEach((option, optionIndex) => {
                const radioContainer = document.createElement('div');
                radioContainer.className = 'radio-item';

                const input = document.createElement('input');
                input.type = 'radio';
                input.id = `field-${index}-${optionIndex}`;
                input.name = `field-${index}`;
                input.value = option;
                input.dataset.fieldIndex = index;
                input.checked = option === value;

                const optionLabel = document.createElement('label');
                optionLabel.htmlFor = `field-${index}-${optionIndex}`;
                optionLabel.textContent = option;

                radioContainer.appendChild(input);
                radioContainer.appendChild(optionLabel);
                radioWrapper.appendChild(radioContainer);
            });
        } catch (error) {
            console.warn('ラジオグループオプション取得エラー:', error);
        }

        formGroup.appendChild(radioWrapper);

    } else if (type === 'dropdown' || type === 'select') {
        const label = document.createElement('label');
        label.htmlFor = `field-${index}`;
        label.textContent = name;

        const select = document.createElement('select');
        select.id = `field-${index}`;
        select.dataset.fieldIndex = index;

        // Try to get options
        try {
            const options = fieldData.field.getOptions();

            // Add empty option
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = '選択してください';
            select.appendChild(emptyOption);

            options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                if (option === value) {
                    optionElement.selected = true;
                }
                select.appendChild(optionElement);
            });
        } catch (error) {
            console.warn('オプション取得エラー:', error);
        }

        formGroup.appendChild(label);
        formGroup.appendChild(select);

    } else {
        // Default to text input
        const label = document.createElement('label');
        label.htmlFor = `field-${index}`;
        label.textContent = name;

        const input = document.createElement('input');
        input.type = 'text';
        input.id = `field-${index}`;
        input.value = value || '';
        input.dataset.fieldIndex = index;
        input.placeholder = `${name}を入力`;

        formGroup.appendChild(label);
        formGroup.appendChild(input);
    }

    return formGroup;
}

// Handle download
async function handleDownload() {
    if (!pdfDoc) {
        alert('PDFが読み込まれていません');
        return;
    }

    try {
        downloadBtn.disabled = true;
        downloadBtn.textContent = '処理中...';

        // Get form
        const form = pdfDoc.getForm();

        // Update form fields with user input
        const inputs = dynamicForm.querySelectorAll('input, select, textarea');
        const processedFields = new Set();

        inputs.forEach(input => {
            const fieldIndex = parseInt(input.dataset.fieldIndex);
            const fieldData = formFields[fieldIndex];

            if (!fieldData) return;

            // For radio buttons, only process the checked one
            if (input.type === 'radio' && !input.checked) {
                return;
            }

            // Avoid processing the same field multiple times
            if (processedFields.has(fieldIndex)) {
                return;
            }

            try {
                const field = fieldData.field;

                // Check by methods, not constructor name
                if (typeof field.setText === 'function') {
                    field.setText(input.value);
                    processedFields.add(fieldIndex);
                } else if (typeof field.check === 'function' && typeof field.uncheck === 'function') {
                    if (input.checked) {
                        field.check();
                    } else {
                        field.uncheck();
                    }
                    processedFields.add(fieldIndex);
                } else if (typeof field.select === 'function') {
                    // Dropdown, list, or radio group
                    if (input.value) {
                        field.select(input.value);
                    }
                    processedFields.add(fieldIndex);
                }
            } catch (error) {
                console.error(`フィールド ${fieldData.name} の更新エラー:`, error);
            }
        });

        // Flatten form (optional - makes fields non-editable)
        // form.flatten();

        // Save PDF
        const pdfBytesOutput = await pdfDoc.save();

        // Download
        const blob = new Blob([pdfBytesOutput], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `filled-form-${Date.now()}.pdf`;
        a.click();
        URL.revokeObjectURL(url);

        // Reset button
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            PDFをダウンロード
        `;

    } catch (error) {
        console.error('PDF生成エラー:', error);
        alert(`エラーが発生しました: ${error.message}`);

        downloadBtn.disabled = false;
        downloadBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            PDFをダウンロード
        `;
    }
}
