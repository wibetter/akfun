/**
 * 百度智能云 BOS 存储对接
 */
const BosClient = require('ali-oss');

class BOSFileStorage {
  constructor(endpoint, region, bucket, accessKeyId, accessKeySecret) {
    this.endpoint = endpoint;
    this.region = region;
    this.bucket = bucket;
    this.accessKeyId = accessKeyId;
    this.accessKeySecret = accessKeySecret;

    this.client = new BosClient({
      endpoint: this.endpoint,
      // region: this.region,
      accessKeyId: this.accessKeyId,
      accessKeySecret: this.accessKeySecret,
      bucket: this.bucket
    });
  }

  normalizeKey(objectKey) {
    return objectKey.replace(/^\//, '').split('?')[0];
  }

  async exists(_objectKey) {
    try {
      const objectKey = this.normalizeKey(_objectKey);
      await this.client.head(objectKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  async get(_objectKey) {
    try {
      const objectKey = this.normalizeKey(_objectKey);
      const result = await this.client.get(objectKey);

      return {
        headers: result.res.headers,
        body: result.content, // 文件内容
        url: result.res.requestUrls[0] // 文件访问地址
      };
    } catch (error) {
      return undefined;
    }
  }

  /**
   * 上传文件
   * @param {*} fileKey 文件名（对象存储中的路径和文件名）
   * @param {*} filepath 文件的本地路径
   */
  async upload(fileKey, filepath) {
    const result = await this.client.put(fileKey, filepath);
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

module.exports = BOSFileStorage;
