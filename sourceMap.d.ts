/**
 * 表示一个源映射对象。
 * @see https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k
 * @see http://www.alloyteam.com/2014/01/source-map-version-3-introduction/
 */
export interface SourceMapObject {
    /**
     * 当前源映射的版本号。
     */
    version: number;
    /**
     * 生成文件的路径。
     */
    file?: string;
    /**
     * 所有源文件的根路径。
     */
    sourceRoot?: string;
    /**
     * 所有源文件路径。
     */
    sources: string[];
    /**
     * 所有源文件内容。
     */
    sourcesContent?: string[];
    /**
     * 所有名称。
     */
    names?: string[];
    /**
     * 所有映射点。
     */
    mappings: string;
}
/**
 * 表示一个索引映射对象。
 */
export interface IndexMapObject {
    /**
     * 当前索引映射的版本号。
     */
    version: number;
    /**
     * 生成文件的路径。
     */
    file?: string;
    /**
     * 所有片段。
     */
    sections: ({
        /**
         * 当前片段在生成文件内的偏移位置。
         */
        offset: {
            /**
             * 当前位置的行号(从 0 开始)。
             */
            line: number;
            /**
             * 当前位置的列号(从 0 开始)。
             */
            column: number;
        };
    } & ({
        /**
         * 当前片段的源映射地址。
         */
        url: string;
    } | {
        /**
         * 当前片段的源映射数据。
         */
        map: SourceMapObject | IndexMapObject;
    }))[];
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
    toString(): string;
}
/**
 * 表示一个源映射数据，可以是字符串、对象或生成器中的任意一种格式。
 */
export declare type SourceMapData = string | SourceMapObject | IndexMapObject | SourceMapGenerator;
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
     * 生成文件的路径。
     */
    file?: string;
    /**
     * 所有源文件的根路径。
     */
    sourceRoot?: string;
    /**
     * 所有源文件路径。
     */
    readonly sources: string[];
    /**
     * 所有源文件内容。
     */
    readonly sourcesContent: string[];
    /**
     * 所有名称列表。
     */
    readonly names: string[];
    /**
     * 所有映射点。
     */
    readonly mappings: Mapping[][];
    /**
     * 获取指定源文件的索引。
     * @param sourcePath 要获取的源文件路径。
     * @return 返回索引。如果找不到则返回 -1。
     */
    indexOfSource(sourcePath: string): number;
    /**
     * 添加一个源文件。
     * @param sourcePath 要添加的源文件路径。
     * @return 返回源文件的索引。
     */
    addSource(sourcePath: string): number;
    /**
     * 添加一个名称。
     * @param name 要添加的名称。
     * @return 返回名称的索引。
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
     * @param sourceContent 要设置的源文件内容。
     */
    setSourceContent(sourcePath: string, sourceContent: string): void;
    /**
     * 判断所有源文件是否都包含源码。
     */
    readonly hasContentsOfAllSources: boolean;
    /**
     * 初始化新的源映射构建器。
     * @param sourceMapData 要转换的源映射数据。
     */
    constructor(sourceMapData?: SourceMapData);
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
     * 获取生成文件中指定位置的源信息。
     * @param generatedLine 生成文件中的行号(从 0 开始)。
     * @param generatedColumn 生成文件中的列号(从 0 开始)。
     * @param alignColumn 如果为 true，则计算生成位置到有效映射点的列偏移。
     * @param alignLine 如果为 true，则计算生成位置到有效映射点的行偏移。
     * @return 返回包含源文件路径、内容、行列号等信息的源位置对象。
     */
    getSource(generatedLine: number, generatedColumn: number, alignColumn?: boolean, alignLine?: boolean): SourceLocation;
    /**
     * 获取源文件中指定位置生成后的所有位置。
     * @param sourcePath 要获取的源文件路径。
     * @param sourceLine 源文件中的行号(从 0 开始)。
     * @param sourceColumn 源文件中的列号(从 0 开始)。如果未提供则返回当期行所有列的生成信息。
     * @return 返回所有生成文件中的行列信息。
     */
    getAllGenerated(sourcePath: string, sourceLine: number, sourceColumn?: number): GeneratedLocation[];
    /**
     * 遍历所有映射点。
     * @param callback 遍历的回调函数。
     */
    eachMapping(callback: (generatedLine: number, c: number, sourcePath: string | undefined, sourceContent: string | undefined, sourceLine: number | undefined, sourceColumn: number | undefined, name: string | undefined, mapping: Mapping) => void): void;
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
     * 根据指定的源映射更新当前源映射。
     * @param other 要合并的源映射。
     * @param file 要合并的源映射所属的生成文件。
     * @desc
     * 假如有源文件 A，通过一次生成得到 B，其源映射记作 T。
     * 然后基于 B，通过第二次生成得到 C，其源映射记作 M。
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
     * 生成的列号(从 0 开始)。
     */
    readonly generatedColumn: number;
    /**
     * 源文件索引(从 0 开始)。
     */
    sourceIndex?: number;
    /**
     * 源文件行号(从 0 开始)。
     */
    sourceLine?: number;
    /**
     * 源文件列号(从 0 开始)。
     */
    sourceColumn?: number;
    /**
     * 名称索引(从 0 开始)。
     */
    nameIndex?: number;
}
/**
 * 表示一个源位置。
 */
export interface SourceLocation {
    /**
     * 映射点。
     */
    mapping: Mapping;
    /**
     * 源文件路径。
     */
    sourcePath?: string;
    /**
     * 行号(从 0 开始)。
     */
    line?: number;
    /**
     * 列号(从 0 开始)。
     */
    column?: number;
    /**
     * 名称。
     */
    name?: string;
}
/**
 * 表示一个生成位置。
 */
export interface GeneratedLocation {
    /**
     * 映射点。
     */
    mapping: Mapping;
    /**
     * 行号(从 0 开始)。
     */
    line: number;
    /**
     * 列号(从 0 开始)。
     */
    column: number;
}
/**
 * 在指定内容插入(如果已存在则更新)一个 #sourceMappingURL 注释。
 * @param content 要插入或更新的内容。
 * @param sourceMapUrl 要插入或更新的源映射地址。如果地址为空则删除已存在的注释。
 * @param singleLineComment 插入时如果为 true 则使用单行注释，否则使用多行注释。
 * @return 返回已更新的内容。
 */
export declare function emitSourceMapUrl(content: string, sourceMapUrl: string | null, singleLineComment?: boolean): string;
/**
 * 在指定内容末尾插入一个 #sourceMappingURL 注释。
 * @param content 要插入或更新的内容。
 * @param sourceMapUrl 要插入或更新的源映射地址。如果地址为空则删除已存在的注释。
 * @param singleLineComment 如果为 true 则使用单行注释，否则使用多行注释。
 * @return 返回已更新的内容。
 */
export declare function appendSourceMapUrl(content: string, sourceMapUrl: string, singleLineComment?: boolean): string;
