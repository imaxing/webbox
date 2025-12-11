/**
 * 简单缓存类
 * 基于 Map 实现，支持 TTL 过期
 */
class SimpleCache {
  private cache: Map<string, { value: any; expireAt: number | null }>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * 获取缓存
   */
  get(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;

    // 检查是否过期
    if (item.expireAt && Date.now() > item.expireAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（秒）
   */
  set(key: string, value: any, ttl: number = 300): void {
    const expireAt = ttl ? Date.now() + ttl * 1000 : null;
    this.cache.set(key, { value, expireAt });
  }

  /**
   * 清除缓存
   * @param keyPattern 键模式（支持通配符 *）
   */
  clear(keyPattern: string | null = null): number {
    if (!keyPattern) {
      const size = this.cache.size;
      this.cache.clear();
      return size;
    }

    const regex = new RegExp('^' + keyPattern.replace(/\*/g, '.*') + '$');
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * 获取缓存统计
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export default new SimpleCache();
