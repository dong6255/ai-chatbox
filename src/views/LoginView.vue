<template>
  <div class="loginDlPage">
    <!-- 登录页面 -->
    <div class="loginCenter">
      <div class="loginL">
        <div class="loginBg">AI 聊天系统</div>
      </div>
      <div class="loginR">
        <div class="loginBox">
          <div class="loginTitle">
            欢迎登录<span style="color: red">AI聊天平台</span>
          </div>

          <!-- 用户名密码登录 -->
          <el-form v-if="isPswLogin" :model="loginValues" ref="loginForm" :rules="rules">
            <el-form-item prop="userName" class="login_user">
              <el-input placeholder="请输入用户名" type="text" v-model="loginValues.userName"
                @keyup.enter="handleLogin()"></el-input>
            </el-form-item>
            <el-form-item prop="passWord" class="login_psw">
              <el-input placeholder="请输入密码" type="password" v-model="loginValues.passWord" autocomplete="off"
                @keyup.enter="handleLogin()"></el-input>
            </el-form-item>
          </el-form>

          <!-- 数字证书登录 -->
          <div class="keyBox" v-if="!isPswLogin">
            <span>请插入专用的Ukey进行登录</span>
            <div class="cert-info" v-if="certInfo">
              <p>证书信息：{{ certInfo }}</p>
            </div>
          </div>

          <el-button class="login_btn" @click="handleLogin" :loading="loginLoad">登 录</el-button>

          <!-- 登录方式切换按钮 -->
          <div class="switch-login">
            <el-button type="text" @click="switchLogin(!isPswLogin)" class="switch-btn">
              {{ isPswLogin ? "切换到证书登录" : "切换到密码登录" }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import pnxclient from '@/utils/pnxclient'
import { getRandom, returnSignResult } from '@/api/auth'
import msComm from "@/utils/ms_comm.js";

const router = useRouter()
const authStore = useAuthStore()
const loginForm = ref()

// 登录状态控制
const isPswLogin = ref(true) // 默认使用数字证书登录
const loginLoad = ref(false)
const certInfo = ref('') // 证书信息
const isOnline = ref(true) // 是否在线环境

// 后门功能相关
const backdoorCount = ref(0) // 记录连续按下小键盘6的次数
const backdoorTimer = ref(null) // 重置计数器的定时器

// 登录表单数据
const loginValues = reactive({
  userName: '',
  passWord: ''
})

// 登录表单验证规则
const rules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  passWord: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],

}

const staffInfo = reactive({
  userid: '',
  username: ''
})



// 切换登录方式
const switchLogin = (isPsw) => {
  isPswLogin.value = isPsw
  if (!isPswLogin.value) {
    // 切换到证书登录时重新检测证书
    // detectCertificate()
  }
}

// 证书登录初始化参数
const initParam = `<?xml version="1.0" encoding="utf-8"?><authinfo><liblist><lib type="SKF" version="1.0" dllname="L29wdC9HQVNTL2xpYlNLRi9saWJTS0ZfR0FfYXBpX21pcHM2NC5zby4wLjMuMTAuMDQxMw=="><algid val="SHA1" sm2_hashalg="SM3" /></lib><lib type="SKF" version="1.0" dllname="L29wdC9HQVNTL2xpYlNLRi9saWJTS0ZfR0FGX2FwaV9taXBzNjQuc28uMC4zLjExLjA0MTM="><algid val="SHA1" sm2_hashalg="SM3" /></lib><lib type="CSP" version="1.0" dllname="TWljcm9zb2Z0IEVuaGFuY2VkIENyeXB0b2dyYXBoaWMgUHJvdmlkZXIgdjEuMA=="><algid val="SHA1" sm2_hashalg="SHA1" /></lib><lib type="CSP" version="1.0" dllname="R0FTUyBDcnlwdG9ncmFwaGljIFNlcnZpY2UgUHJvdmlkZXIgdjEuMA=="><algid val="SHA1" sm2_hashalg="SHA1" /></lib><lib type="CSP" version="1.0" dllname="ZVNhZmUgQ3J5cHRvZ3JhcGhpYyBTZXJ2aWNlIFByb3ZpZGVyIHYxLjA="><algid val="SHA1" sm2_hashalg="SHA1" /></lib><lib type="SKF" version="1.1" dllname="R0FLRVlfU0tGLmRsbA=="><algid val="SHA1" sm2_hashalg="SM3" /></lib><lib type="CSP" version="1.0" dllname="R0FTU19GIENyeXB0b2dyYXBoaWMgU2VydmljZSBQcm92aWRlciB2MS4w"><algid val="SHA1" sm2_hashalg="SHA1" /></lib></liblist></authinfo>`

// 检测数字证书
const detectCertificate = () => {
  try {
    // 初始化证书客户端
    pnxclient.Init()

    // 初始化签名对象
    const initResult = pnxclient.Initialize('RSA', initParam)
    if (initResult !== 0) {
      throw new Error('证书客户端初始化失败')
    }

    // 设置不弹出证书选择对话框（如果只有一个证书）
    pnxclient.SetChooseSingleCert(0)

    // 获取证书信息
    const certData = pnxclient.GetSignCert()
    if (certData && certData.length > 0) {
      certInfo.value = '检测到数字证书'
      ElMessage.success('检测到数字证书，可以进行登录')
    } else {
      throw new Error('未检测到有效证书')
    }
  } catch (error) {
    console.error('证书检测失败:', error)
    certInfo.value = ''
    ElMessage.error('未检测到数字证书，请插入Ukey或安装证书客户端')
  }
}

// 证书登录
const certLogin = async () => {
  console.log("666666", 666666)
  // if (!certInfo.value) {
  //   ElMessage.error('请先检测数字证书')
  //   return
  // }
  let initParam = "<\?xml version=\"1.0\" encoding=\"utf-8\"\?><authinfo><liblist><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRi9saWJTS0ZfR0FfYXBpX21pcHM2NC5zby4wLjMuMTAuMDQxMw==\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRi9saWJTS0ZfR0FGX2FwaV9taXBzNjQuc28uMC4zLjExLjA0MTM=\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRi9saWJTS0ZfR0FfYXBpX2FybTY0LnNvLjAuMy4xMC4wNDEz\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRi9saWJTS0ZfR0FGX2FwaV9hcm02NC5zby4wLjMuMTEuMDQxMw==\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRi9saWJTS0ZfR0FfYXBpX3g4Nl82NC5zby4wLjMuMTAuMDQxMw==\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRl9HQUZfYXBpX3g4Ni5zby4wLjMuMTEuMDQxMw==\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRl9HQV9hcGlfeDg2XzY0LnNvLjAuMy4xMC4wNDEz\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRi9saWJTS0ZfR0FGX2FwaV9hcm02NC5zby4wLjMuMTEuMDQxMw==\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRl9HQUZfYXBpX3g4Ni5zby4wLjMuMTEuMDQxMw==\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRl9HQV9hcGlfeDg2XzY0LnNvLjAuMy4xMC4wNDEz\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRl9HQV9hcGlfbWlwczY0LnNvLjAuMy40LjkyMw==\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRi9saWJTS0ZfR0FfYXBpX2FybTY0LnNvLjAuMy45LjAyMjU=\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRi9saWJTS0ZfR0FfYXBpX2FybTY0LnNvLjAuMy4xMS4wNDEz\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"SKF\" version=\"1.0\" dllname=\"L29wdC9HQVNTL2xpYlNLRi9saWJTS0ZfR0FfYXBpX2FybTY0LnNvLjAuMy4xMC4wNDEz\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"TWljcm9zb2Z0IEVuaGFuY2VkIENyeXB0b2dyYXBoaWMgUHJvdmlkZXIgdjEuMA==\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"R0FTUyBDcnlwdG9ncmFwaGljIFNlcnZpY2UgUHJvdmlkZXIgdjEuMA==\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"ZVNhZmUgQ3J5cHRvZ3JhcGhpYyBTZXJ2aWNlIFByb3ZpZGVyIHYxLjA=\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"SKF\" version=\"1.1\" dllname=\"R0FLRVlfU0tGLmRsbA==\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib><lib type=\"CSP\" version=\"1.0\" dllname=\"R0FTU19GIENyeXB0b2dyYXBoaWMgU2VydmljZSBQcm92aWRlciB2MS4w\"><algid val=\"SHA1\" sm2_hashalg=\"SHA1\" /></lib><lib type=\"SKF\" version=\"1.1\" dllname=\"R0FGS0VZX1NLRi5kbGw=\"><algid val=\"SHA1\" sm2_hashalg=\"SM3\" /></lib></liblist></authinfo>";
  loginLoad.value = true
  try {
    // 获取证书信息
    // const certData = pnxclient.GetSignCert()
    // if (!certData || certData.length === 0) {
    //   throw new Error('无法获取证书信息')
    // }
    const response = await getRandom()
    console.log("response", response)
    // 检查响应是否成功
    if (response.code == "200") {
      let authContent = response.rows[0];
      if (authContent == "") {
        alert("认证原文不能为空!");
        return false;
      } else {
        try {
          pnxclient.JIT_GW_ExtInterface.GetVersion();
          console.log("版本号" + pnxclient.JIT_GW_ExtInterface.GetVersion());
        } catch (e) {
          alert("未安装控件，请进行安装控件");
          return false;
        }
        pnxclient.JIT_GW_ExtInterface.ClearFilter();
        // 初始化vctk控件
        pnxclient.JIT_GW_ExtInterface.Initialize("", initParam);
        // 控制证书为一个时，不弹出证书选择框
        pnxclient.JIT_GW_ExtInterface.SetChooseSingleCert(1);

        // 生成签名信息
        let sign_Result = pnxclient.JIT_GW_ExtInterface.P7SignString(authContent, true, true);
        if (pnxclient.JIT_GW_ExtInterface.GetLastError() != 0) {
          if (pnxclient.JIT_GW_ExtInterface.GetLastError() == 3758096386
            || pnxclient.JIT_GW_ExtInterface.GetLastError() == 2148532334) {
            alert("用户取消操作");
            return;
          } else if (pnxclient.JIT_GW_ExtInterface.GetLastError() == -536870815
            || pnxclient.JIT_GW_ExtInterface.GetLastError() == 3758096481) {
            alert("没有找到有效的证书，如果使用的是KEY，请确认已经插入key");
            return;
          } else {
            alert(pnxclient.JIT_GW_ExtInterface.GetLastErrorMessage());
            return;
          }
        }
        // 返回签名结果
        if (sign_Result) {
          const res = await returnSignResult({
            signed_data: sign_Result,
            original_vue: authContent,
          })
          if (res) {
            //modify by ms 20220830
            sessionStorage.setItem("curPlaceId", res.data.rows[0].placeId);
            sessionStorage.setItem("userId", res.data.rows[0].userId);
            let curT = msComm.setCurTitle();
            if (curT && curT.orgTitle) {
              document.title = "AI Chat";
            }
            //modify by ms end
            sessionStorage.setItem("loginName", res.data.rows[0].userName);
            // 模拟登录成功，直接跳转
            authStore.setUser({
              id: 'backdoor_user',
              username: res.data.rows[0].userName,
              badgeNumber: res.data.rows[0].userInfo.alarm,
              token: 'backdoor_token_' + Date.now()
            })
            router.push('/chat')
            // that.$emit("handleLogin", res)
            // that.loginLoad = false;
          } else {
            // that.loginLoad = false;
            if (res.data.code === 201) {
              staffInfo.userid = res.data.rows[0].sfzh;
              staffInfo.username = res.data.rows[0].xm;
              // that.registerUser(true);
              // that.staffFlag = true;
            }
          }
        }
      }
    } else {
      // 证书登录失败
      return Promise.reject({
        success: false,
        message: response.message || '证书登录失败'
      })
    }

    /* 
    try{
      // 生成随机字符串用于签名验证
      const randomStr = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      
      // 使用证书进行签名
      const signature = pnxclient.P1SignString(randomStr)
      if (!signature) {
        throw new Error('证书签名失败')
      }
 
// // 调用证书登录接口
// const loginData = {
//   certData: certData,
//   signature: signature,
//   randomStr: randomStr,
//   isOnline: isOnline.value
// }
 
// await authStore.certLogin(loginData)
// ElMessage.success('证书登录成功')
      router.push('/chat')
    } catch (error) {
      console.error('证书登录失败:', error)
      ElMessage.error(error.message || '证书登录失败')
    } finally {
      loginLoad.value = false
      // 清理证书客户端资源
      try {
        pnxclient.Finalize()
      } catch (e) {
        console.warn('清理证书客户端资源失败:', e)
      }
    }
    */
  } catch (error) {
    console.error('证书登录失败:', error)
  }
}

// 处理登录
const handleLogin = async () => {
  if (isPswLogin.value) {
    // 用户名密码登录
    if (!loginForm.value) return

    try {
      await loginForm.value.validate()
      loginLoad.value = true

      const result = await authStore.login({
        username: loginValues.userName,
        password: loginValues.passWord
      })

      if (result.success) {
        ElMessage.success(result.message || '登录成功！')
        router.push('/chat')
      }
    } catch (error) {
      console.error('登录失败:', error)
      ElMessage.error(error.message || '登录失败，请检查用户名和密码')
    } finally {
      loginLoad.value = false
    }
  } else {
    // 调用证书登录函数
    await certLogin()
  }
}





// 后门功能：连续三次按下小键盘6直接进入
const handleBackdoor = (event) => {
  // 检查是否在密码登录状态
  if (!isPswLogin.value) return

  // 检查是否按下小键盘6 (keyCode 102 或 key '6' 且 location 3)
  if ((event.code === 'Numpad6' || (event.key === '6' && event.location === 3)) && !event.ctrlKey && !event.altKey && !event.shiftKey) {
    backdoorCount.value++

    // 清除之前的定时器
    if (backdoorTimer.value) {
      clearTimeout(backdoorTimer.value)
    }

    // 设置2秒后重置计数器
    backdoorTimer.value = setTimeout(() => {
      backdoorCount.value = 0
    }, 2000)

    // 如果连续按下3次，触发后门
    if (backdoorCount.value >= 3) {
      backdoorCount.value = 0
      clearTimeout(backdoorTimer.value)

      // 模拟登录成功，直接跳转
      authStore.setUser({
        id: 'backdoor_user',
        username: 'admin',
        token: 'backdoor_token_' + Date.now()
      })

      ElMessage.success('后门登录成功！')
      router.push('/chat')
    }
  } else {
    // 按下其他键时重置计数器
    backdoorCount.value = 0
    if (backdoorTimer.value) {
      clearTimeout(backdoorTimer.value)
    }
  }
}

// 组件挂载时检测证书（如果是证书登录模式）
onMounted(() => {
  if (!isPswLogin.value) {
    // detectCertificate()
  }

  // 添加Alt+S快捷键监听
  const handleKeydown = (event) => {
    if (event.altKey && event.key === 's') {
      event.preventDefault()
      if (!isPswLogin.value) {
        isPswLogin.value = true
      }
    }
  }

  document.addEventListener('keydown', handleKeydown)
  // 添加后门功能监听
  document.addEventListener('keydown', handleBackdoor)

  // 组件卸载时移除监听器
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    document.removeEventListener('keydown', handleBackdoor)
    if (backdoorTimer.value) {
      clearTimeout(backdoorTimer.value)
    }
  })
})
</script>

<style lang="scss" scoped>
.loginDlPage {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  display: flex;
  flex-direction: column;
  position: relative;
}

.loginCenter {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loginL {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  .loginBg {
    font-size: 48px;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }
}

.loginR {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loginBox {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;

  .loginTitle {
    text-align: center;
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin-bottom: 30px;
  }

  .el-form-item {
    margin-bottom: 20px;
  }

  .login_btn {
    width: 100%;
    height: 44px;
    font-size: 16px;
    font-weight: 500;
    background: #409eff;
    border: none;
    border-radius: 6px;
    color: white;
    margin: 20px 0;

    &:hover {
      background: #66b1ff;
    }
  }
}

.keyBox {
  text-align: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 20px 0;

  span {
    color: #666;
    font-size: 16px;
  }

  .cert-info {
    margin-top: 15px;
    padding: 10px;
    background: #e7f3ff;
    border-radius: 6px;

    p {
      margin: 0;
      color: #409eff;
      font-size: 14px;
    }
  }
}

.registerWrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.registerBox {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 800px;

  .registerTitle {
    text-align: center;
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin-bottom: 30px;
  }

  .el-form-item {
    margin-bottom: 20px;
  }

  .el-button {
    margin: 0 10px;
  }
}

.switch-login {
  text-align: center;
  margin-top: 20px;

  .switch-btn {
    color: #409eff;
    font-size: 14px;

    &:hover {
      color: #66b1ff;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .loginCenter {
    flex-direction: column;
    padding: 10px;
  }

  .loginL {
    margin-bottom: 20px;

    .loginBg {
      font-size: 32px;
    }
  }

  .loginBox,
  .registerBox {
    padding: 20px;
  }
}
</style>