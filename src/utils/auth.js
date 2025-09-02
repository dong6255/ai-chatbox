// import alovaInstance from '@/utils/alova'

// // 模拟用户数据
// const mockUsers = [
//   {
//     id: 1,
//     username: 'admin',
//     password: 'admin123',
//     badgeNumber: '001279',
//     avatar: '/favicon.ico',
//     email: 'admin@example.com',
//     role: 'admin'
//   },
//   {
//     id: 2,
//     username: 'user1',
//     password: 'user123',
//     badgeNumber: '001280',
//     avatar: '/favicon.ico',
//     email: 'user1@example.com',
//     role: 'user'
//   },
//   {
//     id: 3,
//     username: 'test',
//     password: 'test123',
//     badgeNumber: '001281',
//     avatar: '/favicon.ico',
//     email: 'test@example.com',
//     role: 'user'
//   }
// ]

// // 模拟证书用户数据
// const mockCertUsers = [
//   {
//     id: 4,
//     username: '张三',
//     badgeNumber: '001282',
//     avatar: '/favicon.ico',
//     email: 'zhangsan@police.gov.cn',
//     role: 'officer',
//     certInfo: {
//       serialNumber: 'CERT123456789',
//       issuer: 'Police CA',
//       validFrom: '2024-01-01',
//       validTo: '2025-12-31'
//     }
//   },
//   {
//     id: 5,
//     username: '李四',
//     badgeNumber: '001283',
//     avatar: '/favicon.ico',
//     email: 'lisi@police.gov.cn',
//     role: 'officer',
//     certInfo: {
//       serialNumber: 'CERT987654321',
//       issuer: 'Police CA',
//       validFrom: '2024-01-01',
//       validTo: '2025-12-31'
//     }
//   }
// ]

// // 生成 JWT Token 的模拟函数
// function generateMockToken(user) {
//   const payload = {
//     id: user.id,
//     username: user.username,
//     badgeNumber: user.badgeNumber,
//     role: user.role,
//     exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24小时过期
//   }
//   // 这里只是模拟，实际应该使用真正的 JWT 签名
//   // 使用 encodeURIComponent 处理中文字符，然后用 btoa 编码
//   const jsonString = JSON.stringify(payload)
//   const encodedString = btoa(encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, (match, p1) => {
//     return String.fromCharCode(parseInt(p1, 16))
//   }))
//   return `mock.${encodedString}.signature`
// }

// // 用户名密码登录接口
// export const loginWithPassword = (credentials) => {
//   return alovaInstance.Post('/auth/login', credentials, {
//     localCache: false,
//     transform: (data, headers) => {
//       // 模拟登录逻辑
//       const { username, password } = credentials
      
//       // 模拟网络延迟
//       return new Promise((resolve, reject) => {
//         setTimeout(() => {
//           const user = mockUsers.find(u => u.username === username && u.password === password)
          
//           if (user) {
//             const token = generateMockToken(user)
//             resolve({
//               success: true,
//               message: '登录成功',
//               data: {
//                 token,
//                 user: {
//                   id: user.id,
//                   username: user.username,
//                   badgeNumber: user.badgeNumber,
//                   avatar: user.avatar,
//                   email: user.email,
//                   role: user.role
//                 }
//               }
//             })
//           } else {
//             // 使用 resolve 返回错误信息，而不是 reject
//             resolve({
//               success: false,
//               message: '用户名或密码错误',
//               code: 401
//             })
//           }
//         }, 800) // 模拟800ms网络延迟
//       })
//     }
//   })
// }

// // 模拟证书数据解析函数
// function parseCertificateData(certData) {
//   // 实际项目中需要解析证书的DN信息
//   return {
//     serialNumber: 'CERT123456789',
//     commonName: '张三',
//     organization: 'Police Department',
//     issuer: 'Police CA',
//     validFrom: '2024-01-01',
//     validTo: '2025-12-31'
//   }
// }

// // 模拟签名验证函数
// function verifySignature(certData, signature, randomStr) {
//   // 实际项目中需要验证证书签名
//   return true
// }

// // 获取随机数接口
// export const getRandom = (credentials) => {
//   // return alovaInstance.Post(`http://29.2.16.115:8888/pxjzpt/jwzh/openApi/random`, credentials, {
//   return alovaInstance.Post(`/jwzh/openApi/random`, credentials, {
//     localCache: false,
//     transform: (data, headers) => {
//       console.log("data", data)
//       // 模拟网络延迟
//       return new Promise((resolve, reject) => {
//         resolve(data)
//       })
//     }
//   })
// }

// // 证书登录接口
// export const returnSignResult = (params) => {
//   // 转换为URL编码字符串
//   const urlEncodedData = new URLSearchParams();
//   for (const [key, value] of Object.entries(params)) {
//     urlEncodedData.append(key, value);
//   }
//   return alovaInstance.Post(`/jwzh/openApi/pkiLogin`, urlEncodedData,{
//   // return alovaInstance.Post(`http://29.2.16.115:8888/pxjzpt/jwzh/openApi/pkiLogin`, params, {
//     // 设置请求头
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded'
//     },
//     localCache: false,
//     transform: (data, headers) => {
//       console.log("data", data)
//       // 模拟网络延迟
//       return new Promise((resolve, reject) => {
//         resolve({data:data})
//       })
//     }
//   })
// }

// // 证书登录接口
// export const loginWithCertificate = (loginData) => {
//   return alovaInstance.Post('/auth/cert-login', loginData, {
//     localCache: false,
//     transform: (data, headers) => {
//       // 模拟证书登录逻辑
//       return new Promise((resolve, reject) => {
//         setTimeout(() => {
//           try {
//             // 验证必要的登录数据
//             if (!loginData || !loginData.certData || !loginData.signature || !loginData.randomStr) {
//               resolve({
//                 success: false,
//                 message: '证书登录数据不完整',
//                 code: 400
//               })
//               return
//             }
            
//             // 模拟证书数据解析
//             const certInfo = parseCertificateData(loginData.certData)
            
//             // 模拟签名验证
//             const isSignatureValid = verifySignature(loginData.certData, loginData.signature, loginData.randomStr)
            
//             if (!isSignatureValid) {
//               resolve({
//                 success: false,
//                 message: '证书签名验证失败',
//                 code: 401
//               })
//               return
//             }
            
//             // 查找对应的证书用户
//             const certUser = mockCertUsers.find(user => 
//               user.certInfo.serialNumber === certInfo.serialNumber ||
//               user.username.includes(certInfo.commonName)
//             )
            
//             if (certUser) {
//               const token = generateMockToken(certUser)
//               resolve({
//                 success: true,
//                 message: '证书登录成功',
//                 data: {
//                   token,
//                   user: {
//                     id: certUser.id,
//                     username: certUser.username,
//                     badgeNumber: certUser.badgeNumber,
//                     avatar: certUser.avatar,
//                     email: certUser.email,
//                     role: certUser.role,
//                     loginType: 'certificate'
//                   },
//                   certInfo: {
//                     ...certUser.certInfo,
//                     ...certInfo
//                   }
//                 }
//               })
//             } else {
//               resolve({
//                 success: false,
//                 message: '证书用户不存在或未授权',
//                 code: 403
//               })
//             }
//           } catch (error) {
//             console.error('证书登录处理失败:', error)
//             resolve({
//               success: false,
//               message: '证书登录处理失败：' + error.message,
//               code: 500
//             })
//           }
//         }, 1000) // 模拟1s证书验证时间
//       })
//     }
//   })
// }

// // 退出登录接口
// export const logout = () => {
//   return alovaInstance.Post('/auth/logout', {}, {
//     localCache: false,
//     transform: () => {
//       return new Promise((resolve) => {
//         setTimeout(() => {
//           resolve({
//             success: true,
//             message: '退出登录成功'
//           })
//         }, 300)
//       })
//     }
//   })
// }

// // 验证 Token 接口
// export const verifyToken = (token) => {
//   return alovaInstance.Post('/auth/verify', { token }, {
//     localCache: false,
//     transform: () => {
//       return new Promise((resolve, reject) => {
//         setTimeout(() => {
//           try {
//             // 解析模拟 token
//             const parts = token.split('.')
//             if (parts.length !== 3) {
//               throw new Error('Invalid token format')
//             }
            
//             // 使用与编码相对应的解码方式处理中文字符
//             const decodedString = atob(parts[1])
//             const jsonString = decodeURIComponent(decodedString.split('').map(c => {
//               return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
//             }).join(''))
//             const payload = JSON.parse(jsonString)
//             const now = Math.floor(Date.now() / 1000)
            
//             if (payload.exp < now) {
//               resolve({
//                 success: false,
//                 message: 'Token 已过期',
//                 code: 401
//               })
//               return
//             }
            
//             // 根据用户ID查找用户信息
//             const allUsers = [...mockUsers, ...mockCertUsers]
//             const user = allUsers.find(u => u.id === payload.id)
            
//             if (user) {
//               resolve({
//                 success: true,
//                 message: 'Token 验证成功',
//                 data: {
//                   user: {
//                     id: user.id,
//                     username: user.username,
//                     badgeNumber: user.badgeNumber,
//                     avatar: user.avatar,
//                     email: user.email,
//                     role: user.role
//                   }
//                 }
//               })
//             } else {
//               resolve({
//                 success: false,
//                 message: '用户不存在',
//                 code: 404
//               })
//             }
//           } catch (error) {
//             resolve({
//               success: false,
//               message: 'Token 格式错误',
//               code: 400
//             })
//           }
//         }, 500)
//       })
//     }
//   })
// }