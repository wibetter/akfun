/**
 * 百度智能云 BOS 存储对接
 */
const { BosClient } = require('@baiducloud/sdk');

class baiduBOS {
  constructor(endpoint, bucket, ak, sk) {
    this.endpoint = endpoint;
    this.bucket = bucket;
    this.ak = ak;
    this.sk = sk;

    this.client = new BosClient({
      endpoint: endpoint,
      credentials: {
        ak,
        sk
      }
    });
  }

  normalizeKey(key) {
    return key.replace(/^\//, '').split('?')[0];
  }

  async exists(key) {
    try {
      key = this.normalizeKey(key);
      await this.client.getObjectMetadata(this.bucket, key);
      return true;
    } catch (e) {
      return false;
    }
  }

  async get(_objectKey) {
    try {
      const objectKey = this.normalizeKey(_objectKey);
      const result = await this.client.getObject(this.bucket, objectKey);
      let host = this.endpoint;
      let protocol = 'https:'; // 默认使用https协议

      try {
        const url = new URL(this.endpoint);
        host = url.host;
        protocol = url.protocol;
      } catch (error) {
        console.error('无效的 endpoint:', error);
      }

      return {
        headers: result.http_headers,
        body: result.body,
        url: `${protocol}//${this.bucket}.${host}/${objectKey}`
      };
    } catch (e) {
      return undefined;
    }
  }

  /**
   * 上传文件
   * @param {*} fileKey 文件名（对象存储中的路径和文件名）
   * @param {*} filepath 文件的本地路径
   */
  async upload(fileKey, filepath) {
    const result = await this.client.putObjectFromFile(this.bucket, fileKey, filepath);
    return result;
  }

  getPublicResourceUrl(key) {
    let host = this.endpoint;
    let protocol = 'https:'; // 默认使用https协议

    try {
      const url = new URL(this.endpoint);
      host = url.host;
      protocol = url.protocol;
    } catch (error) {
      console.error('无效的 endpoint:', error);
    }

    return `${protocol}//${this.bucket}.${host}/${key}`;
  }
}

module.exports = baiduBOS;
