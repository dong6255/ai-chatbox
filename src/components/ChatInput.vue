<template>
  <!-- 聊天输入容器 -->
  <div class="chat-input-container">
    <!-- 添加文件上传区域 -->
    <div class="upload-area" v-if="showUpload">
      <el-upload class="upload-component" :action="null" :auto-upload="false" :on-change="handleFileChange"
        :show-file-list="false" multiple>
        <!-- trigger	触发文件选择框的内容 -->
        <template #trigger>
          <el-button type="primary" :icon="Plus">添加文件</el-button>
        </template>
      </el-upload>

      <!-- 预览区域 -->
      <div class="preview-list" v-if="selectedFiles.length">
        <div v-for="(file, index) in selectedFiles" :key="index" class="preview-item">
          <!-- 图片预览 -->
          <img v-if="isImage(file)" :src="getPreviewUrl(file)" class="preview-image" />
          <!-- 文件名预览 -->
          <div v-else class="file-preview">
            <el-icon>
              <Document />
            </el-icon>
            <span>{{ file.name }}</span>
          </div>
          <!-- 删除按钮 -->
          <el-button class="delete-btn" type="danger" :icon="Delete" circle @click="removeFile(index)" />
        </div>
      </div>
    </div>

    <!-- 输入框和按钮的组合 -->
    <div class="input-wrapper">
      <div class="input-container">
        <el-input v-model="messageText" type="textarea" :rows="3" :autosize="{ minRows: 3, maxRows: 8 }"
          :placeholder="loading ? '正在处理中，请等待回复完成...' : placeholder" :disabled="loading" resize="none"
          @keydown.enter.exact.prevent="handleSend" @keydown.enter.shift.exact="newline" @input="adjustHeight"
          ref="inputRef" class="message-input" />

        <!-- 按钮组放在输入框内部右侧 -->
        <div class="button-group">
          <!-- <el-tooltip content="清空对话" placement="top">
            <el-button
              circle
              size="small"
              type="danger"
              :icon="Delete"
              @click="handleClear"
            />
          </el-tooltip> -->

          <el-button type="primary" size="small" @click="handleButtonClick" class="send-button">
            <template #icon>
              <el-icon>
                <Position v-if="!loading" />
                <Close v-else />
              </el-icon>
            </template>
            {{ loading ? '停止' : '发送' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- Token计数器 -->
    <div class="token-counter">
      已使用 Token: {{ tokenCount.total }} (提示: {{ tokenCount.prompt }}, 回复: {{ tokenCount.completion }})
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Delete, Position, Upload, Plus, Document, Close } from '@element-plus/icons-vue'
import { useChatStore } from '@/stores/chat'
import { ElMessageBox } from 'element-plus'

// 定义组件的属性
const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

// 定义组件的事件
const emit = defineEmits(['send', 'clear', 'stop'])

// 使用聊天存储
const chatStore = useChatStore()
// 消息文本的响应式引用
const messageText = ref('')

// 输入框的占位符
const placeholder = `输入消息，按Enter发送
Shift + Enter 换行`

// 计算属性，用于获取聊天存储中的Token计数
const tokenCount = computed(() => chatStore.tokenCount)

const showUpload = ref(false)
const selectedFiles = ref([])

// 切换上传区域显示
const toggleUpload = () => {
  showUpload.value = !showUpload.value
}

// 处理文件选择
const handleFileChange = (file) => {
  selectedFiles.value.push(file.raw)
}

// 移除文件
const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

// 判断是否为图片文件
const isImage = (file) => {
  return file.type.startsWith('image/')
}

// 获取预览URL
const getPreviewUrl = (file) => {
  return URL.createObjectURL(file)
}

/**
 * 处理发送消息
 * 在loading状态下禁止发送新消息
 */
const handleSend = async () => {
  console.log('handleSend被调用了', messageText.value, selectedFiles.value.length, 'loading:', props.loading)

  // 如果正在loading状态，禁止发送新消息
  if (props.loading) {
    console.log('正在处理中，禁止发送新消息')
    return
  }

  if (!messageText.value.trim() && selectedFiles.value.length === 0) {
    console.log('内容为空，不发送')
    return
  }

  try {
    // 处理文件上传
    const fileContents = await Promise.all(
      selectedFiles.value.map(async (file) => {
        if (isImage(file)) {
          return await convertImageToBase64(file)
        } else {
          return await readFileContent(file)
        }
      })
    )

    // 组合消息内容
    let content = messageText.value
    if (fileContents.length > 0) {
      content = content + '\n' + fileContents.join('\n')
    }

    emit('send', content)
    messageText.value = ''
    selectedFiles.value = []
    showUpload.value = false
  } catch (error) {
    console.error('发送失败:', error)
    ElMessage.error('发送失败，请重试')
  }
}

// 将图片转换为base64
const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(`![${file.name}](${e.target.result})`)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 读取文件内容
const readFileContent = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(`\`\`\`\n${e.target.result}\n\`\`\``)
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

// 处理换行的函数
const newline = (e) => {
  // 在消息文本中添加换行符
  messageText.value += '\n'
}

// 处理清空对话的函数
const handleClear = async () => {
  try {
    // 使用Element Plus的消息框组件，提示用户是否确定清空对话记录
    await ElMessageBox.confirm(
      '确定要清空所有对话记录吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    // 如果用户确认清空，则触发clear事件
    emit('clear')
  } catch {
    // 如果用户取消操作，则不做任何事情
  }
}

/**
 * 处理停止请求
 */
const handleStop = () => {
  emit('stop')
}

/**
 * 处理按钮点击事件
 */
const handleButtonClick = () => {
  console.log('按钮被点击了，loading状态:', props.loading)
  if (props.loading) {
    handleStop()
  } else {
    handleSend()
  }
}

const inputRef = ref(null)

// 调整输入框高度的方法
const adjustHeight = () => {
  if (inputRef.value) {
    // 获取输入框的DOM元素,因为是 ref，需要通过$el获取DOM元素
    const textarea = inputRef.value.$el.querySelector('textarea')
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }
}

</script>

<style lang="scss" scoped>
// 聊天输入容器的样式
.chat-input-container {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 16px;
  z-index: 10;
}

// 输入框和按钮组合的样式
.input-wrapper {
  margin-bottom: 8px;
}

.input-container {
  position: relative;
  background-color: white;
  border: 1px solid #dcdfe6;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .message-input {
    width: 100%;

    :deep(.el-textarea) {
      .el-textarea__inner {
        background-color: transparent;
        border: none;
        box-shadow: none;
        padding: 16px 60px 16px 16px;
        resize: none;
        line-height: 1.6;
        font-size: 16px;

        &:focus {
          box-shadow: none;
        }
      }
    }
  }
}

// 按钮组的样式
.button-group {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 4px;
  align-items: center;
  flex-shrink: 0;

  .send-button {
    border-radius: 8px;
    min-width: auto;
    padding: 4px 8px;
  }
}

// Token计数器的样式
.token-counter {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
  text-align: right;
  margin-top: 8px;
}

.upload-area {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius);

  .preview-list {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 1rem;

    .preview-item {
      position: relative;
      width: 100px;
      height: 100px;

      .preview-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: var(--border-radius);
      }

      .file-preview {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: var(--bg-color-secondary);
        border-radius: var(--border-radius);
        
        .el-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        
        span {
          font-size: 0.8rem;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 90%;
        }
      }
      
      .delete-btn {
        position: absolute;
        top: -0.5rem;
        right: -0.5rem;
        padding: 0.25rem;
        transform: scale(0.8);
      }
    }
  }
}
</style>