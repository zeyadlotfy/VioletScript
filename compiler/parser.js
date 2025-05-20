

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
    }

    parse() {
        try {
            const program = this.program();


            if (!this.isAtEnd() && !this.check('EOF')) {
                throw this.error(this.peek(), "Expected end of file");
            }

            return program;
        } catch (error) {
            console.error("Parse error:", error);
            throw error;
        }
    }

    program() {
        return {
            type: "Program",
            body: this.statements()
        };
    }

    statements() {
        const statements = [];

        while (!this.isAtEnd() && !this.check('EOF') && !this.check('KEYWORD', 'end')) {
            statements.push(this.statement());
        }

        return statements;
    }

    statement() {
        if (this.match('KEYWORD', 'var')) {
            return this.variableDeclaration();
        }

        if (this.match('KEYWORD', 'check')) {
            return this.ifStatement();
        }

        if (this.match('KEYWORD', 'repeat')) {
            return this.repeatStatement();
        }

        if (this.match('KEYWORD', 'display')) {
            return this.displayStatement();
        }


        const expr = this.expression();
        return {
            type: "ExpressionStatement",
            expression: expr
        };
    }

    variableDeclaration() {
        const name = this.consume('IDENTIFIER', "Expected variable name");

        this.consume('ARROW', "Expected '->' after variable name");

        const initializer = this.expression();

        return {
            type: "VariableDeclaration",
            name: name.value,
            initializer: initializer
        };
    }

    ifStatement() {
        const condition = this.expression();

        this.consume('KEYWORD', 'begin', "Expected 'begin' after condition");

        const thenBranch = this.statements();

        let elseBranch = null;

        if (this.check('KEYWORD', 'otherwise')) {
            this.advance();

            this.consume('KEYWORD', 'begin', "Expected 'begin' after 'otherwise'");
            elseBranch = this.statements();
        }

        this.consume('KEYWORD', 'end', "Expected 'end' to close if statement");

        return {
            type: "IfStatement",
            condition: condition,
            thenBranch: thenBranch,
            elseBranch: elseBranch
        };
    }

    repeatStatement() {
        const count = this.expression();

        this.consume('KEYWORD', 'times', "Expected 'times' after repeat count");
        this.consume('KEYWORD', 'begin', "Expected 'begin' after 'times'");

        const body = this.statements();

        this.consume('KEYWORD', 'end', "Expected 'end' to close repeat statement");

        return {
            type: "RepeatStatement",
            count: count,
            body: body
        };
    }

    displayStatement() {
        const value = this.expression();

        return {
            type: "DisplayStatement",
            value: value
        };
    }

    expression() {
        return this.additiveExpression();
    }

    additiveExpression() {
        let expr = this.multiplicativeExpression();

        while (this.match('PLUS') || this.match('MINUS')) {
            const operator = this.previous().type;
            const right = this.multiplicativeExpression();
            expr = {
                type: "BinaryExpression",
                operator: operator,
                left: expr,
                right: right
            };
        }

        return expr;
    }

    multiplicativeExpression() {
        let expr = this.comparisonExpression();

        while (this.match('MULTIPLY') || this.match('DIVIDE')) {
            const operator = this.previous().type;
            const right = this.comparisonExpression();
            expr = {
                type: "BinaryExpression",
                operator: operator,
                left: expr,
                right: right
            };
        }

        return expr;
    }

    comparisonExpression() {
        let expr = this.primaryExpression();

        while (
            this.match('EQUALS') ||
            this.match('NOTEQUALS') ||
            this.match('LESSTHAN') ||
            this.match('GREATERTHAN') ||
            this.match('LESSEQUAL') ||
            this.match('GREATEREQUAL')
        ) {
            const operator = this.previous().type;
            const right = this.primaryExpression();
            expr = {
                type: "BinaryExpression",
                operator: operator,
                left: expr,
                right: right
            };
        }

        return expr;
    }

    primaryExpression() {
        if (this.match('NUMBER')) {
            return {
                type: "LiteralExpression",
                value: parseFloat(this.previous().value),
                valueType: "number"
            };
        }

        if (this.match('STRING')) {

            const value = this.previous().value;
            return {
                type: "LiteralExpression",
                value: value.substring(1, value.length - 1),
                valueType: "string"
            };
        }

        if (this.match('KEYWORD', 'true')) {
            return {
                type: "LiteralExpression",
                value: true,
                valueType: "boolean"
            };
        }

        if (this.match('KEYWORD', 'false')) {
            return {
                type: "LiteralExpression",
                value: false,
                valueType: "boolean"
            };
        }

        if (this.match('IDENTIFIER')) {
            return {
                type: "IdentifierExpression",
                name: this.previous().value
            };
        }

        if (this.match('LPAREN')) {
            const expr = this.expression();
            this.consume('RPAREN', "Expected ')' after expression");
            return {
                type: "GroupExpression",
                expression: expr
            };
        }

        throw this.error(this.peek(), "Expected expression");
    }


    match(...types) {
        for (let i = 0; i < types.length; i++) {
            const type = types[i];
            const value = types[i + 1];

            if (typeof value === 'string') {
                if (this.check(type, value)) {
                    this.advance();
                    return true;
                }
                i++;
            } else if (this.check(type)) {
                this.advance();
                return true;
            }
        }

        return false;
    }

    consume(type, value, message) {
        if (typeof value === 'string' && typeof message === 'undefined') {

            message = value;
            value = undefined;
        }

        if (this.check(type, value)) {
            return this.advance();
        }

        throw this.error(this.peek(), message);
    }

    check(type, value) {
        if (this.isAtEnd()) return false;

        const token = this.peek();
        if (token.type !== type) return false;

        if (value !== undefined && token.value !== value) return false;

        return true;
    }

    advance() {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    isAtEnd() {
        return this.peek().type === 'EOF';
    }

    peek() {
        return this.tokens[this.current];
    }

    previous() {
        return this.tokens[this.current - 1];
    }

    error(token, message) {
        const errorMsg = token.type === 'EOF'
            ? `Error at end: ${message}`
            : `Error at line ${token.line}, column ${token.column}: ${message}`;

        return new Error(errorMsg);
    }
}


if (typeof module !== 'undefined') {
    module.exports = { Parser };
}