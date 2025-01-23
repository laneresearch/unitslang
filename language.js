// ExprUA language definition for Monaco Editor
export const language = {
    defaultToken: 'invalid',

    // Keywords from functionality.md
    keywords: [
        'if', 'elif', 'else',
        'for', 'while', 'repeat', 'until',
        'switch', 'case', 'default',
        'break', 'continue', 'return',
        'def', 'in',
        'and', 'nand', 'nor', 'not', 'or', 'xor', 'xnor', 'mand', 'mor'
    ],

    // Built-in functions
    builtins: [
        // Trigonometric
        'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
        // Exponential/Log
        'exp', 'log', 'log10', 'log2', 'sqrt',
        // Statistical
        'avg', 'sum',
        // Vector/Matrix
        'cross', 'normalize',
        // Other Math
        'abs', 'floor', 'ceil', 'round'
    ],

    // Operators from functionality.md
    operators: [
        '+', '-', '*', '/', '%', '^', '!', '[]',
        '=', '+=', '-=', '*=', '/=', '%=', '^=',
        '==', '!=', '<', '<=', '>', '>=',
        'and', 'nand', 'nor', 'not', 'or', 'xor', 'xnor', 'mand', 'mor'
    ],

    // Brackets and delimiters
    brackets: [
        { open: '{', close: '}', token: 'delimiter.curly' },
        { open: '[', close: ']', token: 'delimiter.square' },
        { open: '(', close: ')', token: 'delimiter.parenthesis' },
        { open: '<', close: '>', token: 'delimiter.angle' }
    ],

    // Regular expressions
    symbols: /[=><!~?:&|+\-*\/\^%]+/,
    digits: /\d+(_+\d+)*/,

    // SI Prefixes
    si_prefixes: [
        // Large numbers
        'Y',  // yotta (10^24)
        'Z',  // zetta (10^21)
        'E',  // exa   (10^18)
        'P',  // peta  (10^15)
        'T',  // tera  (10^12)
        'G',  // giga  (10^9)
        'M',  // mega  (10^6)
        'k',  // kilo  (10^3)
        'h',  // hecto (10^2)
        'da', // deca  (10^1)
        // Small numbers
        'd',  // deci  (10^-1)
        'c',  // centi (10^-2)
        'm',  // milli (10^-3)
        'µ',  // micro (10^-6)
        'u',  // micro (alternative)
        'n',  // nano  (10^-9)
        'p',  // pico  (10^-12)
        'f',  // femto (10^-15)
        'a',  // atto  (10^-18)
        'z',  // zepto (10^-21)
        'y'   // yocto (10^-24)
    ],

    // Base SI units that can have prefixes
    base_si_units: [
        'm',   // meter
        'g',   // gram (note: kg is base but we use g for prefixes)
        's',   // second
        'A',   // ampere
        'K',   // kelvin
        'mol', // mole
        'cd',  // candela
        'Hz',  // hertz
        'N',   // newton
        'Pa',  // pascal
        'J',   // joule
        'W',   // watt
        'C',   // coulomb
        'V',   // volt
        'F',   // farad
        'Ω',   // ohm
        'H'    // henry
    ],

    // Other units that don't take prefixes
    other_units: [
        'min', 'h', 'bar', 'L'
    ],

    // Units - Basic SI and common units
    units: [
        // Base SI units
        'm', 's', 'kg', 'A', 'K', 'mol', 'cd',
        // Derived SI units
        'N', 'Pa', 'J', 'W', 'C', 'V', 'F', 'Ω', 'Hz', 'H',
        // Common units
        'g', 'L', 'min', 'h', 'bar'
    ],
    
    // Tokenizer rules
    tokenizer: {
        root: [
            // Comments
            [/#.*$/, 'comment'],

            // Numbers with optional units
            [/[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/, {
                token: 'number',
                next: '@expectUnit'
            }],

            // Function definitions - match 'def' and function name separately
            [/(def)(\s+)([a-zA-Z_]\w*)/, ['keyword', 'white', 'function.declaration']],

            // Function calls - match function name and opening parenthesis
            [/([a-zA-Z_]\w*)(\s*)(\()/, {
                cases: {
                    '@builtins': ['predefined', 'white', 'delimiter.parenthesis'],
                    '@default': ['function.call', 'white', 'delimiter.parenthesis']
                }
            }],

            // Units as standalone identifiers
            [/[a-zA-Z_]\w*/, {
                cases: {
                    '@keywords': 'keyword',
                    '@builtins': 'predefined',
                    '@units': 'unit',
                    '@default': 'identifier'
                }
            }],

            // Whitespace
            { include: '@whitespace' },

            // Strings
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/"/, { token: 'string.quote', bracket: '@open', next: '@string_double' }],
            [/'([^'\\]|\\.)*$/, 'string.invalid'],
            [/'/, { token: 'string.quote', bracket: '@open', next: '@string_single' }],

            // Delimiters
            [/[,.:]/, 'delimiter'],
            [/[{}()\[\]]/, '@brackets'],
            [/@symbols/, {
                cases: {
                    '@operators': 'operator',
                    '@default': 'symbol'
                }
            }]
        ],

        whitespace: [
            [/[ \t\r\n]+/, 'white']
        ],

        string_double: [
            [/[^\\"]+/, 'string'],
            [/\\./, 'string.escape'],
            [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ],

        string_single: [
            [/[^\\']+/, 'string'],
            [/\\./, 'string.escape'],
            [/'/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ],

        expectUnit: [
            // Whitespace between number and unit is optional
            [/\s+/, { token: 'white', next: '@expectUnitAfterSpace' }],
            // Try to match prefix + unit first
            [/([YZEPTGMkhda]|[dcmµunpfazy])([a-zA-Z_]\w*)/, {
                cases: {
                    '$2@base_si_units': { token: 'unit', next: '@unitExpression' },
                    '@default': { token: '@rematch', next: '@pop' }
                }
            }],
            // Then try to match just the unit
            [/[a-zA-Z_]\w*/, {
                cases: {
                    '@base_si_units': { token: 'unit', next: '@unitExpression' },
                    '@other_units': { token: 'unit', next: '@unitExpression' },
                    '@default': { token: '@rematch', next: '@pop' }
                }
            }],
            [/[^\s\w]/, { token: '@rematch', next: '@pop' }],
            ['', '@pop']
        ],

        expectUnitAfterSpace: [
            // Try to match prefix + unit first
            [/([YZEPTGMkhda]|[dcmµunpfazy])([a-zA-Z_]\w*)/, {
                cases: {
                    '$2@base_si_units': { token: 'unit', next: '@unitExpression' },
                    '@default': { token: '@rematch', next: '@pop' }
                }
            }],
            // Then try to match just the unit
            [/[a-zA-Z_]\w*/, {
                cases: {
                    '@base_si_units': { token: 'unit', next: '@unitExpression' },
                    '@other_units': { token: 'unit', next: '@unitExpression' },
                    '@default': { token: '@rematch', next: '@pop' }
                }
            }],
            [/[^\s\w]/, { token: '@rematch', next: '@pop' }],
            ['', '@pop']
        ],

        unitExpression: [
            // Whitespace in unit expressions
            [/\s+/, 'white'],
            // Unit operators
            [/\*/, { token: 'operator.unit' }],
            [/\//, { token: 'operator.unit' }],
            [/\^/, { token: 'operator.unit', next: '@unitExponent' }],
            // Try to match prefix + unit first
            [/([YZEPTGMkhda]|[dcmµunpfazy])([a-zA-Z_]\w*)/, {
                cases: {
                    '$2@base_si_units': 'unit',
                    '@default': { token: '@rematch', next: '@pop' }
                }
            }],
            // Then try to match just the unit
            [/[a-zA-Z_]\w*/, {
                cases: {
                    '@base_si_units': 'unit',
                    '@other_units': 'unit',
                    '@default': { token: '@rematch', next: '@pop' }
                }
            }],
            // Parentheses for grouping
            [/\(/, { token: 'delimiter.parenthesis', next: '@unitParenthesis' }],
            // End of unit expression
            [/[^\s\w\*\/\^()]/, { token: '@rematch', next: '@pop' }],
            ['', '@pop']
        ],

        unitExponent: [
            // Handle the exponent number
            [/-?\d+/, { token: 'number.unit', next: '@unitExpression' }],
            // Handle whitespace before exponent
            [/\s+/, 'white'],
            // Handle operators after exponent without requiring a unit
            [/[\*\/]/, { token: 'operator.unit', next: '@unitExpression' }],
            // If no more operators, return to root
            [/[^\s\d\-\*\/]/, { token: '@rematch', next: '@pop' }],
            ['', '@pop']
        ],

        unitParenthesis: [
            [/\s+/, 'white'],
            [/[a-zA-Z_]\w*/, {
                cases: {
                    '@units': 'unit',
                    '@default': 'identifier'
                }
            }],
            [/\*/, 'operator.unit'],
            [/\//, 'operator.unit'],
            [/\^/, { token: 'operator.unit', next: '@unitExponent' }],
            [/\(/, { token: 'delimiter.parenthesis', next: '@unitParenthesis' }],
            [/\)/, { token: 'delimiter.parenthesis', next: '@unitExpression' }]
        ]
    }
};

// Light theme definition
export const lightTheme = {
    base: 'vs',
    inherit: true,
    rules: [
        // Keywords - Using a distinct purple that stands out for control flow
        { token: 'keyword', foreground: '871094', fontStyle: 'bold' },
        
        // Units - Using a distinct color to make them stand out
        { token: 'unit', foreground: '0066CC', fontStyle: 'bold' },
        { token: 'operator.unit', foreground: '0066CC' },
        { token: 'number.unit', foreground: '0066CC' },
        
        // Functions - Using distinct colors to differentiate types
        { token: 'function.declaration', foreground: '00AAAA' },  // Teal for declarations
        { token: 'function.call', foreground: '795E26' },        // Brown for calls
        { token: 'predefined', foreground: '00AA00' },           // Green for built-ins
        
        // Variables and identifiers - Using blue as it's easy to read
        { token: 'identifier', foreground: '1750EB' },
        
        // Comments - Distinct green and italic to set apart from code
        { token: 'comment', foreground: '008000', fontStyle: 'italic' },
        
        // Strings - Warm maroon that doesn't compete with errors
        { token: 'string', foreground: 'AA0000' },
        { token: 'string.escape', foreground: 'DD4488', fontStyle: 'bold' },
        { token: 'string.invalid', foreground: 'F54400', fontStyle: 'bold' },
        
        // Numbers - Distinct blue that won't be confused with identifiers
        { token: 'number', foreground: '0033B3' },
        
        // Operators and delimiters - Subtle but readable
        { token: 'operator', foreground: '444444' },
        { token: 'delimiter', foreground: '666666' },
        { token: 'delimiter.parenthesis', foreground: '666666' },
        { token: 'delimiter.square', foreground: '666666' },
        { token: 'delimiter.curly', foreground: '666666' }
    ],
    colors: {
        'editor.foreground': '#000000',
        'editor.background': '#FFFFFF',
        'editor.selectionBackground': '#ADD6FF',
        'editor.lineHighlightBackground': '#F7F7F7',
        'editorCursor.foreground': '#000000',
        'editorWhitespace.foreground': '#BFBFBF'
    }
};

// Dark theme definition
export const darkTheme = {
    base: 'vs-dark',
    inherit: true,
    rules: [
        // Keywords
        { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
        
        // Units
        { token: 'unit', foreground: '4FC1FF', fontStyle: 'bold' },
        { token: 'operator.unit', foreground: '4FC1FF' },
        { token: 'number.unit', foreground: '4FC1FF' },
        
        // Functions
        { token: 'function.declaration', foreground: '4EC9B0' },
        { token: 'function.call', foreground: 'DCDCAA' },
        { token: 'predefined', foreground: '4EC9B0' },
        
        // Variables and identifiers
        { token: 'identifier', foreground: '9CDCFE' },
        
        // Comments
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        
        // Strings
        { token: 'string', foreground: 'CE9178' },
        { token: 'string.escape', foreground: 'D7BA7D', fontStyle: 'bold' },
        { token: 'string.invalid', foreground: 'F14C4C', fontStyle: 'bold' },
        
        // Numbers
        { token: 'number', foreground: 'B5CEA8' },
        
        // Operators and delimiters
        { token: 'operator', foreground: 'D4D4D4' },
        { token: 'delimiter', foreground: 'D4D4D4' },
        { token: 'delimiter.parenthesis', foreground: 'D4D4D4' },
        { token: 'delimiter.square', foreground: 'D4D4D4' },
        { token: 'delimiter.curly', foreground: 'D4D4D4' }
    ],
    colors: {
        'editor.foreground': '#D4D4D4',
        'editor.background': '#1E1E1E',
        'editor.selectionBackground': '#264F78',
        'editor.lineHighlightBackground': '#2D2D2D',
        'editorCursor.foreground': '#FFFFFF',
        'editorWhitespace.foreground': '#404040'
    }
}; 