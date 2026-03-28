// 贺校长的小红书助手 - 飞书多维表格边栏插件

// DOM 元素引用
let noteUrlInput, importBtn, clearBtn, loadingSection, resultSection;
let resultTitle, resultAuthor, resultTime, resultContent, resultLikes, resultCollects, resultComments, resultNoteType, resultCoverImage;
let openDocBtn, toast, configToggle, toggleSwitch, configPanel, saveConfigBtn;
let feishuAppId, feishuAppToken, feishuTableId, cookieInput, tableInput;
let selectAllBtn, selectTitle, selectAuthor, selectPublishTime, selectNoteType, selectCoverImage, selectContent, selectLikes, selectCollects, selectShares, selectComments;

// 全局变量
let currentNoteData = null;
let currentDocId = null;
let feishuConfig = null;

// 初始化
function init() {
  // 获取DOM元素
  noteUrlInput = document.getElementById('noteUrl');
  importBtn = document.getElementById('importBtn');
  clearBtn = document.getElementById('clearBtn');
  loadingSection = document.getElementById('loadingSection');
  resultSection = document.getElementById('resultSection');
  
  resultTitle = document.getElementById('resultTitle');
  resultAuthor = document.getElementById('resultAuthor');
  resultTime = document.getElementById('resultTime');
  resultContent = document.getElementById('resultContent');
  resultLikes = document.getElementById('resultLikes');
  resultCollects = document.getElementById('resultCollects');
  resultComments = document.getElementById('resultComments');
  resultNoteType = document.getElementById('resultNoteType');
  resultCoverImage = document.getElementById('resultCoverImage');
  
  openDocBtn = document.getElementById('openDocBtn');
  toast = document.getElementById('toast');
  
  // 配置面板
  configToggle = document.getElementById('configToggle');
  toggleSwitch = document.getElementById('toggleSwitch');
  configPanel = document.getElementById('configPanel');
  saveConfigBtn = document.getElementById('saveConfigBtn');
  feishuAppId = document.getElementById('feishuAppId');
  feishuAppToken = document.getElementById('feishuAppToken');
  feishuTableId = document.getElementById('feishuTableId');
  
  // Cookie输入
  cookieInput = document.getElementById('cookieInput');
  
  // 内容选择
  selectAllBtn = document.getElementById('selectAllBtn');
  selectTitle = document.getElementById('selectTitle');
  selectAuthor = document.getElementById('selectAuthor');
  selectPublishTime = document.getElementById('selectPublishTime');
  selectNoteType = document.getElementById('selectNoteType');
  selectCoverImage = document.getElementById('selectCoverImage');
  selectContent = document.getElementById('selectContent');
  selectLikes = document.getElementById('selectLikes');
  selectCollects = document.getElementById('selectCollects');
  selectShares = document.getElementById('selectShares');
  selectComments = document.getElementById('selectComments');
  
  // 表格输入
  tableInput = document.getElementById('tableInput');

  // 绑定事件
  bindEvents();
  
  // 加载配置
  loadConfig();
}

// 绑定事件
function bindEvents() {
  if (importBtn) importBtn.addEventListener('click', importNote);
  if (clearBtn) clearBtn.addEventListener('click', clearInput);
  if (openDocBtn) openDocBtn.addEventListener('click', openDocument);
  if (noteUrlInput) noteUrlInput.addEventListener('paste', handlePaste);
  
  // 配置面板
  if (configToggle) configToggle.addEventListener('click', toggleConfigPanel);
  if (saveConfigBtn) saveConfigBtn.addEventListener('click', saveConfig);
  
  // 全选功能
  if (selectAllBtn) selectAllBtn.addEventListener('click', toggleSelectAll);
}

// 处理粘贴事件
function handlePaste(e) {
  const text = e.clipboardData.getData('text');
  if (text.includes('xiaohongshu.com')) {
    noteUrlInput.value = text.trim();
  }
}

// 显示Toast提示
function showToast(message, duration = 2000) {
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }
}

// 显示加载状态
function showLoading() {
  if (loadingSection) loadingSection.style.display = 'block';
  if (importBtn) importBtn.disabled = true;
  if (resultSection) resultSection.style.display = 'none';
}

// 隐藏加载状态
function hideLoading() {
  if (loadingSection) loadingSection.style.display = 'none';
  if (importBtn) importBtn.disabled = false;
}

// 显示结果
function showResult(data) {
  if (resultSection) resultSection.style.display = 'block';
  
  if (resultTitle) resultTitle.textContent = data.title || '无标题';
  if (resultAuthor) resultAuthor.textContent = data.author || '未知作者';
  if (resultTime) resultTime.textContent = data.publishTime || '未知时间';
  if (resultContent) resultContent.textContent = data.content || '无内容';
  if (resultLikes) resultLikes.textContent = data.likes || '0';
  if (resultCollects) resultCollects.textContent = data.collects || '0';
  if (resultComments) resultComments.textContent = data.comments || '0';
  if (resultNoteType) resultNoteType.textContent = data.noteType || '未知';
  if (resultCoverImage) resultCoverImage.textContent = data.coverImage || '无';
}

// 清空输入
function clearInput() {
  if (noteUrlInput) noteUrlInput.value = '';
  if (cookieInput) cookieInput.value = '';
  if (tableInput) tableInput.value = '';
  if (resultSection) resultSection.style.display = 'none';
  currentNoteData = null;
  currentDocId = null;
}

// 切换配置面板
function toggleConfigPanel() {
  if (toggleSwitch) toggleSwitch.classList.toggle('active');
  if (configPanel) configPanel.classList.toggle('show');
}

// 保存配置
function saveConfig() {
  const config = {
    appId: feishuAppId ? feishuAppId.value.trim() : '',
    appToken: feishuAppToken ? feishuAppToken.value.trim() : '',
    tableId: feishuTableId ? feishuTableId.value.trim() : ''
  };
  
  if (!config.appId || !config.appToken || !config.tableId) {
    showToast('请填写所有配置项');
    return;
  }
  
  try {
    localStorage.setItem('feishuConfig', JSON.stringify(config));
    feishuConfig = config;
    showToast('配置保存成功！');
  } catch (error) {
    console.error('保存配置失败:', error);
    showToast('保存配置失败');
  }
}

// 加载配置
function loadConfig() {
  try {
    const config = localStorage.getItem('feishuConfig');
    if (config) {
      feishuConfig = JSON.parse(config);
      if (feishuAppId) feishuAppId.value = feishuConfig.appId || '';
      if (feishuAppToken) feishuAppToken.value = feishuConfig.appToken || '';
      if (feishuTableId) feishuTableId.value = feishuConfig.tableId || '';
    }
  } catch (error) {
    console.log('加载配置失败:', error);
  }
}

// 切换全选
function toggleSelectAll() {
  const isAllSelected = selectTitle.checked && selectAuthor.checked && selectPublishTime.checked &&
                       selectNoteType.checked && selectCoverImage.checked && selectContent.checked &&
                       selectLikes.checked && selectCollects.checked && selectShares.checked && selectComments.checked;
  
  const newValue = !isAllSelected;
  
  selectTitle.checked = newValue;
  selectAuthor.checked = newValue;
  selectPublishTime.checked = newValue;
  selectNoteType.checked = newValue;
  selectCoverImage.checked = newValue;
  selectContent.checked = newValue;
  selectLikes.checked = newValue;
  selectCollects.checked = newValue;
  selectShares.checked = newValue;
  selectComments.checked = newValue;
  
  selectAllBtn.textContent = newValue ? '取消全选' : '全选';
}

// 获取用户选择的内容
function getSelectedContent() {
  return {
    title: selectTitle ? selectTitle.checked : false,
    author: selectAuthor ? selectAuthor.checked : false,
    publishTime: selectPublishTime ? selectPublishTime.checked : false,
    noteType: selectNoteType ? selectNoteType.checked : false,
    coverImage: selectCoverImage ? selectCoverImage.checked : false,
    content: selectContent ? selectContent.checked : false,
    likes: selectLikes ? selectLikes.checked : false,
    collects: selectCollects ? selectCollects.checked : false,
    shares: selectShares ? selectShares.checked : false,
    comments: selectComments ? selectComments.checked : false
  };
}

// 解析小红书笔记链接
function parseNoteUrl(url) {
  console.log('解析链接:', url);
  
  // 提取笔记ID，支持多种链接格式
  const patterns = [
    /note\/(\w+)/,           // 基本格式
    /note\/(\w+)\?/,          // 带查询参数
    /note\/(\w+)\/?/,         // 末尾可能有斜杠
    /note\/(\w+)\/detail/,      // 可能包含detail路径
    /explore\/(\w+)/,          // explore页面格式
    /explore\/(\w+)\?/          // 带查询参数的explore页面
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      console.log('匹配成功:', pattern, '结果:', match[1]);
      return match[1];
    }
  }
  
  console.log('所有模式都匹配失败');
  return null;
}

// 模拟提取小红书笔记数据
async function extractNoteData(noteId, cookie) {
  // 实际项目中，这里应该使用cookie调用小红书API或使用爬虫提取数据
  // 这里使用模拟数据
  return {
    title: '测试笔记标题',
    author: '测试作者',
    publishTime: '2024-01-01',
    noteType: '图文笔记',
    content: '这是测试笔记的文案内容，包含丰富的信息和描述。',
    likes: '1000',
    collects: '500',
    shares: '200',
    comments: '100',
    coverImage: 'https://example.com/cover.jpg',
    url: `https://xiaohongshu.com/note/${noteId}`
  };
}

// 创建飞书文档并导入数据
async function createFeishuDocument(data, selectedContent, tablePosition) {
  try {
    // 实际项目中，这里应该调用飞书API创建文档
    // 这里使用模拟数据
    const docId = 'doc_' + Date.now();
    console.log('创建飞书文档:', docId);
    console.log('导入数据:', data);
    console.log('选择的内容:', selectedContent);
    console.log('表格位置:', tablePosition);
    return docId;
  } catch (error) {
    console.error('创建飞书文档失败:', error);
    throw error;
  }
}

// 打开飞书文档
function openDocument() {
  if (!currentDocId) {
    showToast('请先导入数据');
    return;
  }
  
  // 实际项目中，这里应该打开飞书文档
  showToast('打开飞书文档: ' + currentDocId);
}

// 导入笔记
async function importNote() {
  const url = noteUrlInput.value.trim();
  const cookie = cookieInput.value.trim();
  const tablePosition = tableInput.value.trim();
  
  if (!url) {
    showToast('请输入小红书笔记链接');
    return;
  }
  
  if (!url.includes('xiaohongshu.com')) {
    showToast('请输入有效的小红书笔记链接');
    return;
  }
  
  if (!cookie) {
    showToast('请输入小红书Cookie');
    return;
  }
  
  if (!tablePosition) {
    showToast('请输入表格位置');
    return;
  }
  
  showLoading();
  
  try {
    // 解析链接
    const noteId = parseNoteUrl(url);
    if (!noteId) {
      showToast('无法解析小红书笔记链接');
      hideLoading();
      return;
    }
    
    // 获取用户选择的内容
    const selectedContent = getSelectedContent();
    
    // 提取数据
    showToast('正在提取笔记数据...');
    const noteData = await extractNoteData(noteId, cookie);
    currentNoteData = noteData;
    
    // 创建飞书文档
    showToast('正在创建飞书文档...');
    const docId = await createFeishuDocument(noteData, selectedContent, tablePosition);
    currentDocId = docId;
    
    // 显示结果
    showResult(noteData);
    showToast('导入成功！');
  } catch (error) {
    console.error('导入失败:', error);
    showToast('导入失败: ' + error.message);
  } finally {
    hideLoading();
  }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
