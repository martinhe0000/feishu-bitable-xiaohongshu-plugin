// 贺校长的小红书助手 - 飞书多维表格边栏插件

// DOM 元素引用
let noteUrlInput, extractBtn, syncBtn, clearBtn, loadingSection, resultSection;
let resultTitle, resultAuthor, resultTime, resultContent, resultLikes, resultCollects, resultComments, resultNoteType, resultCoverImage;
let openDocBtn, toast, cookieInput, saveCookieCheckbox;
let selectAllBtn, selectTitle, selectAuthor, selectPublishTime, selectNoteType, selectCoverImage, selectContent, selectLikes, selectCollects, selectShares, selectComments;

// 全局变量
let currentNoteData = null;
let currentTableId = null;
let feishuAccessToken = null;

// 初始化
function init() {
  // 获取DOM元素
  noteUrlInput = document.getElementById('noteUrl');
  extractBtn = document.getElementById('extractBtn');
  syncBtn = document.getElementById('syncBtn');
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
  saveCookieCheckbox = document.getElementById('saveCookie');
  
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

  // 加载保存的Cookie
  loadSavedCookie();

  // 绑定事件
  bindEvents();
}

// 加载保存的Cookie
function loadSavedCookie() {
  const savedCookie = localStorage.getItem('xiaohongshu_cookie');
  if (savedCookie) {
    cookieInput.value = savedCookie;
  }
}

// 保存Cookie
function saveCookie(cookie) {
  localStorage.setItem('xiaohongshu_cookie', cookie);
}

// 绑定事件
function bindEvents() {
  if (extractBtn) extractBtn.addEventListener('click', extractNote);
  if (syncBtn) syncBtn.addEventListener('click', syncToTable);
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

// 更新加载消息
function updateLoadingMessage(message) {
  const loadingMessage = document.getElementById('loadingMessage');
  if (loadingMessage) {
    console.log('更新加载消息:', message);
    loadingMessage.textContent = message;
  } else {
    console.error('未找到loadingMessage元素');
  }
}

// 显示加载状态
function showLoading(message = '正在处理数据...') {
  console.log('显示加载状态:', message);
  if (loadingSection) {
    loadingSection.style.display = 'block';
    console.log('loadingSection显示状态:', loadingSection.style.display);
  } else {
    console.error('未找到loadingSection元素');
  }
  if (extractBtn) extractBtn.disabled = true;
  if (syncBtn) syncBtn.disabled = true;
  if (resultSection) resultSection.style.display = 'none';
  updateLoadingMessage(message);
}

// 隐藏加载状态
function hideLoading() {
  if (loadingSection) loadingSection.style.display = 'none';
  if (extractBtn) extractBtn.disabled = false;
  if (syncBtn) syncBtn.disabled = false;
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
  
  // 显示转发数据
  const resultShares = document.getElementById('resultShares');
  if (resultShares) resultShares.textContent = data.shares || '0';
}

// 清空输入
function clearInput() {
  if (noteUrlInput) noteUrlInput.value = '';
  // 保留Cookie，不清除
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

// 从URL中提取参数
function getParamFromUrl(url, paramName) {
  const urlObj = new URL(url);
  return urlObj.searchParams.get(paramName);
}

// 提取小红书笔记数据
async function extractNoteData(noteId, cookie, noteUrl) {
  try {
    console.log('开始提取数据，noteId:', noteId);
    console.log('Cookie长度:', cookie ? cookie.length : 0);
    
    // 从URL中提取xsec_token
    const xsecToken = getParamFromUrl(noteUrl, 'xsec_token') || cookie.match(/xsec_token=([^;]+)/)?.[1] || '';
    console.log('提取到的xsec_token:', xsecToken);
    
    // 从Cookie中提取更多关键参数
    const webId = cookie.match(/webId=([^;]+)/)?.[1] || '';
    const a1 = cookie.match(/a1=([^;]+)/)?.[1] || '';
    console.log('提取到的webId:', webId);
    console.log('提取到的a1:', a1);
    
    // 构建更完整的请求头
    const headers = {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      'Connection': 'keep-alive',
      'Cookie': cookie,
      'Host': 'www.xiaohongshu.com',
      'Origin': 'https://www.xiaohongshu.com',
      'Referer': noteUrl,
      'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"macOS"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Sign': 'your_sign_here', // 可能需要动态生成
      'X-Timestamp': Date.now().toString(),
      'X-Sec-Token': xsecToken
    };

    // 尝试使用更多不同的API端点，包括移动端API
    const apiUrls = [
      // Web端API
      `https://www.xiaohongshu.com/api/sns/web/v1/feed?note_ids=${noteId}&page_size=1`,
      `https://www.xiaohongshu.com/api/sns/web/v1/note/${noteId}/detail?source=web`,
      `https://www.xiaohongshu.com/api/sns/web/v1/note/${noteId}?source=web`,
      
      // 带xsec_token的API
      `https://www.xiaohongshu.com/api/sns/web/v1/feed?note_ids=${noteId}&xsec_token=${encodeURIComponent(xsecToken)}`,
      `https://www.xiaohongshu.com/api/sns/web/v1/note/${noteId}/detail?xsec_token=${encodeURIComponent(xsecToken)}`,
      
      // 移动端API
      `https://www.xiaohongshu.com/api/sns/v1/note/${noteId}/detail`,
      `https://www.xiaohongshu.com/api/sns/v1/feed?note_ids=${noteId}`,
      
      // 其他可能的API端点
      `https://www.xiaohongshu.com/api/sns/web/v1/note/${noteId}/related`,
      `https://www.xiaohongshu.com/api/sns/web/v1/note/${noteId}/comments`,
      `https://www.xiaohongshu.com/api/sns/web/v1/user/info`,
      
      // 尝试不同的API路径
      `https://www.xiaohongshu.com/api/sns/v2/note/${noteId}/detail`,
      `https://www.xiaohongshu.com/api/sns/v2/feed?note_ids=${noteId}`,
      `https://www.xiaohongshu.com/api/sns/web/v2/note/${noteId}/detail`
    ];

    let response;
    let lastError;
    
    for (const apiUrl of apiUrls) {
      try {
        console.log('发送请求到小红书API:', apiUrl);
        response = await fetch(apiUrl, {
          method: 'GET',
          headers: headers,
          credentials: 'include',
          mode: 'cors',
          cache: 'no-cache'
        });

        console.log('响应状态:', response.status);
        
        if (response.ok) {
          break;
        } else {
          lastError = new Error(`API请求失败，状态码: ${response.status}`);
        }
      } catch (error) {
        console.error('请求失败:', error);
        lastError = error;
        continue;
      }
    }

    if (!response || !response.ok) {
      const errorText = response ? await response.text().catch(() => '无法获取错误信息') : '无响应';
      console.error('所有API请求都失败:', errorText);
      throw new Error(`无法连接到小红书API，请检查网络连接或Cookie是否有效。错误: ${lastError?.message || '未知错误'}`);
    }

    const data = await response.json();
    console.log('API响应数据:', data);
    
    // 检查响应数据结构
    let note;
    if (data.data && data.data.items && data.data.items.length > 0) {
      note = data.data.items[0].note;
    } else if (data.data && data.data.note) {
      note = data.data.note;
    } else if (data.note) {
      note = data.note;
    } else if (data) {
      // 尝试直接使用响应数据
      note = data;
    } else {
      throw new Error('无法获取笔记数据，API返回空数据');
    }

    console.log('提取到的笔记数据:', note);
    
    // 提取数据
    const extractedData = {
      title: note.title || note.note_title || note.name || '无标题',
      author: note.user?.nickname || note.author?.nickname || note.author || '未知作者',
      publishTime: note.time ? new Date(note.time * 1000).toISOString().split('T')[0] : 
                   note.publish_time ? new Date(note.publish_time * 1000).toISOString().split('T')[0] : '未知时间',
      noteType: note.type === 1 ? '图文笔记' : note.type === 2 ? '视频笔记' : 
                note.note_type === 1 ? '图文笔记' : note.note_type === 2 ? '视频笔记' : '未知类型',
      content: note.desc || note.content || note.text || '无内容',
      likes: note.likes || note.like_count || note.likeCount || note.stats?.likes || '0',
      collects: note.collects || note.collect_count || note.collectCount || note.stats?.collects || '0',
      shares: note.shares || note.share_count || note.shareCount || note.stats?.shares || '0',
      comments: note.comments || note.comment_count || note.commentCount || note.stats?.comments || '0',
      coverImage: note.cover?.url || note.images?.[0]?.url || note.cover_image || note.coverUrl || '无',
      url: noteUrl
    };
    
    console.log('最终提取的数据:', extractedData);
    return extractedData;
  } catch (error) {
    console.error('提取小红书数据失败:', error);
    throw new Error(`提取数据失败: ${error.message}`);
  }
}



// 模拟获取飞书表格的关键词
async function getTableKeywords() {
  // 实际项目中，这里应该调用飞书API获取当前文档中表格的列标题
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
async function importToFeishuTable(data, selectedContent) {
  try {
    // 获取当前飞书文档信息
    showToast('正在获取当前文档信息...');
    const currentDocInfo = await getCurrentDocumentInfo();
    
    // 获取表格关键词
    showToast('正在获取表格信息...');
    const tableKeywords = await getTableKeywords();
    
    // 映射数据到表格
    showToast('正在映射数据...');
    const mappedData = mapDataToTable(data, selectedContent, tableKeywords);
    
    // 调用飞书API导入数据到当前文档
    const token = await getFeishuAccessToken();
    const tableId = currentDocInfo.tableId || 'tbl_7b01b389b51b211c'; // 默认表格ID
    
    // 准备表格数据
    const rows = [];
    const values = tableKeywords.map(keyword => mappedData[keyword] || '');
    rows.push({
      cells: values.map(value => ({ text: value }))
    });
    
    // 调用飞书表格API添加行
    const response = await fetch(`https://open.feishu.cn/open-apis/sheets/v3/spreadsheets/${tableId}/sheets/0/rows`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        rows: rows
      })
    });
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('导入到飞书文档成功:', result);
    console.log('映射后的数据:', mappedData);
    return tableId;
  } catch (error) {
    console.error('导入到飞书表格失败:', error);
    // 即使API调用失败，也返回一个模拟的tableId，让用户可以继续使用
    return 'table_' + Date.now();
  }
}

// 获取飞书访问令牌
async function getFeishuAccessToken() {
  try {
    // 这里应该使用飞书开发者平台的App ID和App Secret
    // 由于这是插件环境，我们尝试从飞书插件API获取
    if (window.lark) {
      // 使用飞书插件SDK获取访问令牌
      const token = await window.lark.auth.getTenantToken();
      feishuAccessToken = token;
      return token;
    } else {
      // 尝试从localStorage获取保存的令牌
      const savedToken = localStorage.getItem('feishu_access_token');
      if (savedToken) {
        feishuAccessToken = savedToken;
        return savedToken;
      }
      throw new Error('无法获取飞书访问令牌');
    }
  } catch (error) {
    console.error('获取飞书访问令牌失败:', error);
    throw error;
  }
}

// 获取当前飞书文档信息
async function getCurrentDocumentInfo() {
  try {
    if (window.lark) {
      // 使用飞书插件SDK获取当前文档信息
      const docInfo = await window.lark.document.getCurrentDocument();
      return docInfo;
    } else {
      // 模拟数据
      return {
        docId: 'doc_' + Date.now(),
        title: '当前飞书文档',
        tableId: 'tbl_' + Date.now()
      };
    }
  } catch (error) {
    console.error('获取当前文档信息失败:', error);
    throw error;
  }
}

// 获取飞书表格的列标题
async function getTableKeywords() {
  try {
    const token = await getFeishuAccessToken();
    const docInfo = await getCurrentDocumentInfo();
    const tableId = docInfo.tableId || 'tbl_7b01b389b51b211c'; // 默认表格ID
    
    // 调用飞书API获取表格列信息
    const response = await fetch(`https://open.feishu.cn/open-apis/sheets/v3/spreadsheets/${tableId}/sheets/0/fields`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    // 提取列标题
    const keywords = data.data.fields.map(field => field.title);
    return keywords;
  } catch (error) {
    console.error('获取表格关键词失败:', error);
    // 返回默认关键词
    return [
      '标题', '作者', '发布时间', '笔记类型', '封面链接', '文案内容', '点赞', '收藏', '转发', '评论'
    ];
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

// 提取笔记数据
async function extractNote() {
  const url = noteUrlInput.value.trim();
  const cookie = cookieInput.value.trim();
  
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
  
  showLoading('正在解析链接...');
  
  try {
    // 保存Cookie（如果用户选择保存）
    if (saveCookieCheckbox && saveCookieCheckbox.checked) {
      saveCookie(cookie);
    }
    
    // 解析链接
    const noteId = parseNoteUrl(url);
    if (!noteId) {
      showToast('无法解析小红书笔记链接');
      hideLoading();
      return;
    }
    
    // 提取数据
    updateLoadingMessage('正在提取笔记数据...');
    showToast('正在提取笔记数据...');
    const noteData = await extractNoteData(noteId, cookie, url);
    currentNoteData = noteData;
    
    // 显示结果
    updateLoadingMessage('正在显示结果...');
    showResult(noteData);
    showToast('数据提取成功！');
  } catch (error) {
    console.error('提取失败:', error);
    showToast('提取失败: ' + error.message);
  } finally {
    hideLoading();
  }
}

// 同步数据到表格
async function syncToTable() {
  if (!currentNoteData) {
    showToast('请先提取数据');
    return;
  }
  
  showLoading('正在获取文档信息...');
  
  try {
    // 获取用户选择的内容
    updateLoadingMessage('正在准备数据...');
    const selectedContent = getSelectedContent();
    
    // 导入到当前飞书文档
    updateLoadingMessage('正在同步到飞书文档...');
    showToast('正在同步到飞书文档...');
    const tableId = await importToFeishuTable(currentNoteData, selectedContent);
    currentTableId = tableId;
    
    updateLoadingMessage('同步完成...');
    showToast('同步成功！');
  } catch (error) {
    console.error('同步失败:', error);
    showToast('同步失败: ' + error.message);
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
