import CryptoJS from 'crypto-js'

interface AesEncrypt {
  encrypt(data: string): string;
  filter(value: string): string;
  decrypt(word: string): string;
}

/**
 * AES加密工具 - 与Vue2版本完全保持一致
 */
const aesEncrypt: AesEncrypt = {
  /**
   * 加密
   * @param {string} data 需要加密的内容
   * @returns {string} 加密后的字符串
   */
  encrypt: function(data: string): string {
    /* AES前端加密 */
    const key = CryptoJS.enc.Utf8.parse('4Dd2Bb3Cc1Aa5Ee0')
    const iv = CryptoJS.enc.Utf8.parse('4Dd2Bb3Cc1Aa5Ee0')
    const str = CryptoJS.AES.encrypt(data, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.ZeroPadding
    }).toString()
    return this.filter(str)
  },

  /**
   * 过滤特殊字符，与Vue2版本保持一致
   */
  filter: function(value: string): string {
    value = value.replace('#', '%23')
      .replace('%', '%25')
      .replace('&', '%26')
      .replace('+', '%2B')
      .replace('//', '%2F')
      .replace('?', '%3F')
    return value
  },

  /**
   * 解密
   * @param {string} word 需要解密的内容
   * @returns {string} 解密后的字符串
   */
  decrypt: function(word: string): string {
    const key = CryptoJS.enc.Utf8.parse('4Dd2Bb3Cc1Aa5Ee0')
    const iv = CryptoJS.enc.Utf8.parse('4Dd2Bb3Cc1Aa5Ee0')

    const decrypt = CryptoJS.AES.decrypt(word, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.ZeroPadding
    })

    return CryptoJS.enc.Utf8.stringify(decrypt).toString()
  }
}

/**
 * AES加密组合式API
 */
export function useAesEncrypt() {
  return aesEncrypt
}

export { aesEncrypt as AesEncrypt }
export default aesEncrypt
