document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const imageUpload = document.getElementById('imageUpload');
    const imagesList = document.getElementById('imagesList');
    const selectedCount = document.getElementById('selectedCount');
    
    let uploadedImages = [];
    let selectedImages = new Set();

    // 预设网格模板
    const gridTemplates = [
        {
            id: 'grid1x2',
            name: '1 × 2',
            rows: 1,
            cols: 2,
            cells: 2
        },
        {
            id: 'grid2x2',
            name: '2 × 2',
            rows: 2,
            cols: 2,
            cells: 4
        },
        {
            id: 'grid3x3',
            name: '3 × 3',
            rows: 3,
            cols: 3,
            cells: 9
        },
        {
            id: 'grid2x3',
            name: '2 × 3',
            rows: 2,
            cols: 3,
            cells: 6
        },
        {
            id: 'grid3x2',
            name: '3 × 2',
            rows: 3,
            cols: 2,
            cells: 6
        },
        {
            id: 'grid1x3',
            name: '1 × 3',
            rows: 1,
            cols: 3,
            cells: 3
        },
        {
            id: 'grid3x1',
            name: '3 × 1',
            rows: 3,
            cols: 1,
            cells: 3
        },
        {
            id: 'grid4x4',
            name: '4 × 4',
            rows: 4,
            cols: 4,
            cells: 16
        },
        {
            id: 'grid2x4',
            name: '2 × 4',
            rows: 2,
            cols: 4,
            cells: 8
        },
        {
            id: 'grid4x2',
            name: '4 × 2',
            rows: 4,
            cols: 2,
            cells: 8
        }
    ];

    let selectedTemplate = null;

    // 创建模板预览
    function createTemplatePreview(template) {
        const preview = document.createElement('div');
        preview.className = 'template-preview';
        preview.style.gridTemplateRows = `repeat(${template.rows}, 1fr)`;
        preview.style.gridTemplateColumns = `repeat(${template.cols}, 1fr)`;

        for (let i = 0; i < template.cells; i++) {
            const cell = document.createElement('div');
            cell.className = 'template-cell';
            preview.appendChild(cell);
        }

        return preview;
    }

    // 初始化模板选择区
    function initializeTemplates() {
        const templateGrid = document.querySelector('.template-grid');
        
        gridTemplates.forEach(template => {
            const templateItem = document.createElement('div');
            templateItem.className = 'template-item';
            templateItem.dataset.templateId = template.id;
            
            const preview = createTemplatePreview(template);
            templateItem.appendChild(preview);
            
            templateItem.addEventListener('click', () => {
                // 移除其他模板的选中状态
                document.querySelectorAll('.template-item.selected')
                    .forEach(item => item.classList.remove('selected'));
                
                // 选中当前模板
                templateItem.classList.add('selected');
                selectedTemplate = template;
                
                // 启用生成预览按钮
                generatePreviewBtn.disabled = false;
            });
            
            templateGrid.appendChild(templateItem);
        });

        // 添加生成预览按钮
        const generatePreviewBtn = document.createElement('button');
        generatePreviewBtn.className = 'download-button';
        generatePreviewBtn.textContent = '生成预览';
        generatePreviewBtn.disabled = true;
        generatePreviewBtn.onclick = updateGridPreview;

        // 将按钮添加到预览区域上方
        const previewContainer = document.querySelector('.preview-container');
        previewContainer.parentNode.insertBefore(generatePreviewBtn, previewContainer);
    }

    // 添加一个生成排列组合的函数
    function generateCombinations(arr, size) {
        if (size > arr.length) return [arr];
        const result = [];
        
        function permute(arr, temp = [], used = new Set()) {
            if (temp.length === size) {
                result.push([...temp]);
                return;
            }
            
            for (let i = 0; i < arr.length; i++) {
                if (used.has(i)) continue;
                temp.push(arr[i]);
                used.add(i);
                permute(arr, temp, used);
                temp.pop();
                used.delete(i);
            }
        }
        
        permute(arr);
        return result;
    }

    // 修改 updateGridPreview 函数
    function updateGridPreview() {
        const gridPreview = document.getElementById('gridPreview');
        const downloadBtn = document.getElementById('downloadBtn');
        const previewContainer = document.querySelector('.preview-container');
        
        if (!selectedTemplate || selectedImages.size === 0) {
            gridPreview.innerHTML = '<div class="empty-preview">请选择模板和图片</div>';
            downloadBtn.disabled = true;
            return;
        }

        const selectedImagesArray = Array.from(selectedImages);
        
        // 生成排列组合
        const combinations = generateCombinations(
            selectedImagesArray,
            Math.min(selectedTemplate.cells, selectedImagesArray.length)
        );

        // 清空预览区域
        previewContainer.innerHTML = '';
        
        // 添加全选和下载按钮
        const actionBar = document.createElement('div');
        actionBar.className = 'preview-action-bar';
        
        const selectAllBtn = document.createElement('button');
        selectAllBtn.className = 'select-all-button';
        selectAllBtn.textContent = '全选';
        selectAllBtn.onclick = toggleSelectAll;
        
        const downloadSelectedBtn = document.createElement('button');
        downloadSelectedBtn.className = 'download-button';
        downloadSelectedBtn.textContent = '下载选中预览图';
        downloadSelectedBtn.onclick = downloadSelectedPreviews;
        downloadSelectedBtn.disabled = true;
        
        actionBar.appendChild(selectAllBtn);
        actionBar.appendChild(downloadSelectedBtn);
        previewContainer.appendChild(actionBar);
        
        // 为每个组合创建一个预览
        combinations.forEach((combination, index) => {
            const previewSection = document.createElement('div');
            previewSection.className = 'preview-section';
            
            // 添加勾选框
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'preview-checkbox';
            checkbox.onchange = () => updateDownloadButton(downloadSelectedBtn);
            previewSection.appendChild(checkbox);
            
            const gridPreview = document.createElement('div');
            gridPreview.className = 'grid-preview';
            gridPreview.style.display = 'grid';
            gridPreview.style.gridTemplateRows = `repeat(${selectedTemplate.rows}, 1fr)`;
            gridPreview.style.gridTemplateColumns = `repeat(${selectedTemplate.cols}, 1fr)`;
            gridPreview.style.gap = '4px';
            gridPreview.style.marginBottom = '2rem';
            
            // 填充网格
            for (let i = 0; i < selectedTemplate.cells; i++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                
                if (i < combination.length) {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'img-container';
                    
                    const img = combination[i].cloneNode();
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'cover';
                    
                    imgContainer.appendChild(img);
                    cell.appendChild(imgContainer);
                }
                
                gridPreview.appendChild(cell);
            }
            
            previewSection.appendChild(gridPreview);
            previewContainer.appendChild(previewSection);
        });
    }

    // 添加全选/取消全选功能
    function toggleSelectAll() {
        const checkboxes = document.querySelectorAll('.preview-checkbox');
        const selectAllBtn = document.querySelector('.select-all-button');
        const isAllSelected = Array.from(checkboxes).every(cb => cb.checked);
        
        checkboxes.forEach(cb => cb.checked = !isAllSelected);
        selectAllBtn.textContent = isAllSelected ? '全选' : '取消全选';
        
        // 更新下载按钮状态
        const downloadBtn = document.querySelector('.preview-action-bar .download-button');
        updateDownloadButton(downloadBtn);
    }

    // 更新下载按钮状态
    function updateDownloadButton(downloadBtn) {
        const selectedCount = document.querySelectorAll('.preview-checkbox:checked').length;
        downloadBtn.disabled = selectedCount === 0;
        downloadBtn.textContent = `下载选中预览图 (${selectedCount})`;
    }

    // 下载选中的预览图
    function downloadSelectedPreviews() {
        const selectedPreviews = document.querySelectorAll('.preview-checkbox:checked');
        
        if (selectedPreviews.length === 1) {
            // 单张下载
            const gridPreview = selectedPreviews[0].closest('.preview-section').querySelector('.grid-preview');
            createAndDownloadImage(gridPreview);
        } else {
            // 多张下载，创建 zip
            const zip = new JSZip();
            const promises = Array.from(selectedPreviews).map((checkbox, index) => {
                return new Promise(resolve => {
                    const gridPreview = checkbox.closest('.preview-section').querySelector('.grid-preview');
                    createPreviewImage(gridPreview).then(dataUrl => {
                        zip.file(`grid-image-${index + 1}.png`, dataUrl.split(',')[1], {base64: true});
                        resolve();
                    });
                });
            });

            Promise.all(promises).then(() => {
                zip.generateAsync({type: 'blob'}).then(content => {
                    const link = document.createElement('a');
                    link.download = `grid-images-${Date.now()}.zip`;
                    link.href = URL.createObjectURL(content);
                    link.click();
                });
            });
        }
    }

    // 创建预览图片（返回 Promise）
    function createPreviewImage(gridPreview) {
        return new Promise(resolve => {
            const canvas = document.createElement('canvas');
            const width = 3000;
            canvas.width = width;
            canvas.height = (width / 3) * 4;

            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const cellWidth = canvas.width / selectedTemplate.cols;
            const cellHeight = canvas.height / selectedTemplate.rows;
            const gap = Math.floor(width / 750);

            const drawPromises = Array.from(gridPreview.querySelectorAll('.grid-cell')).map((cell, index) => {
                return new Promise((resolve) => {
                    const img = cell.querySelector('img');
                    if (!img) {
                        resolve();
                        return;
                    }

                    const row = Math.floor(index / selectedTemplate.cols);
                    const col = index % selectedTemplate.cols;
                    const x = col * (cellWidth + gap);
                    const y = row * (cellHeight + gap);

                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCanvas.width = cellWidth;
                    tempCanvas.height = cellHeight;

                    if (img.complete) {
                        tempCtx.drawImage(img, 0, 0, cellWidth, cellHeight);
                        ctx.drawImage(tempCanvas, x, y);
                        resolve();
                    } else {
                        img.onload = () => {
                            tempCtx.drawImage(img, 0, 0, cellWidth, cellHeight);
                            ctx.drawImage(tempCanvas, x, y);
                            resolve();
                        };
                    }
                });
            });

            Promise.all(drawPromises).then(() => {
                resolve(canvas.toDataURL('image/png'));
            });
        });
    }

    // 初始化模板
    initializeTemplates();

    // 更新选中计数
    function updateSelectedCount() {
        selectedCount.textContent = `已选择: ${selectedImages.size}`;
    }

    // 处理文件上传
    function handleFiles(files) {
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // 创建预览元素
                    const previewContainer = document.createElement('div');
                    previewContainer.className = 'preview-image';
                    
                    // 创建图片元素
                    const previewImg = document.createElement('img');
                    previewImg.src = e.target.result;
                    
                    // 创建删除按钮
                    const deleteBtn = document.createElement('div');
                    deleteBtn.className = 'delete-btn';
                    deleteBtn.innerHTML = '×';
                    deleteBtn.onclick = (e) => {
                        e.stopPropagation();
                        const index = uploadedImages.indexOf(img);
                        if (index > -1) {
                            // 删除图片前，检查是否被选中
                            if (selectedImages.has(img)) {
                                selectedImages.delete(img);
                                updateSelectedCount();
                            }
                            uploadedImages.splice(index, 1);
                            previewContainer.remove();
                        }
                    };
                    
                    // 添加点击选择功能
                    previewContainer.onclick = () => {
                        if (selectedImages.has(img)) {
                            selectedImages.delete(img);
                            previewContainer.classList.remove('selected');
                        } else {
                            selectedImages.add(img);
                            previewContainer.classList.add('selected');
                        }
                        updateSelectedCount();
                        
                        // 启用生成预览按钮（如果已选择模板）
                        const generatePreviewBtn = document.querySelector('.preview-container').previousElementSibling;
                        generatePreviewBtn.disabled = !selectedTemplate || selectedImages.size === 0;
                    };
                    
                    // 组装预览元素
                    previewContainer.appendChild(deleteBtn);
                    previewContainer.appendChild(previewImg);
                    
                    // 添加到预览列表
                    imagesList.insertBefore(previewContainer, imagesList.firstChild);
                    
                    // 保存图片对象
                    uploadedImages.unshift(img);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // 文件输入处理
    imageInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // 拖放处理
    imageUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageUpload.dataset.state = 'dragover';
    });

    imageUpload.addEventListener('dragleave', (e) => {
        e.preventDefault();
        imageUpload.dataset.state = 'empty';
    });

    imageUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        imageUpload.dataset.state = 'empty';
        handleFiles(e.dataTransfer.files);
    });
}); 