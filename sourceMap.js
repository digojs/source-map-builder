"use strict";
/**
 * @fileOverview 源映射
 * @author xuld <xuld@vip.qq.com>
 */
var url_1 = require("./url");
/**
 * 将指定的源映射数据转为源映射字符串。
 * @param sourceMapData 要转换的源映射数据。
 * @return 返回源映射字符串。
 */
function toSourceMapString(sourceMapData) {
    if (typeof sourceMapData === "string") {
        return sourceMapData;
    }
    return JSON.stringify(sourceMapData);
}
exports.toSourceMapString = toSourceMapString;
/**
 * 将指定的源映射数据转为源映射对象。
 * @param sourceMapData 要转换的源映射数据。
 * @return 返回源映射对象。
 */
function toSourceMapObject(sourceMapData) {
    // 为防止 XSS，源数据可能包含 )]}' 前缀。
    // https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#
    var sourceMapObject = typeof sourceMapData === "string" ?
        JSON.parse(sourceMapData.replace(/^\)]}'/, "")) :
        sourceMapData.toJSON ?
            sourceMapData.toJSON() :
            sourceMapData;
    if (sourceMapObject.sections) {
        throw new Error("Indexed Map is not implemented yet.");
    }
    if (sourceMapObject.version && sourceMapObject.version != 3) {
        throw new Error("Source Map v" + sourceMapObject.version + " is not implemented yet.");
    }
    return sourceMapObject;
}
exports.toSourceMapObject = toSourceMapObject;
/**
 * 将指定的源映射数据转为源映射构建器。
 * @param sourceMapData 要转换的源映射数据。
 * @return 返回源映射构建器。
 */
function toSourceMapBuilder(sourceMapData) {
    if (sourceMapData instanceof SourceMapBuilder) {
        return sourceMapData;
    }
    return new SourceMapBuilder(sourceMapData);
}
exports.toSourceMapBuilder = toSourceMapBuilder;
/**
 * 表示一个源映射构建器。
 * @remark 提供解析、读取、生成、合并源映射的功能。
 */
var SourceMapBuilder = (function () {
    // #endregion
    // #region 解析和格式化
    /**
     * 初始化新的源映射构建器。
     * @param sourceMapData 要转换的源映射数据。
     */
    function SourceMapBuilder(sourceMapData) {
        /**
         * 获取所有源文件路径。
         */
        this.sources = [];
        /**
         * 获取所有源文件内容。
         */
        this.sourcesContent = [];
        /**
         * 获取所有名称列表。
         */
        this.names = [];
        /**
         * 获取所有映射点。
         */
        this.mappings = [];
        if (sourceMapData) {
            this.parse(toSourceMapObject(sourceMapData));
        }
    }
    Object.defineProperty(SourceMapBuilder.prototype, "version", {
        // #region 属性
        /**
         * 获取当前源映射构建器支持的版本号。
         */
        get: function () { return 3; },
        enumerable: true,
        configurable: true
    });
    /**
     * 添加一个源。
     * @param sourcePath 要添加的源地址。
     * @param sourceContent 要添加的源内容。
     * @return 返回源的索引。
     */
    SourceMapBuilder.prototype.addSource = function (sourcePath, sourceContent) {
        if (sourcePath == undefined) {
            return;
        }
        sourcePath = this.sourceRoot ? url_1.resolveUrl(this.sourceRoot + "/", sourcePath) : url_1.normalizeUrl(sourcePath);
        var sourceIndex = this.sources.indexOf(sourcePath);
        if (sourceIndex < 0)
            this.sources[sourceIndex = this.sources.length] = sourcePath;
        if (sourceContent != undefined)
            this.sourcesContent[sourceIndex] = sourceContent;
        return sourceIndex;
    };
    /**
     * 添加一个名称。
     * @param name 要添加的名称。
     * @return 返回名字的索引。
     */
    SourceMapBuilder.prototype.addName = function (name) {
        if (name == undefined) {
            return;
        }
        var nameIndex = this.names.indexOf(name);
        if (nameIndex < 0)
            this.names[nameIndex = this.names.length] = name;
        return nameIndex;
    };
    /**
     * 获取指定源码的内容。
     * @param source 源码路径。
     * @return 返回源码内容。如果未包含指定的源内容，则返回 undefined。
     */
    SourceMapBuilder.prototype.getSourceContent = function (sourcePath) {
        return this.sourcesContent[this.sources.indexOf(sourcePath)];
    };
    /**
     * 设置指定源码的内容。
     * @param sourcePath 源码路径。
     * @param content 源码内容。
     */
    SourceMapBuilder.prototype.setSourceContent = function (sourcePath, sourceContent) {
        var index = this.sources.indexOf(sourcePath);
        if (index >= 0) {
            this.sourcesContent[index] = sourceContent;
        }
    };
    /**
     * 解析指定的源映射数据并合并到当前构建器。
     * @param sourceMapObject 要解析的源映射对象。
     */
    SourceMapBuilder.prototype.parse = function (sourceMapObject) {
        if (sourceMapObject.file) {
            this.file = url_1.normalizeUrl(sourceMapObject.file);
        }
        if (sourceMapObject.sourceRoot) {
            this.sourceRoot = sourceMapObject.sourceRoot.replace(/\/$/, "");
        }
        if (sourceMapObject.sources) {
            for (var i = 0; i < sourceMapObject.sources.length; i++) {
                this.sources[i] = sourceMapObject.sourceRoot ? url_1.resolveUrl(sourceMapObject.sourceRoot + "/", sourceMapObject.sources[i]) : url_1.normalizeUrl(sourceMapObject.sources[i]);
            }
        }
        if (sourceMapObject.sourcesContent) {
            (_a = this.sourcesContent).push.apply(_a, sourceMapObject.sourcesContent);
        }
        if (sourceMapObject.names) {
            (_b = this.names).push.apply(_b, sourceMapObject.names);
        }
        if (sourceMapObject.mappings) {
            var context = { start: 0 };
            var line = 0;
            var mappings = this.mappings[0] = [];
            var prevColumn = 0;
            var prevSourceIndex = 0;
            var prevSourceLine = 0;
            var prevSourceColumn = 0;
            var prevNameIndex = 0;
            while (context.start < sourceMapObject.mappings.length) {
                var ch = sourceMapObject.mappings.charCodeAt(context.start);
                if (ch !== 59 /*;*/ && ch !== 44 /*,*/) {
                    var mapping = {
                        column: prevColumn += decodeBase64Vlq(sourceMapObject.mappings, context)
                    };
                    mappings.push(mapping);
                    if (context.start === sourceMapObject.mappings.length)
                        break;
                    ch = sourceMapObject.mappings.charCodeAt(context.start);
                    if (ch !== 59 /*;*/ && ch !== 44 /*,*/) {
                        mapping.sourceIndex = prevSourceIndex += decodeBase64Vlq(sourceMapObject.mappings, context);
                        mapping.sourceLine = prevSourceLine += decodeBase64Vlq(sourceMapObject.mappings, context);
                        mapping.sourceColumn = prevSourceColumn += decodeBase64Vlq(sourceMapObject.mappings, context);
                        if (context.start === sourceMapObject.mappings.length)
                            break;
                        ch = sourceMapObject.mappings.charCodeAt(context.start);
                        if (ch !== 59 /*;*/ && ch !== 44 /*,*/) {
                            mapping.nameIndex = prevNameIndex += decodeBase64Vlq(sourceMapObject.mappings, context);
                            if (context.start === sourceMapObject.mappings.length)
                                break;
                            ch = sourceMapObject.mappings.charCodeAt(context.start);
                        }
                    }
                }
                context.start++;
                if (ch === 59 /*;*/) {
                    this.mappings[++line] = mappings = [];
                    prevColumn = 0;
                }
            }
        }
        var _a, _b;
    };
    /**
     * 将当前源映射转为等效的 JSON 对象。
     * @return 返回源映射对象。
     */
    SourceMapBuilder.prototype.toJSON = function () {
        var result = {
            version: this.version,
            sources: [],
            mappings: ""
        };
        if (this.file) {
            result.file = this.file;
        }
        if (this.sourceRoot) {
            result.sourceRoot = this.sourceRoot;
        }
        for (var i = 0; i < this.sources.length; i++) {
            result.sources[i] = this.sourceRoot ? url_1.relativeUrl(this.sourceRoot + "/", this.sources[i]) : this.sources[i];
        }
        if (this.sourcesContent && this.sourcesContent.length) {
            result.sourcesContent = this.sourcesContent;
        }
        if (this.names && this.names.length) {
            result.names = this.names;
        }
        if (this.mappings && this.mappings.length) {
            var prevSourceIndex = 0;
            var prevSourceLine = 0;
            var prevSourceColumn = 0;
            var prevNameIndex = 0;
            for (var i = 0; i < this.mappings.length; i++) {
                if (i > 0)
                    result.mappings += ";";
                var mappings = this.mappings[i];
                if (mappings) {
                    var prevColumn = 0;
                    for (var j = 0; j < mappings.length; j++) {
                        if (j > 0)
                            result.mappings += ",";
                        var mapping = mappings[j];
                        result.mappings += encodeBase64Vlq(mapping.column - prevColumn);
                        prevColumn = mapping.column;
                        if (mapping.sourceIndex != undefined && mapping.sourceLine != undefined && mapping.sourceColumn != undefined) {
                            result.mappings += encodeBase64Vlq(mapping.sourceIndex - prevSourceIndex);
                            prevSourceIndex = mapping.sourceIndex;
                            result.mappings += encodeBase64Vlq(mapping.sourceLine - prevSourceLine);
                            prevSourceLine = mapping.sourceLine;
                            result.mappings += encodeBase64Vlq(mapping.sourceColumn - prevSourceColumn);
                            prevSourceColumn = mapping.sourceColumn;
                            if (mapping.nameIndex != undefined) {
                                result.mappings += encodeBase64Vlq(mapping.nameIndex - prevNameIndex);
                                prevNameIndex = mapping.nameIndex;
                            }
                        }
                    }
                }
            }
        }
        return result;
    };
    /**
     * 将当前源映射转为等效的字符串。
     * @return 返回源映射字符串。
     */
    SourceMapBuilder.prototype.toString = function () { return JSON.stringify(this); };
    // #endregion
    // #region 处理
    /**
     * 计算指定位置的源位置。
     * @param line 要获取的行号(从 0 开始)。
     * @param column 要获取的列号(从 0 开始)。
     * @return 返回源信息对象。
     */
    SourceMapBuilder.prototype.getSource = function (line, column) {
        // 搜索当前行指定列的映射。
        var mappings = this.mappings[line];
        if (mappings) {
            for (var i = mappings.length; --i >= 0;) {
                var mapping = mappings[i];
                if (column >= mapping.column) {
                    var result = {
                        mapping: mapping,
                        sourcePath: mapping.sourceIndex == undefined ? this.file : this.sources[mapping.sourceIndex],
                        sourceContent: mapping.sourceIndex == undefined ? undefined : this.sourcesContent[mapping.sourceIndex],
                        line: mapping.sourceLine,
                        column: mapping.sourceColumn + column - mapping.column
                    };
                    if (column === mapping.column && mapping.nameIndex != undefined) {
                        result.name = this.names[mapping.nameIndex];
                    }
                    return result;
                }
            }
        }
        // 当前行不存在对应的映射，搜索上一行的映射信息。
        for (var i = line; --i >= 0;) {
            if (this.mappings[i] && this.mappings[i].length) {
                var mapping = this.mappings[i][this.mappings[i].length - 1];
                return {
                    mapping: mapping,
                    sourcePath: mapping.sourceIndex == undefined ? this.file : this.sources[mapping.sourceIndex],
                    sourceContent: mapping.sourceIndex == undefined ? undefined : this.sourcesContent[mapping.sourceIndex],
                    line: mapping.sourceLine + line - i,
                    column: column
                };
            }
        }
        // 找不到映射点，直接返回源位置。
        return {
            /**
             * 源文件路径。
             */
            sourcePath: this.file,
            /**
             * 源行号。行号从 0 开始。
             */
            line: line,
            /**
             * 源列号。列号从 0 开始。
             */
            column: column,
        };
    };
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
    SourceMapBuilder.prototype.addMapping = function (line, column, sourcePath, sourceLine, sourceColumn, name) {
        // 创建映射点。
        var mapping = {
            column: column
        };
        if (sourcePath != undefined && sourceLine != undefined && sourceColumn != undefined) {
            mapping.sourceIndex = this.addSource(sourcePath);
            mapping.sourceLine = sourceLine;
            mapping.sourceColumn = sourceColumn;
            if (name != undefined) {
                mapping.nameIndex = this.addName(name);
            }
        }
        // 插入排序。
        var mappings = this.mappings[line];
        if (!mappings) {
            this.mappings[line] = [mapping];
        }
        else if (!mappings.length || column >= mappings[mappings.length - 1].column) {
            mappings.push(mapping);
        }
        else {
            for (var i = mappings.length; --i >= 0;) {
                if (column >= mappings[i].column) {
                    if (column === mappings[i].column) {
                        mappings[i] = mapping;
                    }
                    else {
                        mappings.splice(i + 1, 0, mapping);
                    }
                    return mapping;
                }
            }
            mappings.unshift(mapping);
        }
        return mapping;
    };
    /**
     * 遍历所有映射点。
     * @param callback 要遍历的回调函数。
     * @param scope 设置 *callback* 中 this 的值。
     */
    SourceMapBuilder.prototype.eachMapping = function (callback, scope) {
        for (var i = 0; i < this.mappings.length; i++) {
            var mappings = this.mappings[i];
            if (mappings) {
                for (var j = 0; j < mappings.length; j++) {
                    var mapping = mappings[j];
                    callback.call(scope, i, mapping.column, mapping.sourceIndex == undefined ? this.file : this.sources[mapping.sourceIndex], mapping.sourceIndex == undefined ? undefined : this.sourcesContent[mapping.sourceIndex], mapping.sourceLine, mapping.sourceColumn, this.names[mapping.nameIndex], mapping);
                }
            }
        }
    };
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
    SourceMapBuilder.prototype.applySourceMap = function (other, file) {
        // 合并映射表的算法为：
        // 对于 M 中的每一条映射 p，如果 p.source 同 T.file，
        // 则将其源行列号更新为 T 中指定的源码和源行列号。
        // 只有源索引为 expectedSourceIndex 的映射才能基于 T 更新。
        var expectedSourceIndex = file != undefined ? this.sources.indexOf(file) : other.file != undefined ? this.sources.indexOf(other.file) : 0;
        if (expectedSourceIndex < 0)
            return;
        for (var _i = 0, _a = this.mappings; _i < _a.length; _i++) {
            var mappings = _a[_i];
            if (mappings) {
                for (var i = 0; i < mappings.length; i++) {
                    var mapping = mappings[i];
                    if (mapping.sourceIndex === expectedSourceIndex) {
                        // 下一个映射点。
                        var nextColumn = i + 1 < mappings.length && mappings[i + 1].column || Infinity;
                        // 在 M 中 mapping.column 到 nextColumn 之间不存在其它映射。
                        // 但是在 T 中对应的区间则可能包含多个映射，这些映射要重新拷贝到 M。
                        if (other.mappings[mapping.sourceLine]) {
                            for (var _b = 0, _c = other.mappings[mapping.sourceLine]; _b < _c.length; _b++) {
                                var targetMapping = _c[_b];
                                if (targetMapping.column > mapping.sourceColumn) {
                                    // 根据 T 中的列号反推 M 的索引：
                                    // mapping.column -> mapping.sourceColumn
                                    // ? -> targetMapping.column
                                    var column = mapping.column + targetMapping.column - mapping.sourceColumn;
                                    // M 中已经指定了 column 的映射，忽略 T 的剩余映射。
                                    if (column >= nextColumn) {
                                        break;
                                    }
                                    // 拷贝 T 多余的映射点到 M。
                                    var m = {
                                        column: column,
                                        sourceIndex: this.addSource(other.sources[targetMapping.sourceIndex]),
                                        sourceLine: targetMapping.sourceLine,
                                        sourceColumn: targetMapping.sourceColumn
                                    };
                                    if (targetMapping.nameIndex != undefined) {
                                        m.nameIndex = this.addName(other.names[targetMapping.nameIndex]);
                                    }
                                    mappings.splice(++i, 0, m);
                                }
                            }
                        }
                        // 更新当前映射信息。
                        var source = other.getSource(mapping.sourceLine, mapping.sourceColumn);
                        mapping.sourceIndex = this.addSource(source.sourcePath);
                        mapping.sourceLine = source.line;
                        mapping.sourceColumn = source.column;
                        if (source.name != undefined) {
                            mapping.nameIndex = this.addName(source.name);
                        }
                    }
                }
            }
        }
    };
    /**
     * 自动补齐指定行的映射点。
     * @param start 开始补齐的行号。
     * @param end 结束补齐的行号。
     * @remark
     * 由于源映射 v3 不支持根据上一行的映射推断下一行的映射。
     * 因此在生成源映射 v3 时，必须插入每一行的映射点。
     * 此函数可以根据首行信息自动推断下一行的信息。
     */
    SourceMapBuilder.prototype.computeLines = function (start, end) {
        if (start === void 0) { start = 0; }
        if (end === void 0) { end = this.mappings.length; }
        for (; start < end; start++) {
            var mappings = this.mappings[start] || (this.mappings[start] = []);
            if (!mappings[0] || mappings[0].column > 0) {
                for (var line = start; --line >= 0;) {
                    var last = this.mappings[line] && this.mappings[line][0];
                    if (last && last.sourceLine != undefined && last.sourceColumn != undefined) {
                        mappings.unshift({
                            column: 0,
                            sourceIndex: last.sourceIndex,
                            sourceLine: last.sourceLine + start - line,
                            sourceColumn: 0
                        });
                        break;
                    }
                }
            }
        }
    };
    return SourceMapBuilder;
}());
exports.SourceMapBuilder = SourceMapBuilder;
var base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
/**
 * 编码一个 Base64-VLQ 值。
 * @param value 要计算的值。
 * @return 返回已编码的字符串。
 */
function encodeBase64Vlq(value) {
    var result = "";
    var vlq = value < 0 ? ((-value) << 1) + 1 : (value << 1);
    do {
        var digit = vlq & 31;
        vlq >>>= 5;
        result += base64Chars[vlq > 0 ? digit | 32 /*1<<5*/ : digit];
    } while (vlq > 0);
    return result;
}
/**
 * 编码一个 Base64-VLQ 值。
 * @param value 要计算的值。
 * @param context 开始解码的位置。解码结束后更新为下一次需要解码的位置。
 * @return 返回已解码的数字。如果解析错误则返回 NaN。
 */
function decodeBase64Vlq(value, context) {
    var vlq = 0;
    var shift = 0;
    do {
        var ch = value.charCodeAt(context.start++);
        var digit = 65 /*A*/ <= ch && ch <= 90 /*Z*/ ? ch - 65 /*A*/ :
            97 /*a*/ <= ch && ch <= 122 /*z*/ ? ch - 71 /*'a' - 26*/ :
                48 /*0*/ <= ch && ch <= 57 /*9*/ ? ch + 4 /*'0' - 26*/ :
                    ch === 43 /*+*/ ? 62 :
                        ch === 47 /*/*/ ? 63 :
                            NaN;
        vlq += ((digit & 31 /*(1<<5)-1*/) << shift);
        shift += 5;
    } while (digit & 32 /*1<<5*/);
    return vlq & 1 ? -(vlq >> 1) : vlq >> 1;
}
/**
 * 向指定内容插入 #sourceMappingURL 注释。
 * @param content 要插入的内容。
 * @param sourceMapUrl 要插入的源映射地址。如果地址为空则删除已存在的注释。
 * @param singleLineComment 如果为 true 则使用单行注释否则使用多行注释。
 */
function emitSourceMapUrl(content, sourceMapUrl, singleLineComment) {
    var found = false;
    content = content.replace(/(?:\/\*(?:\s*\r?\n(?:\/\/)?)?(?:[#@]\ssourceMappingURL=([^\s'"]*))\s*\*\/|\/\/(?:[#@]\ssourceMappingURL=([^\s'"]*)))\s*/, function (_, url1, url2) {
        found = true;
        return sourceMapUrl ? url2 != null ? "//# sourceMappingURL=" + sourceMapUrl : "/*# sourceMappingURL=" + sourceMapUrl + " */" : "";
    });
    if (!found && sourceMapUrl) {
        content += singleLineComment ? "\n//# sourceMappingURL=" + sourceMapUrl : "\n/*# sourceMappingURL=" + sourceMapUrl + " */";
    }
    return content;
}
exports.emitSourceMapUrl = emitSourceMapUrl;
