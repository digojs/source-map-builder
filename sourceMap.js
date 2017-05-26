"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    if (typeof sourceMapData === "string") {
        // 为防止 XSS，源数据可能包含 )]}' 前缀。
        // https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#
        sourceMapData = JSON.parse(sourceMapData.replace(/^\)]}'/, ""));
    }
    else if (sourceMapData.toJSON) {
        sourceMapData = sourceMapData.toJSON();
    }
    if (sourceMapData.sections) {
        throw new TypeError("Indexed Map is not supported.");
    }
    if (sourceMapData.version && sourceMapData.version != 3) {
        throw new TypeError("Source Map v" + sourceMapData.version + " is not supported.");
    }
    return sourceMapData;
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
 * @desc 源映射构建器提供了解析、读取、生成、合并源映射的功能。
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
         * 所有源文件路径。
         */
        this.sources = [];
        /**
         * 所有源文件内容。
         */
        this.sourcesContent = [];
        /**
         * 所有名称列表。
         */
        this.names = [];
        /**
         * 所有映射点。
         */
        this.mappings = [];
        if (sourceMapData) {
            sourceMapData = toSourceMapObject(sourceMapData);
            if (sourceMapData.file != undefined) {
                this.file = sourceMapData.file;
            }
            if (sourceMapData.sourceRoot != undefined) {
                this.sourceRoot = sourceMapData.sourceRoot;
            }
            if (sourceMapData.sources) {
                (_a = this.sources).push.apply(_a, sourceMapData.sources);
            }
            if (sourceMapData.sourcesContent) {
                (_b = this.sourcesContent).push.apply(_b, sourceMapData.sourcesContent);
            }
            if (sourceMapData.names) {
                (_c = this.names).push.apply(_c, sourceMapData.names);
            }
            if (sourceMapData.mappings != undefined) {
                var context = { index: 0 };
                var line = 0;
                var mappings = this.mappings[0] = [];
                var prevColumn = 0;
                var prevSourceIndex = 0;
                var prevSourceLine = 0;
                var prevSourceColumn = 0;
                var prevNameIndex = 0;
                while (context.index < sourceMapData.mappings.length) {
                    var ch = sourceMapData.mappings.charCodeAt(context.index);
                    if (ch !== 59 /*;*/ && ch !== 44 /*,*/) {
                        var mapping = {
                            generatedColumn: prevColumn += decodeBase64Vlq(sourceMapData.mappings, context)
                        };
                        mappings.push(mapping);
                        if (context.index === sourceMapData.mappings.length) {
                            break;
                        }
                        ch = sourceMapData.mappings.charCodeAt(context.index);
                        if (ch !== 59 /*;*/ && ch !== 44 /*,*/) {
                            mapping.sourceIndex = prevSourceIndex += decodeBase64Vlq(sourceMapData.mappings, context);
                            mapping.sourceLine = prevSourceLine += decodeBase64Vlq(sourceMapData.mappings, context);
                            mapping.sourceColumn = prevSourceColumn += decodeBase64Vlq(sourceMapData.mappings, context);
                            if (context.index === sourceMapData.mappings.length) {
                                break;
                            }
                            ch = sourceMapData.mappings.charCodeAt(context.index);
                            if (ch !== 59 /*;*/ && ch !== 44 /*,*/) {
                                mapping.nameIndex = prevNameIndex += decodeBase64Vlq(sourceMapData.mappings, context);
                                if (context.index === sourceMapData.mappings.length) {
                                    break;
                                }
                                ch = sourceMapData.mappings.charCodeAt(context.index);
                            }
                        }
                    }
                    context.index++;
                    if (ch === 59 /*;*/) {
                        this.mappings[++line] = mappings = [];
                        prevColumn = 0;
                    }
                }
            }
        }
        var _a, _b, _c;
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
     * 获取指定源文件的索引。
     * @param sourcePath 要获取的源文件路径。
     * @return 返回索引。如果找不到则返回 -1。
     */
    SourceMapBuilder.prototype.indexOfSource = function (sourcePath) {
        if (!this.sources.length) {
            return -1;
        }
        var sourceIndex = this.sources.indexOf(sourcePath);
        if (sourceIndex < 0) {
            sourcePath = sourcePath.toLowerCase();
            for (sourceIndex = this.sources.length; --sourceIndex >= 0;) {
                if (this.sources[sourceIndex].toLowerCase() == sourcePath) {
                    break;
                }
            }
        }
        return sourceIndex;
    };
    /**
     * 添加一个源文件。
     * @param sourcePath 要添加的源文件路径。
     * @return 返回源文件的索引。
     */
    SourceMapBuilder.prototype.addSource = function (sourcePath) {
        var sourceIndex = this.indexOfSource(sourcePath);
        if (sourceIndex < 0) {
            this.sources[sourceIndex = this.sources.length] = sourcePath;
        }
        return sourceIndex;
    };
    /**
     * 添加一个名称。
     * @param name 要添加的名称。
     * @return 返回名称的索引。
     */
    SourceMapBuilder.prototype.addName = function (name) {
        var nameIndex = this.names.indexOf(name);
        if (nameIndex < 0) {
            this.names[nameIndex = this.names.length] = name;
        }
        return nameIndex;
    };
    /**
     * 获取指定源文件的内容。
     * @param source 要获取的源文件路径。
     * @return 返回源文件的内容。如果未指定指定源文件路径的内容，则返回 undefined。
     */
    SourceMapBuilder.prototype.getSourceContent = function (sourcePath) {
        var sourceIndex = this.indexOfSource(sourcePath);
        return sourceIndex < 0 ? undefined : this.sourcesContent[sourceIndex];
    };
    /**
     * 设置指定源文件的内容。
     * @param sourcePath 要设置的源文件路径。
     * @param sourceContent 要设置的源文件内容。
     */
    SourceMapBuilder.prototype.setSourceContent = function (sourcePath, sourceContent) {
        var sourceIndex = this.indexOfSource(sourcePath);
        if (sourceIndex >= 0) {
            this.sourcesContent[sourceIndex] = sourceContent;
        }
    };
    Object.defineProperty(SourceMapBuilder.prototype, "hasContentsOfAllSources", {
        /**
         * 判断所有源文件是否都包含源码。
         */
        get: function () {
            var _this = this;
            return this.sources.every(function (source, index) { return _this.sourcesContent[index] != null; });
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 生成源映射对象。
     * @return 返回源映射对象。
     */
    SourceMapBuilder.prototype.toJSON = function () {
        var result = {
            version: this.version
        };
        if (this.file != undefined) {
            result.file = this.file;
        }
        if (this.sourceRoot != undefined) {
            result.sourceRoot = this.sourceRoot;
        }
        result.sources = this.sources;
        result.mappings = "";
        if (this.mappings && this.mappings.length) {
            var prevSourceIndex = 0;
            var prevSourceLine = 0;
            var prevSourceColumn = 0;
            var prevNameIndex = 0;
            for (var i = 0; i < this.mappings.length; i++) {
                if (i > 0) {
                    result.mappings += ";";
                }
                var mappings = this.mappings[i];
                if (mappings) {
                    var prevColumn = 0;
                    for (var j = 0; j < mappings.length; j++) {
                        if (j > 0) {
                            result.mappings += ",";
                        }
                        var mapping = mappings[j];
                        result.mappings += encodeBase64Vlq(mapping.generatedColumn - prevColumn);
                        prevColumn = mapping.generatedColumn;
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
        if (this.names.length) {
            result.names = this.names;
        }
        if (this.sourcesContent.length) {
            result.sourcesContent = this.sourcesContent;
        }
        return result;
    };
    /**
     * 生成源映射字符串。
     * @return 返回源映射字符串。
     */
    SourceMapBuilder.prototype.toString = function () { return JSON.stringify(this); };
    // #endregion
    // #region 处理
    /**
     * 获取生成文件中指定位置的源信息。
     * @param generatedLine 生成文件中的行号(从 0 开始)。
     * @param generatedColumn 生成文件中的列号(从 0 开始)。
     * @param alignColumn 如果为 true，则计算生成位置到有效映射点的列偏移。
     * @param alignLine 如果为 true，则计算生成位置到有效映射点的行偏移。
     * @return 返回包含源文件路径、内容、行列号等信息的源位置对象。
     */
    SourceMapBuilder.prototype.getSource = function (generatedLine, generatedColumn, alignColumn, alignLine) {
        if (alignColumn === void 0) { alignColumn = false; }
        if (alignLine === void 0) { alignLine = false; }
        // 搜索当前行指定列的映射。
        var mappings = this.mappings[generatedLine];
        if (mappings) {
            for (var i = mappings.length; --i >= 0;) {
                var mapping = mappings[i];
                if (generatedColumn >= mapping.generatedColumn) {
                    var result = { mapping: mapping };
                    if (mapping.sourceIndex != undefined) {
                        result.sourcePath = this.sources[mapping.sourceIndex];
                        result.line = mapping.sourceLine;
                        result.column = mapping.sourceColumn + (alignColumn ? generatedColumn - mapping.generatedColumn : 0);
                        if (mapping.nameIndex != undefined) {
                            result.name = this.names[mapping.nameIndex];
                        }
                    }
                    return result;
                }
            }
        }
        // 当前行不存在对应的映射，就近搜索映射信息。
        if (alignLine) {
            for (var i = generatedLine; --i >= 0;) {
                var mappings_1 = this.mappings[i];
                if (mappings_1 && mappings_1.length) {
                    var mapping = mappings_1[mappings_1.length - 1];
                    var result = { mapping: mapping };
                    if (mapping.sourceIndex != undefined) {
                        result.sourcePath = this.sources[mapping.sourceIndex];
                        result.line = mapping.sourceLine + generatedLine - i;
                        result.column = alignColumn ? generatedColumn : 0;
                        if (mapping.nameIndex != undefined) {
                            result.name = this.names[mapping.nameIndex];
                        }
                    }
                    return result;
                }
            }
        }
    };
    /**
     * 获取源文件中指定位置生成后的所有位置。
     * @param sourcePath 要获取的源文件路径。
     * @param sourceLine 源文件中的行号(从 0 开始)。
     * @param sourceColumn 源文件中的列号(从 0 开始)。如果未提供则返回当期行所有列的生成信息。
     * @return 返回所有生成文件中的行列信息。
     */
    SourceMapBuilder.prototype.getAllGenerated = function (sourcePath, sourceLine, sourceColumn) {
        var result = [];
        var sourceIndex = this.indexOfSource(sourcePath);
        if (sourceIndex >= 0) {
            var minColumnOffset = Infinity;
            for (var i = 0; i < this.mappings.length; i++) {
                var mappings = this.mappings[i];
                if (mappings) {
                    for (var _i = 0, mappings_2 = mappings; _i < mappings_2.length; _i++) {
                        var mapping = mappings_2[_i];
                        if (mapping.sourceIndex === sourceIndex && mapping.sourceLine === sourceLine) {
                            // 如果列为空则只需满足行。
                            if (sourceColumn == undefined) {
                                result.push({
                                    mapping: mapping,
                                    line: i,
                                    column: mapping.generatedColumn
                                });
                            }
                            else {
                                // 需要找到指定的源位置之前但更近或者一样近的映射点。
                                var columnOffset = sourceColumn - mapping.sourceColumn;
                                if (columnOffset >= 0 && columnOffset <= minColumnOffset) {
                                    // 当找到更近的映射点时，只保留最近的映射点。
                                    if (columnOffset !== minColumnOffset) {
                                        result.length = 0;
                                    }
                                    result.push({
                                        mapping: mapping,
                                        line: i,
                                        column: mapping.generatedColumn
                                    });
                                    minColumnOffset = columnOffset;
                                }
                            }
                        }
                    }
                }
            }
        }
        return result;
    };
    /**
     * 遍历所有映射点。
     * @param callback 遍历的回调函数。
     */
    SourceMapBuilder.prototype.eachMapping = function (callback) {
        for (var i = 0; i < this.mappings.length; i++) {
            var mappings = this.mappings[i];
            if (mappings) {
                for (var _i = 0, mappings_3 = mappings; _i < mappings_3.length; _i++) {
                    var mapping = mappings_3[_i];
                    callback(i, mapping.generatedColumn, mapping.sourceIndex == undefined ? undefined : this.sources[mapping.sourceIndex], mapping.sourceIndex == undefined ? undefined : this.sourcesContent[mapping.sourceIndex], mapping.sourceLine, mapping.sourceColumn, mapping.nameIndex == undefined ? undefined : this.names[mapping.nameIndex], mapping);
                }
            }
        }
    };
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
    SourceMapBuilder.prototype.addMapping = function (generatedLine, generatedColumn, sourcePath, sourceLine, sourceColumn, name) {
        // 创建映射点。
        var mapping = {
            generatedColumn: generatedColumn
        };
        if (sourcePath != undefined) {
            mapping.sourceIndex = this.addSource(sourcePath);
            mapping.sourceLine = sourceLine;
            mapping.sourceColumn = sourceColumn;
            if (name != undefined) {
                mapping.nameIndex = this.addName(name);
            }
        }
        // 插入排序：确保同一行内的所有映射点按生成列的顺序存储。
        var mappings = this.mappings[generatedLine];
        if (!mappings) {
            this.mappings[generatedLine] = [mapping];
        }
        else if (!mappings.length || generatedColumn >= mappings[mappings.length - 1].generatedColumn) {
            mappings.push(mapping);
        }
        else {
            for (var i = mappings.length; --i >= 0;) {
                if (generatedColumn >= mappings[i].generatedColumn) {
                    if (generatedColumn === mappings[i].generatedColumn) {
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
     * 根据指定的源映射更新当前源映射。
     * @param other 要合并的源映射。
     * @param file 要合并的源映射所属的生成文件。
     * @desc
     * 假如有源文件 A，通过一次生成得到 B，其源映射记作 T。
     * 然后基于 B，通过第二次生成得到 C，其源映射记作 M。
     * 那么就需要调用 `M.applySourceMap(T)`，将 M 更新为 A 到 C 的源映射。
     */
    SourceMapBuilder.prototype.applySourceMap = function (other, file) {
        if (file === void 0) { file = other.file; }
        var sourceIndex = file != undefined ? this.indexOfSource(file) : 0;
        if (sourceIndex >= 0) {
            this.sources.splice(sourceIndex, 1);
            this.sourcesContent.splice(sourceIndex, 1);
            for (var _i = 0, _a = this.mappings; _i < _a.length; _i++) {
                var mappings = _a[_i];
                if (mappings) {
                    for (var _b = 0, mappings_4 = mappings; _b < mappings_4.length; _b++) {
                        var mapping = mappings_4[_b];
                        if (mapping.sourceIndex === sourceIndex) {
                            var source = other.getSource(mapping.sourceLine, mapping.sourceColumn, true, true);
                            if (source && source.sourcePath != undefined) {
                                mapping.sourceIndex = this.addSource(source.sourcePath);
                                mapping.sourceLine = source.line;
                                mapping.sourceColumn = source.column;
                                if (source.name != undefined) {
                                    mapping.nameIndex = this.addName(source.name);
                                }
                                else {
                                    delete mapping.nameIndex;
                                }
                            }
                            else {
                                delete mapping.sourceIndex;
                                delete mapping.sourceLine;
                                delete mapping.sourceColumn;
                                delete mapping.nameIndex;
                            }
                        }
                    }
                }
            }
        }
    };
    /**
     * 计算并填充所有行的映射点。
     * @param startLine 开始计算的行号(从 0 开始)。
     * @param endLine 结束计算的行号(从 0 开始)。
     * @desc
     * 由于源映射(版本 3)不支持根据上一行的映射自动推断下一行的映射。
     * 因此在生成源映射时必须手动插入每一行的映射点。
     * 此函数可以根据首行信息自动填充下一行的映射点。
     */
    SourceMapBuilder.prototype.computeLines = function (startLine, endLine) {
        if (startLine === void 0) { startLine = 0; }
        if (endLine === void 0) { endLine = this.mappings.length; }
        for (; startLine < endLine; startLine++) {
            var mappings = this.mappings[startLine] || (this.mappings[startLine] = []);
            if (!mappings[0] || mappings[0].generatedColumn > 0) {
                for (var line = startLine; --line >= 0;) {
                    var last = this.mappings[line] && this.mappings[line][0];
                    if (last) {
                        if (last.sourceIndex != undefined) {
                            mappings.unshift({
                                generatedColumn: 0,
                                sourceIndex: last.sourceIndex,
                                sourceLine: last.sourceLine + startLine - line,
                                sourceColumn: 0
                            });
                        }
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
        var digit = vlq & 31 /*(1<<5)-1*/;
        vlq >>>= 5;
        result += base64Chars[vlq > 0 ? digit | 32 /*1<<5*/ : digit];
    } while (vlq > 0);
    return result;
}
/**
 * 解码一个 Base64-VLQ 值。
 * @param value 要计算的值。
 * @param context 解码的上下文对象，存储当前需要解码的位置。解码结束后会更新为下一次需要解码的位置。
 * @return 返回已解码的数值。如果解析错误则返回 NaN。
 */
function decodeBase64Vlq(value, context) {
    var vlq = 0;
    var shift = 0;
    var digit;
    do {
        var ch = value.charCodeAt(context.index++);
        digit = 65 /*A*/ <= ch && ch <= 90 /*Z*/ ? ch - 65 /*A*/ :
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
 * 在指定内容插入(如果已存在则更新)一个 #sourceMappingURL 注释。
 * @param content 要插入或更新的内容。
 * @param sourceMapUrl 要插入或更新的源映射地址。如果地址为空则删除已存在的注释。
 * @param singleLineComment 插入时如果为 true 则使用单行注释，否则使用多行注释。
 * @return 返回已更新的内容。
 */
function emitSourceMapUrl(content, sourceMapUrl, singleLineComment) {
    var found = false;
    content = content.replace(/(?:\/\*(?:\s*\r?\n(?:\/\/)?)?(?:[#@]\ssourceMappingURL=([^\s'"]*))\s*\*\/|\/\/(?:[#@]\ssourceMappingURL=([^\s'"]*)))\s*/, function (_, url1, url2) {
        found = true;
        if (sourceMapUrl) {
            return url2 != null ? "//# sourceMappingURL=" + sourceMapUrl : "/*# sourceMappingURL=" + sourceMapUrl + " */";
        }
        return "";
    });
    if (!found && sourceMapUrl) {
        content = appendSourceMapUrl(content, sourceMapUrl, singleLineComment);
    }
    return content;
}
exports.emitSourceMapUrl = emitSourceMapUrl;
/**
 * 在指定内容末尾插入一个 #sourceMappingURL 注释。
 * @param content 要插入或更新的内容。
 * @param sourceMapUrl 要插入或更新的源映射地址。如果地址为空则删除已存在的注释。
 * @param singleLineComment 如果为 true 则使用单行注释，否则使用多行注释。
 * @return 返回已更新的内容。
 */
function appendSourceMapUrl(content, sourceMapUrl, singleLineComment) {
    return content + (singleLineComment ? "\n//# sourceMappingURL=" + sourceMapUrl : "\n/*# sourceMappingURL=" + sourceMapUrl + " */");
}
exports.appendSourceMapUrl = appendSourceMapUrl;
