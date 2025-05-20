// VioletScript Lexer Implementation

class Token {
    constructor(type, value, line, column) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.column = column;
    }

    toString() {
        return `Token(${this.type}, "${this.value}")`;
    }
}

class Lexer {
    constructor() {
        this.tokenPatterns = [
            { type: 'KEYWORD', pattern: /^(var|check|otherwise|orcheck|begin|end|repeat|times|loop|when|foreach|in|display|true|false)(?![a-zA-Z0-9_])/ },

            { type: 'IDENTIFIER', pattern: /^[a-zA-Z][a-zA-Z0-9_]*/ },

            { type: 'STRING', pattern: /^"[^"]*"/ },
            { type: 'NUMBER', pattern: /^[0-9]+(\.[0-9]+)?/ },

            { type: 'ARROW', pattern: /^->/ },
            { type: 'PLUS', pattern: /^\+/ },
            { type: 'MINUS', pattern: /^-/ },
            { type: 'MULTIPLY', pattern: /^\*/ },
            { type: 'DIVIDE', pattern: /^\// },
            { type: 'EQUALS', pattern: /^==/ },
            { type: 'NOTEQUALS', pattern: /^!=/ },
            { type: 'LESSEQUAL', pattern: /^<=/ },
            { type: 'GREATEREQUAL', pattern: /^>=/ },
            { type: 'LESSTHAN', pattern: /^</ },
            { type: 'GREATERTHAN', pattern: /^>/ },
            { type: 'ASSIGN', pattern: /^=/ },

            { type: 'LPAREN', pattern: /^\(/ },
            { type: 'RPAREN', pattern: /^\)/ },
            { type: 'LBRACE', pattern: /^\{/ },
            { type: 'RBRACE', pattern: /^\}/ },
            { type: 'LBRACKET', pattern: /^\[/ },
            { type: 'RBRACKET', pattern: /^\]/ },
            { type: 'COMMA', pattern: /^,/ },
            { type: 'SEMICOLON', pattern: /^;/ },

            { type: 'COMMENT', pattern: /^#[^\n\r]*/, ignore: true },
            { type: 'WHITESPACE', pattern: /^[ \t\r\n]+/, ignore: true }
        ];
    }

    tokenize(input) {
        const tokens = [];
        let line = 1;
        let column = 1;

        let remaining = input;

        while (remaining.length > 0) {
            let matched = false;

            for (const pattern of this.tokenPatterns) {
                const match = remaining.match(pattern.pattern);

                if (match) {
                    const value = match[0];

                    const lines = value.split('\n');
                    const lastLineLength = lines[lines.length - 1].length;

                    if (!pattern.ignore) {
                        tokens.push(new Token(pattern.type, value, line, column));
                    }

                    if (lines.length > 1) {
                        line += lines.length - 1;
                        column = lastLineLength + 1;
                    } else {
                        column += value.length;
                    }

                    remaining = remaining.slice(value.length);
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                throw new Error(`Unexpected character at line ${line}, column ${column}: "${remaining[0]}"`);
            }
        }

        tokens.push(new Token('EOF', '', line, column));

        return tokens;
    }
}

if (typeof module !== 'undefined') {
    module.exports = { Token, Lexer };
}