import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

/**
 * 自定义插件：处理 <think></think> 标签
 * 将思考过程标签转换为可收缩的灰色文本区域
 */
function thinkTagPlugin(md) {
  // 生成唯一ID的计数器
  let thinkCounter = 0
  
  // 在最早的阶段处理think标签，避免被其他规则干扰
  md.core.ruler.at('normalize', function(state) {
    let content = state.src
    
    // 首先处理完整的 <think></think> 标签对
    const completeThinkRegex = /<think>([\s\S]*?)<\/think>/g
    content = content.replace(completeThinkRegex, (match, thinkContent) => {
      thinkCounter++
      const thinkId = `think-${thinkCounter}-${Date.now()}`
      
      // 转换为HTML结构，包含可收缩功能
      const processedContent = thinkContent.trim().replace(/\n/g, '<br>')
      return `\n\n<div class="think-container">\n<div class="think-header" onclick="toggleThink('${thinkId}')">\n<span class="think-icon" id="icon-${thinkId}">▼</span>\n<span class="think-title">思考过程</span>\n</div>\n<div class="think-content" id="${thinkId}">\n${processedContent}\n</div>\n</div>\n\n`
    })
    
    // 然后处理单独的 <think> 开始标签（没有对应的结束标签）
    const openThinkRegex = /<think>([\s\S]*?)$/
    if (openThinkRegex.test(content)) {
      content = content.replace(openThinkRegex, (match, thinkContent) => {
        thinkCounter++
        const thinkId = `think-${thinkCounter}-${Date.now()}`
        
        // 处理思考内容，如果有内容则显示，否则显示默认提示
        const processedContent = thinkContent.trim() ? 
          thinkContent.trim().replace(/\n/g, '<br>') : 
          '正在思考中...'
        
        return `\n\n<div class="think-container">\n<div class="think-header" onclick="toggleThink('${thinkId}')">\n<span class="think-icon" id="icon-${thinkId}">▼</span>\n<span class="think-title">思考过程</span>\n</div>\n<div class="think-content" id="${thinkId}">\n${processedContent}\n</div>\n</div>\n\n`
      })
    }
    
    state.src = content
  })
}

// 创建 markdown-it 实例
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(str, { 
          language: lang, 
          ignoreIllegals: true 
        }).value
        // 添加行号和语言标识
        return `<pre class="hljs"><div class="code-header">
          <span class="code-lang">${lang}</span>
        </div><code class="${lang}">${highlighted}</code></pre>`
      } catch (__) {}
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  }
})

// 使用自定义插件
md.use(thinkTagPlugin)

/**
 * 导出渲染函数
 * @param {string} content - 要渲染的Markdown内容
 * @returns {string} 渲染后的HTML内容
 */
export const renderMarkdown = (content) => {
  return md.render(content)
}

/**
 * 全局函数：切换思考过程的显示/隐藏状态
 * @param {string} thinkId - 思考区域的ID
 */
window.toggleThink = function(thinkId) {
  const thinkContent = document.getElementById(thinkId)
  const thinkIcon = document.getElementById(`icon-${thinkId}`)
  
  if (thinkContent && thinkIcon) {
    if (thinkContent.style.display === 'none') {
      thinkContent.style.display = 'block'
      thinkIcon.textContent = '▼'
    } else {
      thinkContent.style.display = 'none'
      thinkIcon.textContent = '▶'
    }
  }
}
