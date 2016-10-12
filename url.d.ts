/**
 * 解析地址对应的绝对地址。
 * @param base 要解析的基地址。
 * @param url 要解析的地址。
 * @returns 返回已解析的地址。
 * @example resolveUrl("a/b/c", "../d") // "a/d"
 */
export declare function resolveUrl(base: string, url: string): string;
/**
 * 解析地址对应的相对地址。
 * @param from 要解析的基地址。
 * @param to 要解析的地址。
 * @returns 返回已解析的地址。
 * @example relativeUrl("a/b/c", "a/b/d") // "../d"
 */
export declare function relativeUrl(base: string, url: string): string;
/**
 * 规范指定的地址格式。
 * @param url 要处理的地址。
 * @returns 返回处理后的地址。
 * @example normalizeUrl('abc/') // 'abc/'
 * @example normalizeUrl('./abc.js') // 'abc.js'
 */
export declare function normalizeUrl(url: string): string;
/**
 * 判断指定的地址是否是绝对地址。
 * @param url 要判断的地址。
 * @returns 如果是绝对地址则返回 true，否则返回 false。
 * @example isAbsoluteUrl('/') // true
 */
export declare function isAbsoluteUrl(url: string): boolean;