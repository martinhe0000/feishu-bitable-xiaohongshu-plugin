// 测试优化后的数据提取功能

const testUrl = 'https://www.xiaohongshu.com/explore/69c625bc000000002302002b?xsec_token=ABeMKovEW99tFDvz5ituqQEhJZbr3c9XH4qVOnP0gRBQg=&xsec_source=pc_feed';

// 从localStorage获取保存的Cookie
const savedCookie = localStorage.getItem('xiaohongshu_cookie');

if (!savedCookie) {
  console.error('请先在插件中保存小红书Cookie');
} else {
  console.log('使用保存的Cookie进行测试');
  
  // 解析链接
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
        likes: note.likes || note.like_count || note.likeCount || '0',
        collects: note.collects || note.collect_count || note.collectCount || '0',
        shares: note.shares || note.share_count || note.shareCount || '0',
        comments: note.comments || note.comment_count || note.commentCount || '0',
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

  // 执行测试
  async function runTest() {
    console.log('=== 开始测试优化后的数据提取功能 ===');
    
    try {
      // 解析链接
      const noteId = parseNoteUrl(testUrl);
      if (!noteId) {
        console.error('无法解析小红书笔记链接');
        return;
      }
      
      // 提取数据
      console.log('开始提取笔记数据...');
      const noteData = await extractNoteData(noteId, savedCookie, testUrl);
      
      console.log('=== 测试成功 ===');
      console.log('提取的数据:');
      console.log('标题:', noteData.title);
      console.log('作者:', noteData.author);
      console.log('发布时间:', noteData.publishTime);
      console.log('笔记类型:', noteData.noteType);
      console.log('文案内容:', noteData.content);
      console.log('点赞:', noteData.likes);
      console.log('收藏:', noteData.collects);
      console.log('转发:', noteData.shares);
      console.log('评论:', noteData.comments);
      console.log('封面链接:', noteData.coverImage);
    } catch (error) {
      console.error('=== 测试失败 ===');
      console.error('错误:', error.message);
    }
  }

  runTest();
}
