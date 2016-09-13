const assert = require("assert");
const sourceMap = require("./sourceMap");

describe('source map', function () {
    const map = {
        "version": 3,
        "file": "example.js",
        "sourceRoot": "sourceRoot",
        "sources": [
            "source.js"
        ],
        "names": [
            "name"
        ],
        "mappings": ";AAAA,IAAA;;AAAA,MAAA,GAAS,SAAC,CAAD"
    };
    it('toSourceMapString', function () {
        assert.deepEqual(JSON.parse(sourceMap.toSourceMapString(map)), map);
        assert.deepEqual(JSON.parse(sourceMap.toSourceMapString(JSON.stringify(map))), map);
        assert.deepEqual(JSON.parse(sourceMap.toSourceMapString(sourceMap.toSourceMapObject(map))), map);
        assert.deepEqual(JSON.parse(sourceMap.toSourceMapString(sourceMap.toSourceMapBuilder(map))), map);
    });
    it('toSourceMapObject', function () {
        assert.deepEqual(sourceMap.toSourceMapObject(map), map);
        assert.deepEqual(sourceMap.toSourceMapObject(JSON.stringify(map)), map);
        assert.deepEqual(sourceMap.toSourceMapObject(sourceMap.toSourceMapObject(map)), map);
        assert.deepEqual(sourceMap.toSourceMapObject(sourceMap.toSourceMapBuilder(map)), map);
    });
    it('toSourceMapBuilder', function () {
        assert.deepEqual(sourceMap.toSourceMapBuilder(map).toJSON(), map);
        assert.deepEqual(sourceMap.toSourceMapBuilder(JSON.stringify(map)).toJSON(), map);
        assert.deepEqual(sourceMap.toSourceMapBuilder(sourceMap.toSourceMapObject(map)).toJSON(), map);
        assert.deepEqual(sourceMap.toSourceMapBuilder(sourceMap.toSourceMapBuilder(map)).toJSON(), map);
    });
    it("addSource", function () {
        const b = new sourceMap.SourceMapBuilder();
        assert.equal(b.addSource("b"), 0);
        assert.deepEqual(b.sources, ["b"]);
    });
    it("addName", function () {
        const b = new sourceMap.SourceMapBuilder();
        assert.equal(b.addName("b"), 0);
        assert.deepEqual(b.names, ["b"]);
    });
    it("getSourceContent", function () {
        const b = new sourceMap.SourceMapBuilder();
        assert.equal(b.getSourceContent("b"), undefined);
        b.addSource("b");
        b.setSourceContent("b", "A");
        assert.equal(b.getSourceContent("b"), "A");
    });
    it("setSourceContent", function () {
        const b = new sourceMap.SourceMapBuilder();
        b.addSource("b");
        b.setSourceContent("b", "A");
        assert.deepEqual(b.sourcesContent, ["A"]);
        b.setSourceContent("b", "B");
        assert.deepEqual(b.sourcesContent, ["B"]);
    });
    it("parse", function () {
        const b = new sourceMap.SourceMapBuilder();
        b.parse(map);
        assert.equal(b.version, map.version);
        assert.equal(b.file, map.file);
        assert.equal(b.sourceRoot, map.sourceRoot);
        assert.deepEqual(b.sources, [map.sourceRoot + "/" + map.sources[0]]);
        assert.deepEqual(b.names, map.names);
        assert.deepEqual(b.mappings, [
            [],
            [
                { column: 0, sourceIndex: 0, sourceLine: 0, sourceColumn: 0 },
                { column: 4, sourceIndex: 0, sourceLine: 0, sourceColumn: 0 }
            ],
            [],
            [
                { column: 0, sourceIndex: 0, sourceLine: 0, sourceColumn: 0 },
                { column: 6, sourceIndex: 0, sourceLine: 0, sourceColumn: 0 },
                { column: 9, sourceIndex: 0, sourceLine: 0, sourceColumn: 9 },
                { column: 18, sourceIndex: 0, sourceLine: 0, sourceColumn: 10 },
                { column: 19, sourceIndex: 0, sourceLine: 0, sourceColumn: 9 }
            ]
        ]);
    });
    it("toJSON & toString", function () {
        assert.deepEqual(sourceMap.toSourceMapBuilder(map).toJSON(), map);
        assert.deepEqual(JSON.parse(sourceMap.toSourceMapBuilder(map).toString()), map);
        assert.deepEqual(JSON.parse(JSON.stringify(sourceMap.toSourceMapBuilder(map))), map);
    });
    it('getSource', function () {
        function clean(o) {
            delete o.mapping;
            delete o.sourceContent;
            delete o.name;
            return o;
        }
        const b = sourceMap.toSourceMapBuilder(map);
        assert.deepEqual(clean(b.getSource(0, 0)), { sourcePath: "example.js", line: 0, column: 0 });
        assert.deepEqual(clean(b.getSource(0, 1)), { sourcePath: "example.js", line: 0, column: 1 });
        assert.deepEqual(clean(b.getSource(0, 2)), { sourcePath: "example.js", line: 0, column: 2 });
        assert.deepEqual(clean(b.getSource(1, 0)), { sourcePath: "sourceRoot/source.js", line: 0, column: 0 });
        assert.deepEqual(clean(b.getSource(1, 1)), { sourcePath: "sourceRoot/source.js", line: 0, column: 1 });
        assert.deepEqual(clean(b.getSource(1, 2)), { sourcePath: "sourceRoot/source.js", line: 0, column: 2 });
        assert.deepEqual(clean(b.getSource(1, 3)), { sourcePath: "sourceRoot/source.js", line: 0, column: 3 });
        assert.deepEqual(clean(b.getSource(1, 4)), { sourcePath: "sourceRoot/source.js", line: 0, column: 0 });
        assert.deepEqual(clean(b.getSource(1, 5)), { sourcePath: "sourceRoot/source.js", line: 0, column: 1 });
        assert.deepEqual(clean(b.getSource(1, 6)), { sourcePath: "sourceRoot/source.js", line: 0, column: 2 });
        assert.deepEqual(clean(b.getSource(2, 0)), { sourcePath: "sourceRoot/source.js", line: 1, column: 0 });
        assert.deepEqual(clean(b.getSource(2, 1)), { sourcePath: "sourceRoot/source.js", line: 1, column: 1 });
        assert.deepEqual(clean(b.getSource(3, 0)), { sourcePath: "sourceRoot/source.js", line: 0, column: 0 });
        assert.deepEqual(clean(b.getSource(3, 1)), { sourcePath: "sourceRoot/source.js", line: 0, column: 1 });
        assert.deepEqual(clean(b.getSource(3, 5)), { sourcePath: "sourceRoot/source.js", line: 0, column: 5 });
        assert.deepEqual(clean(b.getSource(3, 6)), { sourcePath: "sourceRoot/source.js", line: 0, column: 0 });
        assert.deepEqual(clean(b.getSource(3, 7)), { sourcePath: "sourceRoot/source.js", line: 0, column: 1 });
        assert.deepEqual(clean(b.getSource(3, 8)), { sourcePath: "sourceRoot/source.js", line: 0, column: 2 });
        assert.deepEqual(clean(b.getSource(3, 9)), { sourcePath: "sourceRoot/source.js", line: 0, column: 9 });
        assert.deepEqual(clean(b.getSource(3, 10)), { sourcePath: "sourceRoot/source.js", line: 0, column: 10 });
        assert.deepEqual(clean(b.getSource(3, 17)), { sourcePath: "sourceRoot/source.js", line: 0, column: 17 });
        assert.deepEqual(clean(b.getSource(3, 18)), { sourcePath: "sourceRoot/source.js", line: 0, column: 10 });
        assert.deepEqual(clean(b.getSource(3, 19)), { sourcePath: "sourceRoot/source.js", line: 0, column: 9 });
        assert.deepEqual(clean(b.getSource(3, 20)), { sourcePath: "sourceRoot/source.js", line: 0, column: 10 });
        assert.deepEqual(clean(b.getSource(3, 21)), { sourcePath: "sourceRoot/source.js", line: 0, column: 11 });
        assert.deepEqual(clean(b.getSource(4, 0)), { sourcePath: "sourceRoot/source.js", line: 1, column: 0 });
        assert.deepEqual(clean(b.getSource(4, 1)), { sourcePath: "sourceRoot/source.js", line: 1, column: 1 });
    });
    it("addMapping", function () {
        const b = new sourceMap.SourceMapBuilder();
        b.addMapping(0, 10, "a.js", 1, 2);
        assert.deepEqual(b.mappings, [
            [
                { column: 10, sourceIndex: 0, sourceLine: 1, sourceColumn: 2 }
            ]
        ]);
        b.addMapping(0, 10, "a.js", 1, 3);
        assert.deepEqual(b.mappings, [
            [
                { column: 10, sourceIndex: 0, sourceLine: 1, sourceColumn: 2 },
                { column: 10, sourceIndex: 0, sourceLine: 1, sourceColumn: 3 }
            ]
        ]);
        b.addMapping(0, 9, "a.js", 1, 3);
        assert.deepEqual(b.mappings, [
            [
                { column: 9, sourceIndex: 0, sourceLine: 1, sourceColumn: 3 },
                { column: 10, sourceIndex: 0, sourceLine: 1, sourceColumn: 2 },
                { column: 10, sourceIndex: 0, sourceLine: 1, sourceColumn: 3 }
            ]
        ]);
        b.addMapping(1, 9, "a.js", 1, 3);
        assert.deepEqual(b.mappings, [
            [
                { column: 9, sourceIndex: 0, sourceLine: 1, sourceColumn: 3 },
                { column: 10, sourceIndex: 0, sourceLine: 1, sourceColumn: 2 },
                { column: 10, sourceIndex: 0, sourceLine: 1, sourceColumn: 3 }
            ],
            [
                { column: 9, sourceIndex: 0, sourceLine: 1, sourceColumn: 3 }
            ]
        ]);
    });
    it("eachMappding", function () {
        const b = new sourceMap.SourceMapBuilder();
        b.addMapping(0, 10, "a.js", 1, 2);
        b.addMapping(0, 9, "a.js", 1, 3);
        const columns = [];
        b.eachMapping((line, column) => {
            columns.push(column);
        });
        assert.deepEqual(columns, [9, 10]);
    });
    it("applySourceMap", function () {
        const a = new sourceMap.SourceMapBuilder();
        a.addMapping(1, 1, "a.js", 101, 101);
        a.addMapping(2, 0, "a.js", 102, 0);
        const b = new sourceMap.SourceMapBuilder();
        b.file = "a.js";
        b.addMapping(101, 100, "b.js", 201, 202);
        b.addMapping(102, 0, "b.js", 301, 302);
        a.applySourceMap(b);
        function clean(o) {
            delete o.mapping;
            delete o.sourceContent;
            delete o.name;
            return o;
        }
        assert.deepEqual(clean(a.getSource(1, 1)), { sourcePath: "b.js", line: 201, column: 203 });
        assert.deepEqual(clean(a.getSource(1, 2)), { sourcePath: "b.js", line: 201, column: 204 });
        assert.deepEqual(clean(a.getSource(2, 0)), { sourcePath: "b.js", line: 301, column: 302 });
    });
    it("computeLines", function () {
        const b = new sourceMap.SourceMapBuilder();
        b.addMapping(1, 1, "a.js", 101, 101);
        b.addMapping(3, 1, "a.js", 201, 201);
        assert.equal(b.mappings.length, 4);
        assert.equal(b.mappings[0], undefined);
        assert.deepEqual(b.mappings[1], [
            { column: 1, sourceIndex: 0, sourceLine: 101, sourceColumn: 101 }
        ]);
        assert.equal(b.mappings[2], undefined);
        assert.deepEqual(b.mappings[3], [
            { column: 1, sourceIndex: 0, sourceLine: 201, sourceColumn: 201 }
        ]);
        b.computeLines();
        assert.deepEqual(b.mappings[0], []);
        assert.deepEqual(b.mappings[2], [
            { column: 0, sourceIndex: 0, sourceLine: 102, sourceColumn: 0 }
        ]);
        assert.deepEqual(b.mappings[3], [
            { column: 0, sourceIndex: 0, sourceLine: 103, sourceColumn: 0 },
            { column: 1, sourceIndex: 0, sourceLine: 201, sourceColumn: 201 }
        ]);
    });
    it("emitSourceMapUrl", function () {
        assert.equal(sourceMap.emitSourceMapUrl("", "a.js"), "\n/*# sourceMappingURL=a.js */");
        assert.equal(sourceMap.emitSourceMapUrl("a", "a.js"), "a\n/*# sourceMappingURL=a.js */");
        assert.equal(sourceMap.emitSourceMapUrl("a", "a.js", true), "a\n//# sourceMappingURL=a.js");
        assert.equal(sourceMap.emitSourceMapUrl("/*# sourceMappingURL=b.js */", "a.js"), "/*# sourceMappingURL=a.js */");
        assert.equal(sourceMap.emitSourceMapUrl("//# sourceMappingURL=b.js", "a.js", true), "//# sourceMappingURL=a.js");
        assert.equal(sourceMap.emitSourceMapUrl("//@ sourceMappingURL=b.js", "a.js", true), "//# sourceMappingURL=a.js");
    });
});
