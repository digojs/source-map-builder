/**
 * 表示一个源映射字符串。
 * @desc 源映射字符串一般是一个 JSON 对象序列号后的字符串。
 */
export declare type SourceMapString = string;
/**
 * 表示一个源映射对象。
 * @see https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k
 * @see http://www.alloyteam.com/2014/01/source-map-version-3-introduction/
 */
export interface SourceMapObject {
    /**
     * 获取或设置当前源映射的版本号。
     */
    version?: number;
    /**
     * 获取或设置生成文件的路径。
     */
    file?: string;
    /**
     * 获取或设置所有源文件的根路径。
     */
    sourceRoot?: string;
    /**
     * 获取或设置所有源文件路径。
     */
    sources?: string[];
    /**
     * 获取或设置所有源文件内容。
     */
    sourcesContent?: string[];
    /**
     * 获取或设置所有名称。
     */
    names?: string[];
    /**
     * 获取或设置所有映射点。
     */
    mappings?: string;
}
/**
 * 表示一个索引映射对象。
 */
export interface IndexMapObject {
    /**
     * 获取或设置当前索引映射的版本号。
     */
    version: number;
    /**
     * 获取或设置生成文件路径。
     */
    file?: string;
    /**
     * 获取或设置所有区段。
     */
    sections: {
        /**
         * 获取或设置当前区段在生成文件内的偏移位置。
         */
        offset: {
            /**
             * 获取或设置当前位置的行号(从 0 开始)。
             */
            line: number;
            /**
             * 获取或设置当前位置的列号(从 0 开始)。
             */
            column: number;
        };
        /**
         * 获取或设置当前区段的源映射地址。
         * @desc 对于一个区段来说，*url* 和 *map* 必须一个有值，另一个为空。
         */
        url?: string;
        /**
         * 获取或设置当前区段的源映射数据。
         * @desc 对于一个区段来说，*url* 和 *map* 必须一个有值，另一个为空。
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
     * @return 返回源映射对象。
     */
    toJSON(): SourceMapObject | IndexMapObject;
    /**
     * 生成源映射字符串。
     * @return 返回源映射字符串。
     */
    toString(): SourceMapString;
}
/**
 * 表示一个源映射数据。可以是字符串、对象或生成器中的任意一种格式。
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
 * @desc 源映射构建器提供了解析、读取、生成、合并源映射的功能。
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
     * 获取或设置所有源文件路径。
     */
    sources: string[];
    /**
     * 获取或设置所有源文件内容。
     */
    sourcesContent: string[];
    /**
     * 获取或设置所有名称列表。
     */
    names: string[];
    /**
     * 获取或设置所有映射点。
     */
    mappings: Mapping[][];
    /**
     * 添加一个源文件。
     * @param sourcePath 要添加的源文件路径。
     * @param sourceContent 要添加的源文件内容。
     * @return 返回源文件的索引。如果源文件路径为 undefined，则返回 undefined。
     */
    addSource(sourcePath: string, sourceContent?: string): number;
    /**
     * 添加一个名称。
     * @param name 要添加的名称。
     * @return 返回名称的索引。如果名称为 undefined，则返回 undefined。
     */
    addName(name: string): number;
    /**
     * 获取指定源文件的内容。
     * @param source 要获取的源文件路径。
     * @return 返回源文件的内容。如果未指定指定源文件路径的内容，则返回 undefined。
     */
    getSourceContent(sourcePath: string): string;
    /**
     * 设置指定源文件的内容。
     * @param sourcePath 要设置的源文件路径。
     * @param content 要设置的源文件内容。
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
     * 生成源映射对象。
     * @return 返回源映射对象。
     */
    toJSON(): SourceMapObject;
    /**
     * 生成源映射字符串。
     * @return 返回源映射字符串。
     */
    toString(): string;
    /**
     * 获取生成文件中指定位置的源位置。
     * @param generatedLine 生成文件中的行号(从 0 开始)。
     * @param generatedColumn 生成文件中的列号(从 0 开始)。
     * @return 返回包含源文件路径、内容、行列号等信息的源位置对象。
     */
    getSource(generatedLine: number, generatedColumn: number): SourceLocation;
    /**
     * 获取源文件中指定位置生成后的所有位置。
     * @param sourcePath 要获取的源文件路径。
     * @param sourceLine 源文件中的行号(从 0 开始)。
     * @param sourceColumn 源文件中的列号(从 0 开始)。
     * @return 返回所有生成文件中的行列信息。
     */
    getGenerated(sourcePath: string, sourceLine: number, sourceColumn: number): SourceLocation[];
    /**
     * 添加一个映射点。
     * @param generatedLine 生成的行号(从 0 开始)。
     * @param generatedColumn 生成的列号(从 0 开始)。
     * @param sourcePath 映射的源文件路径。
     * @param sourceLine 映射的源文件行号(从 0 开始)。
     * @param sourceColumn 映射的源文件列号(从 0 开始)。
     * @param name 映射的名称。
     * @return 返回添加的映射点。
     */
    addMapping(generatedLine: number, generatedColumn: number, sourcePath?: string, sourceLine?: number, sourceColumn?: number, name?: string): Mapping;
    /**
     * 遍历所有映射点。
     * @param callback 遍历的回调函数。
     */
    eachMapping(callback: (generatedLine: number, generatedColumn: number, sourcePath: string, sourceContent: string, sourceLine: number, sourceColumn: number, name: string, mapping: Mapping) => void): void;
    /**
     * 应用指定的源映射并更新当前源映射。
     * @param other 要应用的源映射。
     * @param file *other* 对应的生成文件路径。如果未提供将使用 *other.file*。
     * @desc
     * 假如有源文件 A，通过一次生成得到 B，其源映射记作 T。
     * 现在基于 B，通过第二次生成得到 C，其源映射记作 M。
     * 那么就需要调用 `M.applySourceMap(T)`，将 M 更新为 A 到 C 的源映射。
     */
    applySourceMap(other: SourceMapBuilder, file?: string): void;
    /**
     * 计算并填充所有行的映射点。
     * @param startLine 开始计算的行号(从 0 开始)。
     * @param endLine 结束计算的行号(从 0 开始)。
     * @desc
     * 由于源映射(版本 3)不支持根据上一行的映射自动推断下一行的映射。
     * 因此在生成源映射时必须手动插入每一行的映射点。
     * 此函数可以根据首行信息自动填充下一行的映射点。
     */
    computeLines(startLine?: number, endLine?: number): void;
}
/**
 * 表示源映射中的一个映射点。
 */
export interface Mapping {
    /**
     * 获取当前生成的列号(从 0 开始)。
     */
    readonly generatedColumn: number;
    /**
     * 获取或设置当前映射点的源文件索引(从 0 开始)。
     */
    sourceIndex?: number;
    /**
     * 获取或设置当前映射点的源文件行号(从 0 开始)。
     */
    sourceLine?: number;
    /**
     * 获取或设置当前映射点的源文件列号(从 0 开始)。
     */
    sourceColumn?: number;
    /**
     * 获取或设置当前映射点的名称索引(从 0 开始)。
     */
    nameIndex?: number;
}
/**
 * 表示一个源位置。
 */
export interface SourceLocation {
    /**
     * 获取相关的映射点。
     */
    mapping?: Mapping;
    /**
     * 获取相关的源文件路径。
     */
    sourcePath: string;
    /**
     * 获取相关的源文件内容。
     */
    sourceContent?: string;
    /**
     * 获取相关的行号(从 0 开始)。
     */
    line: number;
    /**
     * 获取相关的列号(从 0 开始)。
     */
    column: number;
    /**
     * 获取相关的名称。
     */
    name?: string;
}
/**
 * 在指定内容插入(如果已存在则更新)一个 #sourceMappingURL 注释。
 * @param content 要插入或更新的内容。
 * @param sourceMapUrl 要插入或更新的源映射地址。如果地址为空则删除已存在的注释。
 * @param singleLineComment 插入时如果为 true 则使用单行注释，否则使用多行注释。
 * @return 返回已更新的内容。
 */
export declare function emitSourceMapUrl(content: string, sourceMapUrl: string, singleLineComment?: boolean): string;
