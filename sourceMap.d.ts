/**
 * 表示一个源映射字符串。
 */
export declare type SourceMapString = string;
/**
 * 表示一个源映射对象。
 * @see https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k
 * @see http://www.alloyteam.com/2014/01/source-map-version-3-introduction/
 */
export interface SourceMapObject {
    /**
     * 获取当前源映射的版本号。
     */
    version: number;
    /**
     * 获取生成文件的路径。
     */
    file?: string;
    /**
     * 获取所有源文件的根路径。
     */
    sourceRoot?: string;
    /**
     * 获取所有源文件路径。
     */
    sources: string[];
    /**
     * 获取所有源文件内容。
     */
    sourcesContent?: string[];
    /**
     * 获取所有名称。
     */
    names?: string[];
    /**
     * 获取所有映射点。
     */
    mappings: string;
}
/**
 * 表示一个索引映射对象。
 */
export interface IndexMapObject {
    /**
     * 获取当前索引映射的版本号。
     */
    version: number;
    /**
     * 获取生成文件路径。
     */
    file?: string;
    /**
     * 获取所有区域。
     */
    sections: {
        /**
         * 获取当前区域的偏移。
         */
        offset: {
            /**
             * 获取当前偏移的行号(从 0 开始)。
             */
            line: number;
            /**
             * 获取当前偏移的列号(从 0 开始)。
             */
            column: number;
        };
        /**
         * 获取当前区域的源映射地址。
         */
        url?: string;
        /**
         * 获取当前区域的源映射数据。
         */
        map?: SourceMapObject | IndexMapObject;
    }[];
}
/**
 * 表示一个源映射生成器。
 */
export interface SourceMapGenerator {
    /**
     * 生成源映射对象。
     */
    toJSON(): SourceMapObject | IndexMapObject;
    /**
     * 生成源映射字符串。
     */
    toString(): SourceMapString;
}
/**
 * 表示一个源映射字符串、对象或构建器。
 */
export declare type SourceMapData = SourceMapString | SourceMapObject | IndexMapObject | SourceMapGenerator;
/**
 * 将指定的源映射数据转为源映射字符串。
 * @param sourceMapData 要转换的源映射数据。
 * @return 返回源映射字符串。
 */
export declare function toSourceMapString(sourceMapData: SourceMapData): string;
/**
 * 将指定的源映射数据转为源映射对象。
 * @param sourceMapData 要转换的源映射数据。
 * @return 返回源映射对象。
 */
export declare function toSourceMapObject(sourceMapData: SourceMapData): SourceMapObject;
/**
 * 将指定的源映射数据转为源映射构建器。
 * @param sourceMapData 要转换的源映射数据。
 * @return 返回源映射构建器。
 */
export declare function toSourceMapBuilder(sourceMapData: SourceMapData): SourceMapBuilder;
/**
 * 表示一个源映射构建器。
 * @remark 提供解析、读取、生成、合并源映射的功能。
 */
export declare class SourceMapBuilder implements SourceMapGenerator {
    /**
     * 获取当前源映射构建器支持的版本号。
     */
    readonly version: number;
    /**
     * 获取或设置生成文件的路径。
     */
    file: string;
    /**
     * 获取或设置所有源文件的根路径。
     */
    sourceRoot: string;
    /**
     * 获取所有源文件路径。
     */
    sources: string[];
    /**
     * 获取所有源文件内容。
     */
    sourcesContent: string[];
    /**
     * 获取所有名称列表。
     */
    names: string[];
    /**
     * 获取所有映射点。
     */
    mappings: Mapping[][];
    /**
     * 添加一个源。
     * @param sourcePath 要添加的源地址。
     * @param sourceContent 要添加的源内容。
     * @return 返回源的索引。
     */
    addSource(sourcePath: string, sourceContent?: string): number;
    /**
     * 添加一个名称。
     * @param name 要添加的名称。
     * @return 返回名字的索引。
     */
    addName(name: string): number;
    /**
     * 获取指定源码的内容。
     * @param source 源码路径。
     * @return 返回源码内容。如果未包含指定的源内容，则返回 undefined。
     */
    getSourceContent(sourcePath: string): string;
    /**
     * 设置指定源码的内容。
     * @param sourcePath 源码路径。
     * @param content 源码内容。
     */
    setSourceContent(sourcePath: string, sourceContent: string): void;
    /**
     * 初始化新的源映射构建器。
     * @param sourceMapData 要转换的源映射数据。
     */
    constructor(sourceMapData?: SourceMapData);
    /**
     * 解析指定的源映射数据并合并到当前构建器。
     * @param sourceMapObject 要解析的源映射对象。
     */
    parse(sourceMapObject: SourceMapObject): void;
    /**
     * 将当前源映射转为等效的 JSON 对象。
     * @return 返回源映射对象。
     */
    toJSON(): SourceMapObject;
    /**
     * 将当前源映射转为等效的字符串。
     * @return 返回源映射字符串。
     */
    toString(): string;
    /**
     * 计算指定位置的源位置。
     * @param line 要获取的行号(从 0 开始)。
     * @param column 要获取的列号(从 0 开始)。
     * @return 返回源信息对象。
     */
    getSource(line: number, column: number): SourceLocation;
    /**
     * 添加一个映射点。
     * @param line 生成的行。
     * @param column 生成的列。
     * @param sourcePath 映射的源地址。
     * @param sourceLine 映射的行号。行号从 0 开始。
     * @param sourceColumn 映射的列号。列号从 0 开始。
     * @param name 映射的名称。
     * @return 返回添加的映射点。
     */
    addMapping(line: number, column: number, sourcePath?: string, sourceLine?: number, sourceColumn?: number, name?: string): Mapping;
    /**
     * 遍历所有映射点。
     * @param callback 要遍历的回调函数。
     * @param scope 设置 *callback* 中 this 的值。
     */
    eachMapping(callback: (line: number, column: number, sourcePath: string, sourceContent: string, sourceLine: number, sourceColumn: number, name: string, mapping: Mapping) => void, scope?: any): void;
    /**
     * 基于指定的源映射更新当前源映射的源码位置。
     * @param other 要应用的源映射。
     * @param file *other* 对应的源文件。如果未提供将使用 *other.file*。
     * @remark
     * 假如有源文件 A，通过一次生成得到 B，其映射表记作 T。
     * 现在基于 B，通过第二次生成得到 C，其映射表记作 M。
     * 那么就需要通过调用 `M.applySourceMap(T)`,
     * 将 M 更新为 A 到 C 的映射表。
     */
    applySourceMap(other: SourceMapBuilder, file?: string): void;
    /**
     * 自动补齐指定行的映射点。
     * @param start 开始补齐的行号。
     * @param end 结束补齐的行号。
     * @remark
     * 由于源映射 v3 不支持根据上一行的映射推断下一行的映射。
     * 因此在生成源映射 v3 时，必须插入每一行的映射点。
     * 此函数可以根据首行信息自动推断下一行的信息。
     */
    computeLines(start?: number, end?: number): void;
}
/**
 * 表示源映射中的一个映射点。
 */
export interface Mapping {
    /**
     * 获取当前映射的列。
     */
    column: number;
    /**
     * 获取或设置当前位置的源文件索引。索引从 0 开始。
     */
    sourceIndex?: number;
    /**
     * 获取或设置当前位置的源文件行号。行号从 0 开始。
     */
    sourceLine?: number;
    /**
     * 获取或设置当前位置的源文件列号。列号从 0 开始。
     */
    sourceColumn?: number;
    /**
     * 获取或设置当前位置的名称索引。索引从 0 开始。
     */
    nameIndex?: number;
}
/**
 * 表示一个源位置。
 */
export interface SourceLocation {
    /**
     * 原始映射点。
     */
    mapping?: Mapping;
    /**
     * 源文件路径。
     */
    sourcePath: string;
    /**
     * 源文件内容。
     */
    sourceContent?: string;
    /**
     * 源行号(从 0 开始)。
     */
    line: number;
    /**
     * 源列号(从 0 开始)。
     */
    column: number;
    /**
     * 源名称。
     */
    name?: string;
}
/**
 * 向指定内容插入 #sourceMappingURL 注释。
 * @param content 要插入的内容。
 * @param sourceMapUrl 要插入的源映射地址。如果地址为空则删除已存在的注释。
 * @param singleLineComment 如果为 true 则使用单行注释否则使用多行注释。
 */
export declare function emitSourceMapUrl(content: string, sourceMapUrl: string, singleLineComment?: boolean): string;
