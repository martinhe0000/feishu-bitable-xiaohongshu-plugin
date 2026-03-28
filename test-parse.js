// 测试小红书链接解析功能
function parseNoteUrl(url) {
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
      return match[1];
    }
  }
  return null;
}

// 测试链接
const testUrl = "https://www.xiaohongshu.com/explore/69c625bc000000002302002b?xsec_token=ABeMKovEW99tFDvz5ituqQEhJZbr3c9XH4qVOnP0gRBQg=&xsec_source=pc_feed";

// 测试解析
const result = parseNoteUrl(testUrl);
console.log("测试链接:", testUrl);
console.log("解析结果:", result);
console.log("是否成功:", result !== null);

// 测试其他格式
const otherUrls = [
  "https://www.xiaohongshu.com/note/1234567890",
  "https://xiaohongshu.com/note/1234567890",
  "https://m.xiaohongshu.com/note/1234567890",
  "https://www.xiaohongshu.com/note/1234567890?param=value",
  "https://xiaohongshu.com/note/1234567890/",
  "https://www.xiaohongshu.com/note/1234567890/detail",
  "https://www.xiaohongshu.com/explore/1234567890",
  "https://www.xiaohongshu.com/explore/1234567890?param=value"
];

console.log("\n测试其他链接格式:");
otherUrls.forEach(url => {
  const result = parseNoteUrl(url);
  console.log(`${url} => ${result || "无法解析"}`);
});
