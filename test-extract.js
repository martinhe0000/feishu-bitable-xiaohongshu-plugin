// 测试数据提取功能
const noteUrl = 'https://www.xiaohongshu.com/explore/69ba6d420000000021007e22?xsec_token=ABoc5fqS23xE2ZSMjcL-jFoX4VXpGo8yD7i-a6KNZrg_Y=&xsec_source=';
const cookie = 'gid=yYfSjYjyS8JKyYfSjYjyYFqWJKCfI1l6y4Ak0TlhEkJ1I4q8F2WEAq888yJy8jJ8WfqYjYjK; a1=195dc858334y211fxomx7j2ncncix1iouuqg471kt00000401284; webId=db4b64f8ecf3cdae84a1fea7a768cfc3; abRequestId=db4b64f8ecf3cdae84a1fea7a768cfc3; sensorsdata2015jssdkcross=%7B%22%24device_id%22%3A%221973a4cc6b620f-02c20e92f58ccc-19525636-1296000-1973a4cc6b71e65%22%7D; _ga=GA1.1.225882672.1750423831; _ga_9TRZKT0XY8=GS2.1.s1767518255$o4$g1$t1767518264$j51$l0$h0; ets=1774495307352; webBuild=6.2.2; xsecappid=xhs-pc-web; unread={%22ub%22:%2269c690e0000000002301dc94%22%2C%22ue%22:%2269c6b35a0000000022002b0d%22%2C%22uc%22:66}; websectiga=cffd9dcea65962b05ab048ac76962acee933d26157113bb213105a116241fa6c; sec_poison_id=be4ca919-f3b1-4c97-b205-a7472bad4b0f; loadts=1774696740671';

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
      'X-Requested-With': 'XMLHttpRequest'
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
      `https://www.xiaohongshu.com/api/sns/web/v1/user/info`
    ];

    let response;
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
        }
      } catch (error) {
        console.error('请求失败:', error);
        continue;
      }
    }

    if (!response || !response.ok) {
      const errorText = response ? await response.text() : '无响应';
      console.error('所有API请求都失败:', errorText);
      throw new Error('无法连接到小红书API，请检查网络连接或Cookie是否有效');
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
    return {
      title: note.title || note.note_title || '无标题',
      author: note.user?.nickname || note.author || '未知作者',
      publishTime: note.time ? new Date(note.time * 1000).toISOString().split('T')[0] : note.publish_time || '未知时间',
      noteType: note.type === 1 ? '图文笔记' : note.type === 2 ? '视频笔记' : note.note_type || '未知类型',
      content: note.desc || note.content || '无内容',
      likes: note.likes || note.like_count || '0',
      collects: note.collects || note.collect_count || '0',
      shares: note.shares || note.share_count || '0',
      comments: note.comments || note.comment_count || '0',
      coverImage: note.cover?.url || note.images?.[0]?.url || note.cover_image || '无',
      url: noteUrl
    };
  } catch (error) {
    console.error('提取小红书数据失败:', error);
    throw new Error(`提取数据失败: ${error.message}`);
  }
}

// 测试函数
async function testExtract() {
  console.log('开始测试数据提取...');
  
  // 解析链接
  const noteId = parseNoteUrl(noteUrl);
  if (!noteId) {
    console.error('无法解析小红书笔记链接');
    return;
  }
  
  // 提取数据
  console.log('提取数据中...');
  const noteData = await extractNoteData(noteId, cookie);
  
  // 显示结果
  console.log('提取结果:', noteData);
  console.log('测试完成！');
}

// 运行测试
testExtract();
