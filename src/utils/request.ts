import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { message, Modal, notification } from 'ant-design-vue'
import { useUserStore } from '../stores/user'
import { format } from 'date-fns'

// 创建一个接口来扩展Navigator接口
interface CustomNavigator extends Navigator {
  msSaveBlob?: (blob: Blob, defaultName?: string) => boolean;
}

// 声明import.meta.env
declare interface ImportMeta {
  env: {
    VITE_APP_BASE_API: string;
    [key: string]: string;
  };
}

// 定义响应类型接口
export interface ApiResponse<T = any> {
  code: number | string;
  message?: string;
  msg?: string;
  data?: T;
  obj?: T; // 兼容后端返回格式
  status?: number | string;
}

/**
 * 统一响应处理
 * @param data API响应数据
 * @param successMessage 成功时显示的消息，不传则不显示
 * @param errorMessage 失败时显示的消息，不传则使用响应中的错误信息
 * @returns 是否响应成功
 */
export function handleResponse<T = any>(
  data: ApiResponse<T> | null | undefined,
  successMessage?: string,
  errorMessage?: string
): boolean {
  // 处理空响应情况
  if (!data) {
    console.warn('处理了空响应数据');
    if (successMessage) {
      message.success(successMessage)
    }
    return true;
  }

  // 处理token过期情况
  if (data.code === 403 && data.msg === 'token已经过期') {
    const userStore = useUserStore()
    Modal.error({
      title: 'token已过期',
      content: '登录已过期，请重新登录',
      okText: '重新登录',
      centered: true,
      onOk: () => {
        userStore.logout()
        window.location.href = '/'
      }
    })
    return false
  }

  // 兼容字符串和数字格式的code
  if (data.code == 200 || data.code == '200') {
    if (successMessage) {
      message.success(successMessage)
    }
    return true
  } else {
    // 优先使用自定义错误消息，其次是响应中的错误消息
    message.error(errorMessage || data.msg || '操作失败')
    return false
  }
}

/**
 * 创建请求实例
 */
function createRequest() {
  // 创建axios实例
  const service = axios.create({
    baseURL: (import.meta as any).env.VITE_APP_BASE_API || '',
    timeout: 30000,
    responseType: 'json',
    validateStatus(status) {
      return status === 200
    }
  })

  // 请求拦截器
  service.interceptors.request.use(
    (config) => {
      const userStore = useUserStore()
      const { token, user, expireTime } = userStore

      // 处理token过期
      const now = new Date().getTime().toString()
      if (expireTime && parseInt(now) - parseInt(expireTime) >= -10) {
        Modal.error({
          title: '登录已过期',
          content: '很抱歉，登录已过期，请重新登录',
          okText: '重新登录',
          mask: false,
          onOk: () => {
            userStore.logout()
            window.location.reload()
          }
        })
      }

      // 添加token
      if (token) {
        config.headers.Authentication = token
      }

      // 添加系统ID
      if (user?.sysId) {
        config.headers.SysId = user.sysId
      }

      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // 响应拦截器
  service.interceptors.response.use(
    (config) => {
      // token过期判断
      if (config.data && config.data.code === 403 && config.data.msg === 'token已经过期') {
        const userStore = useUserStore()
        Modal.error({
          title: 'token已过期',
          content: '登录已过期，请重新登录',
          okText: '重新登录',
          centered: true,
          onOk: () => {
            userStore.logout()
            window.location.href = '/'
          }
        })
        return Promise.reject(config)
      }

      // 增加错误码判断
      const errCode = [6000, 6001, 6004, 6503, 400, 500]
      if (config.data && config.data.code && errCode.find(n => n === config.data.code)) {
        notification.error({
          message: '系统提示',
          description: config.data.msg,
          duration: 4
        })
        return Promise.reject(config)
      } else {
        return config
      }
    },
    (error) => {
      if (error.response) {
        const errorMessage = error.response.data === null
          ? '系统内部异常，请联系网站管理员'
          : error.response.data.message

        switch (error.response.status) {
          case 404:
            notification.error({
              message: '系统提示',
              description: '很抱歉，资源未找到',
              duration: 4
            })
            break
          case 403:
          case 401:
            notification.warn({
              message: '系统提示',
              description: '很抱歉，您无法访问该资源，可能是因为没有相应权限或者登录已失效',
              duration: 4
            })
            break
          default:
            notification.error({
              message: '系统提示',
              description: errorMessage,
              duration: 4
            })
            break
        }
      }
      return Promise.reject(error)
    }
  )

  /**
   * 封装请求方法
   */
  const request = {
    baseURL() {
      return service.defaults.baseURL
    },

    post<T = any>(url: string, params: any): Promise<AxiosResponse<ApiResponse<T>>> {
      return service.post(url, params, {
        transformRequest: [(params) => {
          let result = ''
          Object.keys(params).forEach((key) => {
            if (!Object.is(params[key], undefined) && !Object.is(params[key], null)) {
              result += encodeURIComponent(key) + '=' + encodeURIComponent(params[key]) + '&'
            }
          })
          return result
        }],
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
    },

    postJson<T = any>(url: string, params: any): Promise<AxiosResponse<ApiResponse<T>>> {
      return service.post(url, params, {
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        }
      })
    },

    put<T = any>(url: string, params: any): Promise<AxiosResponse<ApiResponse<T>>> {
      return service.put(url, params, {
        transformRequest: [(params) => {
          let result = ''
          Object.keys(params).forEach((key) => {
            if (!Object.is(params[key], undefined) && !Object.is(params[key], null)) {
              result += encodeURIComponent(key) + '=' + encodeURIComponent(params[key]) + '&'
            }
          })
          return result
        }],
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
    },

    putForm<T = any>(url: string, params: any): Promise<AxiosResponse<ApiResponse<T>>> {
      return service.put(url, params, {
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        }
      })
    },

    getFile<T = any>(url: string, params?: any): Promise<AxiosResponse<ApiResponse<T>>> {
      let _params
      if (Object.is(params, undefined)) {
        _params = ''
      } else {
        _params = '?'
        for (let key in params) {
          if (params.hasOwnProperty(key) && params[key] !== null) {
            _params += `${key}=${params[key]}&`
          }
        }
      }
      return service.get(`${url}${_params}`, {
        responseType: 'blob'
      })
    },

    get<T = any>(url: string, params?: any): Promise<AxiosResponse<ApiResponse<T>>> {
      let _params = ''
      if (params) {
        _params = '?'
        for (const key in params) {
          if (params.hasOwnProperty(key) && params[key] !== null) {
            _params += `${key}=${params[key]}&`
          }
        }
      }
      return service.get(`${url}${_params}`)
    },

    delete<T = any>(url: string, params?: any): Promise<AxiosResponse<ApiResponse<T>>> {
      let _params = ''
      if (params) {
        _params = '?'
        for (const key in params) {
          if (params.hasOwnProperty(key) && params[key] !== null) {
            _params += `${key}=${params[key]}&`
          }
        }
      }
      return service.delete(`${url}${_params}`)
    },

    export(url: string, params: any = {}): Promise<void> {
      message.loading('导出数据中')
      return service.post(url, params, {
        transformRequest: [(params) => {
          let result = ''
          Object.keys(params).forEach((key) => {
            if (!Object.is(params[key], undefined) && !Object.is(params[key], null)) {
              result += encodeURIComponent(key) + '=' + encodeURIComponent(params[key]) + '&'
            }
          })
          return result
        }],
        responseType: 'blob'
      }).then((r) => {
        const content = r.data
        const blob = new Blob([content])
        const fileName = `${new Date().getTime()}_导出结果.xlsx`
        if ('download' in document.createElement('a')) {
          const elink = document.createElement('a')
          elink.download = fileName
          elink.style.display = 'none'
          elink.href = URL.createObjectURL(blob)
          document.body.appendChild(elink)
          elink.click()
          URL.revokeObjectURL(elink.href)
          document.body.removeChild(elink)
        } else {
          const customNavigator = navigator as CustomNavigator
          if (customNavigator.msSaveBlob) {
            customNavigator.msSaveBlob(blob, fileName)
          }
        }
      }).catch((r) => {
        console.error(r)
        message.error('导出失败')
      })
    },

    exportWord(url: string, params: any = {}): Promise<void> {
      message.loading('导出数据中')
      return service.post(url, params, {
        transformRequest: [(params) => {
          let result = ''
          Object.keys(params).forEach((key) => {
            if (!Object.is(params[key], undefined) && !Object.is(params[key], null)) {
              result += encodeURIComponent(key) + '=' + encodeURIComponent(params[key]) + '&'
            }
          })
          return result
        }],
        responseType: 'blob'
      }).then((r) => {
        const content = r.data
        const blob = new Blob([content])
        const fileName = `${new Date().getTime()}_导出结果.docx`
        if ('download' in document.createElement('a')) {
          const elink = document.createElement('a')
          elink.download = fileName
          elink.style.display = 'none'
          elink.href = URL.createObjectURL(blob)
          document.body.appendChild(elink)
          elink.click()
          URL.revokeObjectURL(elink.href)
          document.body.removeChild(elink)
        } else {
          const customNavigator = navigator as CustomNavigator
          if (customNavigator.msSaveBlob) {
            customNavigator.msSaveBlob(blob, fileName)
          }
        }
      }).catch((r) => {
        console.error(r)
        message.error('导出失败')
      })
    },

    exportFile(url: string, params: any = {}, fileType: string): Promise<void> {
      message.loading('导出数据中')
      return service.post(url, params, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        }
      }).then((r) => {
        const content = r.data
        const blob = new Blob([content])
        const fileName = `${new Date().getTime()}_导出结果.${fileType}`
        if ('download' in document.createElement('a')) {
          const elink = document.createElement('a')
          elink.download = fileName
          elink.style.display = 'none'
          elink.href = URL.createObjectURL(blob)
          document.body.appendChild(elink)
          elink.click()
          URL.revokeObjectURL(elink.href)
          document.body.removeChild(elink)
        } else {
          const customNavigator = navigator as CustomNavigator
          if (customNavigator.msSaveBlob) {
            customNavigator.msSaveBlob(blob, fileName)
          }
        }
      }).catch((r) => {
        console.error(r)
        message.error('导出失败')
      })
    },

    exportFormJson(url: string, params: any = {}): Promise<void> {
      let _params
      if (Object.is(params, undefined)) {
        _params = ''
      } else {
        _params = '?'
        for (let key in params) {
          if (params.hasOwnProperty(key) && params[key] !== null) {
            _params += `${key}=${params[key]}&`
          }
        }
      }
      message.loading('导出数据中')
      return service.get(`${url}${_params}`, {
        responseType: 'blob'
      }).then((r) => {
        const content = r.data
        const blob = new Blob([content])
        const fileName = `${new Date().getTime()}_导出结果.xlsx`
        if ('download' in document.createElement('a')) {
          const elink = document.createElement('a')
          elink.download = fileName
          elink.style.display = 'none'
          elink.href = URL.createObjectURL(blob)
          document.body.appendChild(elink)
          elink.click()
          URL.revokeObjectURL(elink.href)
          document.body.removeChild(elink)
        } else {
          const customNavigator = navigator as CustomNavigator
          if (customNavigator.msSaveBlob) {
            customNavigator.msSaveBlob(blob, fileName)
          }
        }
      }).catch((r) => {
        console.error(r)
        message.error('导出失败')
      })
    },

    download(url: string, params: any, filename: string): Promise<void> {
      message.loading('文件传输中')
      return service.post(url, params, {
        transformRequest: [(params) => {
          let result = ''
          Object.keys(params).forEach((key) => {
            if (!Object.is(params[key], undefined) && !Object.is(params[key], null)) {
              result += encodeURIComponent(key) + '=' + encodeURIComponent(params[key]) + '&'
            }
          })
          return result
        }],
        responseType: 'blob'
      }).then((r) => {
        const content = r.data
        const blob = new Blob([content])
        if ('download' in document.createElement('a')) {
          const elink = document.createElement('a')
          elink.download = filename
          elink.style.display = 'none'
          elink.href = URL.createObjectURL(blob)
          document.body.appendChild(elink)
          elink.click()
          URL.revokeObjectURL(elink.href)
          document.body.removeChild(elink)
        } else {
          const customNavigator = navigator as CustomNavigator
          if (customNavigator.msSaveBlob) {
            customNavigator.msSaveBlob(blob, filename)
          }
        }
        message.success('下载成功')
      }).catch((r) => {
        console.error(r)
        message.error('下载失败')
      })
    },

    upload<T = any>(url: string, params: any): Promise<AxiosResponse<ApiResponse<T>>> {
      return service.post(url, params, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    },

    getBlob(url: string, params?: any): Promise<AxiosResponse> {
      let _params = '';
      if (params) {
        _params = Object.keys(params)
          .filter(key => params[key] !== null) // 过滤掉值为 null 的参数
          .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`) // 编码参数值
          .join('&'); // 使用 '&' 连接参数
        if (_params) {
          _params = '?' + _params; // 添加 '?' 前缀
        }
      }

      return service.get(url + _params, {
        responseType: 'blob' // 设置 responseType
      });
    }
  }

  return request
}

/**
 * 创建请求Hook
 */
export function useRequest() {
  return createRequest()
}

// 导出创建好的实例，便于直接引用
export default createRequest()

// 特殊处理菜单接口响应（兼容空响应或非标准响应）
export const handleMenuResponse = (response: any, successMessage?: string): boolean => {
  // 检查是否有响应
  if (!response) {
    console.warn('菜单操作接收到空响应');
    message.error('服务器无响应，请重试');
    return false;
  }

  // 检查是否有data属性
  if (!response.data) {
    console.warn('菜单操作接收到无data属性的响应', response);

    // 一些旧接口可能直接返回结果而不包含在data属性中
    if (response.code === 200 || response.status === 200) {
      if (successMessage) {
        message.success(successMessage);
      }
      return true;
    }

    message.error('响应格式错误，请联系管理员');
    return false;
  }

  // 有data，使用标准处理
  const data = response.data;
  if (data.code === 200 || data.code === '200') {
    if (successMessage) {
      message.success(successMessage);
    }
    return true;
  } else {
    message.error(data.msg || '操作失败');
    return false;
  }
};

// 过滤系统数据工具函数
export const sysDataFilter = (data: any[]) => {
  if (!Array.isArray(data)) return [];
  return data.filter(n => {
    return n.sysId != 10380 && n.id != 10380;
  });
};
