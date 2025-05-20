class GrammarLoader {
    constructor() {
        this.grammar = null;
        this.rules = {};
        this.terminals = {};
    }

    async loadGrammar(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to load grammar file: ${response.statusText}`);
            }

            const grammarText = await response.text();
            return this.parseGrammar(grammarText);
        } catch (error) {
            console.error("Error loading grammar file:", error);
            throw error;
        }
    }

    parseGrammar(grammarText) {
        const grammar = {
            name: '',
            author: '',
            version: '',
            about: '',
            caseSensitive: true,
            startSymbol: '',
            rules: {},
            terminals: {},
            keywords: {},
            operators: {}
        };

        const lines = grammarText.split('\n');
        let currentSection = null;
        let currentRule = null;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();

            if (line.startsWith('//') || line === '') {
                continue;
            }

            if (line.startsWith('!')) {
                if (line.includes('Keywords')) {
                    currentSection = 'keywords';
                    continue;
                } else if (line.includes('Operators')) {
                    currentSection = 'operators';
                    continue;
                } else if (line.includes('Rules')) {
                    currentSection = 'rules';
                    continue;
                } else if (line.includes('Terminals')) {
                    currentSection = 'terminals';
                    continue;
                }
                continue;
            }

            if (line.includes('=')) {
                const [key, value] = line.split('=').map(part => part.trim());
                const cleanKey = key.replace(/"/g, '');
                const cleanValue = value.replace(/'/g, '');

                if (cleanKey === 'Name') grammar.name = cleanValue;
                else if (cleanKey === 'Author') grammar.author = cleanValue;
                else if (cleanKey === 'Version') grammar.version = cleanValue;
                else if (cleanKey === 'About') grammar.about = cleanValue;
                else if (cleanKey === 'Case Sensitive') grammar.caseSensitive = (cleanValue.toLowerCase() === 'true');
                else if (cleanKey === 'Start Symbol') grammar.startSymbol = cleanValue.replace(/[<>]/g, '');
                else if (currentSection === 'keywords') {
                    grammar.keywords[cleanKey] = cleanValue.replace(/^'|'$/g, '');
                }
                else if (currentSection === 'operators') {
                    grammar.operators[cleanKey] = cleanValue.replace(/^'|'$/g, '');
                }
                continue;
            }

            if (line.includes('::=')) {
                currentSection = 'rules';
                const [rulePart, definitionPart] = line.split('::=').map(part => part.trim());
                const ruleName = rulePart.replace(/[<>]/g, '').trim();

                if (!grammar.rules[ruleName]) {
                    grammar.rules[ruleName] = [];
                }

                if (definitionPart) {
                    grammar.rules[ruleName].push(definitionPart);
                }
                currentRule = ruleName;
            }
            else if (line.startsWith('|') && currentRule) {
                const definition = line.substring(1).trim();
                grammar.rules[currentRule].push(definition);
            }
        }

        this.grammar = grammar;
        return grammar;
    }

    getGrammar() {
        return this.grammar;
    }

    validateCodeAgainstGrammar(tokens) {
        if (!this.grammar || !this.grammar.keywords) {
            return { valid: true, errors: [] };
        }

        const errors = [];
        const knownKeywords = Object.values(this.grammar.keywords);

        tokens.forEach(token => {
            if (token.type === 'IDENTIFIER' && knownKeywords.includes(token.value)) {
                errors.push(`Warning: "${token.value}" is used as an identifier but is a reserved keyword`);
            }
        });

        return {
            valid: errors.length === 0,
            errors
        };
    }

    getFormattedGrammar() {
        if (!this.grammar) return null;
        const formattedRules = {};
        for (const [ruleName, definitions] of Object.entries(this.grammar.rules)) {
            formattedRules[ruleName] = definitions.map(def => {
                return def.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            });
        }

        return {
            ...this.grammar,
            formattedRules
        };
    }
}

if (typeof module !== 'undefined') {
    module.exports = { GrammarLoader };
}