// 贺校长的小红书助手 - 飞书多维表格边栏插件

// DOM 元素引用
let noteUrlInput, importBtn, clearBtn, loadingSection, resultSection;
let resultTitle, resultAuthor, resultTime, resultContent, resultLikes, resultCollects, resultComments;
let openDocBtn, toast;

// 全局变量
let currentNoteData = null;
let currentDocId = null;

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
  
  openDocBtn = document.getElementById('openDocBtn');
  toast = document.getElementById('toast');

  // 绑定事件
  bindEvents();
}

// 绑定事件
function bindEvents() {
  if (importBtn) importBtn.addEventListener('click', importNote);
  if (clearBtn) clearBtn.addEventListener('click', clearInput);
  if (openDocBtn) openDocBtn.addEventListener('click', openDocument);
  if (noteUrlInput) noteUrlInput.addEventListener('paste', handlePaste);
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
}

// 清空输入
function clearInput() {
  if (noteUrlInput) noteUrlInput.value = '';
  if (resultSection) resultSection.style.display = 'none';
  currentNoteData = null;
  currentDocId = null;
}

// 解析小红书笔记链接
function parseNoteUrl(url) {
  // 提取笔记ID，支持多种链接格式
  const patterns = [
    /note\/(\w+)/,           // 基本格式
    /note\/(\w+)\?/,          // 带查询参数
    /note\/(\w+)\/?/,         // 末尾可能有斜杠
    /note\/(\w+)\/detail/      // 可能包含detail路径
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

// 模拟提取小红书笔记数据
async function extractNoteData(noteId) {
  // 实际项目中，这里应该调用小红书API或使用爬虫提取数据
  // 这里使用模拟数据
  return {
    title: '测试笔记标题',
    author: '测试作者',
    publishTime: '2024-01-01',
    content: '这是测试笔记的文案内容，包含丰富的信息和描述。',
    likes: '1000',
    collects: '500',
    comments: '100',
    coverImage: 'https://example.com/cover.jpg',
    url: `https://xiaohongshu.com/note/${noteId}`
  };
}

// 创建飞书文档并导入数据
async function createFeishuDocument(data) {
  try {
    // 实际项目中，这里应该调用飞书API创建文档
    // 这里使用模拟数据
    const docId = 'doc_' + Date.now();
    console.log('创建飞书文档:', docId);
    console.log('导入数据:', data);
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
  
  if (!url) {
    showToast('请输入小红书笔记链接');
    return;
  }
  
  if (!url.includes('xiaohongshu.com')) {
    showToast('请输入有效的小红书笔记链接');
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
    
    // 提取数据
    showToast('正在提取笔记数据...');
    const noteData = await extractNoteData(noteId);
    currentNoteData = noteData;
    
    // 创建飞书文档
    showToast('正在创建飞书文档...');
    const docId = await createFeishuDocument(noteData);
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
