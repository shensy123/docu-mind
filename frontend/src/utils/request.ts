import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

request.interceptors.request.use(
  config => {
    // 在这里可以添加请求头、认证信息等
    // config.headers['Content-Type'] = 'application/json'
    return config
  },
  error => Promise.reject(error)
)

request.interceptors.response.use(
  response => {
    // 处理响应数据
    return response
  },
  error => Promise.reject(error)
)

export default request
