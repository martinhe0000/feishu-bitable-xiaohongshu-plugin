// 贺校长的小红书助手 - 飞书多维表格边栏插件

// DOM 元素引用
let noteUrlInput, importBtn, clearBtn, loadingSection, resultSection;
let resultTitle, resultAuthor, resultTime, resultContent, resultLikes, resultCollects, resultComments, resultNoteType, resultCoverImage;
let openDocBtn, toast, cookieInput, tableInput;
let selectAllBtn, selectTitle, selectAuthor, selectPublishTime, selectNoteType, selectCoverImage, selectContent, selectLikes, selectCollects, selectShares, selectComments;

// 全局变量
let currentNoteData = null;
let currentTableId = null;

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
}

// 绑定事件
function bindEvents() {
  if (importBtn) importBtn.addEventListener('click', importNote);
  if (clearBtn) clearBtn.addEventListener('click', clearInput);
  if (openDocBtn) openDocBtn.addEventListener('click', openDocument);
  if (noteUrlInput) noteUrlInput.addEventListener('paste', handlePaste);
  
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
  currentTableId = null;
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

// 提取小红书笔记数据
async function extractNoteData(noteId, cookie) {
  try {
    // 构建请求头
    const headers = {
      'Content-Type': 'application/json',
      'Cookie': cookie,
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': `https://www.xiaohongshu.com/note/${noteId}`,
      'X-Requested-With': 'XMLHttpRequest'
    };

    // 发送请求到小红书API
    const response = await fetch(`https://www.xiaohongshu.com/api/sns/web/v1/feed?note_ids=${noteId}`, {
      method: 'GET',
      headers: headers,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // 检查响应数据结构
    if (!data.data || !data.data.items || data.data.items.length === 0) {
      throw new Error('无法获取笔记数据');
    }

    const note = data.data.items[0].note;
    
    // 提取数据
    return {
      title: note.title || '无标题',
      author: note.user.nickname || '未知作者',
      publishTime: new Date(note.time * 1000).toISOString().split('T')[0] || '未知时间',
      noteType: note.type === 1 ? '图文笔记' : note.type === 2 ? '视频笔记' : '未知类型',
      content: note.desc || '无内容',
      likes: note.likes || '0',
      collects: note.collects || '0',
      shares: note.shares || '0',
      comments: note.comments || '0',
      coverImage: note.cover?.url || note.images?.[0]?.url || '无',
      url: `https://xiaohongshu.com/note/${noteId}`
    };
  } catch (error) {
    console.error('提取小红书数据失败:', error);
    // 如果API请求失败，返回错误信息
    throw new Error(`提取数据失败: ${error.message}`);
  }
}

// 模拟获取飞书表格的关键词
async function getTableKeywords(tablePosition) {
  // 实际项目中，这里应该调用飞书API获取表格的列标题
  // 这里使用模拟数据
  return [
    '标题', '作者', '发布时间', '笔记类型', '封面链接', '文案内容', '点赞', '收藏', '转发', '评论'
  ];
}

// 自动根据表格关键词填充数据
function mapDataToTable(data, selectedContent, tableKeywords) {
  const mappedData = {};
  
  // 关键词映射
  const keywordMap = {
    '标题': 'title',
    '作者': 'author',
    '发布时间': 'publishTime',
    '笔记类型': 'noteType',
    '封面链接': 'coverImage',
    '文案内容': 'content',
    '点赞': 'likes',
    '收藏': 'collects',
    '转发': 'shares',
    '评论': 'comments'
  };
  
  // 根据表格关键词和用户选择的内容映射数据
  tableKeywords.forEach(keyword => {
    const field = keywordMap[keyword];
    if (field && selectedContent[field]) {
      mappedData[keyword] = data[field] || '';
    }
  });
  
  return mappedData;
}

// 导入数据到飞书表格
async function importToFeishuTable(data, selectedContent, tablePosition) {
  try {
    // 获取表格关键词
    showToast('正在获取表格信息...');
    const tableKeywords = await getTableKeywords(tablePosition);
    
    // 映射数据到表格
    showToast('正在映射数据...');
    const mappedData = mapDataToTable(data, selectedContent, tableKeywords);
    
    // 实际项目中，这里应该调用飞书API导入数据
    // 这里使用模拟数据
    const tableId = 'table_' + Date.now();
    console.log('导入到飞书表格:', tableId);
    console.log('映射后的数据:', mappedData);
    console.log('表格位置:', tablePosition);
    return tableId;
  } catch (error) {
    console.error('导入到飞书表格失败:', error);
    throw error;
  }
}

// 打开飞书表格
function openDocument() {
  if (!currentTableId) {
    showToast('请先导入数据');
    return;
  }
  
  // 实际项目中，这里应该打开飞书表格
  showToast('打开飞书表格: ' + currentTableId);
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
    
    // 导入到飞书表格
    showToast('正在导入到飞书表格...');
    const tableId = await importToFeishuTable(noteData, selectedContent, tablePosition);
    currentTableId = tableId;
    
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
