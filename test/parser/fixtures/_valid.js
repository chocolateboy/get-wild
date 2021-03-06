module.exports = {
    '':                                       [],
    '*':                                      ['*'],
    '*.*':                                    ['*', '*'],
    '*.a.1.*.-1.b.*':                         ['*', 'a', '1', '*', '-1', 'b', '*'],
    '*.a[1].*[-1].b.*':                       ['*', 'a', 1, '*', -1, 'b', '*'],
    '[0]':                                    [0],
    '[0][-1]':                                [0, -1],
    '[-1]':                                   [-1],
    'a.1.2.b.-3.d':                           ['a', '1', '2', 'b', '-3', 'd'],
    'a.01.002.b.-0003.d':                     ['a', '01', '002', 'b', '-0003', 'd'],
    'a.b':                                    ['a', 'b'],
    'a.*.b.1.-42.c.*':                        ['a', '*', 'b', '1', '-42', 'c', '*'],
    'a.*.b[01][0042].c.*':                    ['a', '*', 'b', 1, 42, 'c', '*'],
    'a.*.b[1][-42].c.*':                      ['a', '*', 'b', 1, -42, 'c', '*'],
    'a[1][02].b[-3].d':                       ['a', 1, 2, 'b', -3, 'd'],
    'a[1][02].b[003].d':                      ['a', 1, 2, 'b', 3, 'd'],
    'a[-1][-02].b[-003].d':                   ['a', -1, -2, 'b', -3, 'd'],
    'a[+1][+02].b[+003].d':                   ['a', 1, 2, 'b', 3, 'd'],

    '["foo\\bar"]["baz\\quux"]':              ['foo\\bar', 'baz\\quux'],
    '["foo.bar"]["baz.quux"]':                ['foo.bar', 'baz.quux'],
    '["foo[1]"].bar[42]':                     ['foo[1]', 'bar', 42],
    '["foo\\\\"]["bar\\\\"]["baz\\\\"].quux': ['foo\\\\', 'bar\\\\', 'baz\\\\', 'quux'],
    '["foo\\\\"][1]["bar\\\\"][42]':          ['foo\\\\', 1, 'bar\\\\', 42],

    "['foo\\bar']['baz\\quux']":              ["foo\\bar", "baz\\quux"],
    "['foo.bar']['baz.quux']":                ["foo.bar", "baz.quux"],
    "['foo[1]'].bar[42]":                     ["foo[1]", "bar", 42],
    "['foo\\\\']['bar\\\\']['baz\\\\'].quux": ["foo\\\\", "bar\\\\", "baz\\\\", "quux"],
    "['foo\\\\'][1]['bar\\\\'][42]":          ["foo\\\\", 1, "bar\\\\", 42],

    '["foo \\[bar\\] \\"baz\\" quux"]':       ['foo \\[bar\\] "baz" quux'],
}
