document.addEventListener('DOMContentLoaded', () => {
    const codeInput = document.getElementById('codeInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loadSampleBtn = document.getElementById('loadSampleBtn');
    const clearBtn = document.getElementById('clearBtn');
    const lexicalOutput = document.getElementById('lexicalOutput');
    const syntaxOutput = document.getElementById('syntaxOutput');
    const errorOutput = document.getElementById('errorOutput');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    const loadingIndicator = document.getElementById('loading');
    const grammarOutput = document.getElementById('grammarOutput');

    const sampleCode = `# This is a VioletScript example
var greeting -> "Hello, VioletScript!"
var count -> 5

# Conditional statement using orcheck instead of otherwise
check count > 3 begin
    display greeting
    display "Count is greater than 3"
end

# Separate check for the else condition
check count <= 3 begin
    display "Count is 3 or less"
end

# Loop example
repeat 3 times begin
    var loopVar -> count * 2
    display "Loop calculation: " + loopVar
end

# Function definition would go here in a more complex example
`;

    const grammarLoader = new GrammarLoader();

    analyzeBtn.addEventListener('click', () => {
        const code = codeInput.value.trim();
        if (!code) {
            showError("Please enter some VioletScript code to analyze.");
            return;
        }
        analyzeCode(code);
    });

    loadSampleBtn.addEventListener('click', () => {
        codeInput.value = sampleCode;
        clearOutputs();
    });

    clearBtn.addEventListener('click', () => {
        codeInput.value = '';
        clearOutputs();
    });

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });

    themeToggle.addEventListener('click', () => {
        const htmlElement = document.documentElement;
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        htmlElement.setAttribute('data-theme', newTheme);
        themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';


        localStorage.setItem('violetscript-theme', newTheme);
    });

    const savedTheme = localStorage.getItem('violetscript-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }


    function clearOutputs() {
        lexicalOutput.innerHTML = '';
        syntaxOutput.innerHTML = '';
        errorOutput.innerHTML = '';
    }


    function showError(message) {
        clearOutputs();
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        errorOutput.appendChild(errorMsg);
        switchToTab('errors');
    }


    function showSuccess(message) {
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        errorOutput.appendChild(successMsg);
    }


    function analyzeCode(code) {
        clearOutputs();
        loadingIndicator.style.display = 'flex';

        setTimeout(() => {
            try {

                const lexer = new Lexer();
                const tokens = lexer.tokenize(code);
                displayTokensWithAnimation(tokens);


                if (grammarLoader.grammar) {
                    const validationResult = grammarLoader.validateCodeAgainstGrammar(tokens);
                    if (!validationResult.valid) {
                        validationResult.errors.forEach(error => {
                            const warningMsg = document.createElement('div');
                            warningMsg.className = 'warning-message';
                            warningMsg.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${error}`;
                            errorOutput.appendChild(warningMsg);
                        });
                    }
                }


                const parser = new Parser(tokens);
                const ast = parser.parse();
                displayASTWithAnimation(ast);

                showSuccess("VioletScript code analyzed successfully!");
                loadingIndicator.style.display = 'none';

            } catch (error) {
                showError(error.message);
                switchToTab('errors');
                loadingIndicator.style.display = 'none';
            }
        }, 300);
    }


    function switchToTab(tabName) {
        tabButtons.forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.click();
            }
        });
    }


    function displayTokensWithAnimation(tokens) {
        if (tokens.length === 0) {
            lexicalOutput.textContent = "No tokens found.";
            return;
        }

        const table = document.createElement('table');
        table.className = 'token-table';


        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        ['Type', 'Value', 'Line', 'Column'].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);


        const tbody = document.createElement('tbody');

        tokens.forEach((token, index) => {
            if (token.type !== 'WHITESPACE' && token.type !== 'COMMENT') {
                const row = document.createElement('tr');


                ['type', 'value', 'line', 'column'].forEach(prop => {
                    const cell = document.createElement('td');
                    cell.textContent = token[prop];
                    row.appendChild(cell);
                });


                setTimeout(() => {
                    tbody.appendChild(row);
                }, index * 20);
            }
        });

        table.appendChild(tbody);
        lexicalOutput.appendChild(table);
    }


    function displayASTWithAnimation(ast) {
        if (!ast) {
            syntaxOutput.textContent = "No AST generated.";
            return;
        }

        const astTree = document.createElement('div');
        astTree.className = 'ast-tree';

        function buildASTNode(node, parentElement) {
            if (!node) return;

            const nodeElement = document.createElement('div');
            nodeElement.className = 'ast-node';

            const nodeHeader = document.createElement('div');
            nodeHeader.className = 'ast-parent';


            if (node.type) {
                if (node.type.includes('Program')) {
                    nodeHeader.classList.add('program-node');
                } else if (node.type.includes('Statement')) {
                    nodeHeader.classList.add('statement-node');
                } else if (node.type.includes('Expression')) {
                    nodeHeader.classList.add('expression-node');
                } else if (['IfStatement', 'Loop', 'ForEach'].some(t => node.type.includes(t))) {
                    nodeHeader.classList.add('control-node');
                } else {
                    nodeHeader.classList.add('token-node');
                }
            }

            nodeHeader.textContent = node.type || 'Node';


            nodeHeader.addEventListener('click', () => {
                nodeHeader.classList.toggle('expanded');
                nodeContent.classList.toggle('expanded');
            });

            const nodeContent = document.createElement('div');
            nodeContent.className = 'ast-children';


            for (const [key, value] of Object.entries(node)) {
                if (key === 'type') continue;

                if (Array.isArray(value)) {

                    const arrayContainer = document.createElement('div');
                    arrayContainer.className = 'ast-property';
                    arrayContainer.innerHTML = `<span class="ast-property-name">${key}:</span> [Array]`;
                    nodeContent.appendChild(arrayContainer);


                    value.forEach((item, index) => {
                        if (typeof item === 'object' && item !== null) {
                            const itemLabel = document.createElement('div');
                            itemLabel.className = 'ast-array-label';
                            itemLabel.innerHTML = `<span class="ast-property-name">${index}:</span>`;
                            nodeContent.appendChild(itemLabel);
                            buildASTNode(item, nodeContent);
                        } else {
                            const itemValue = document.createElement('div');
                            itemValue.className = 'ast-property';
                            itemValue.innerHTML = `<span class="ast-property-name">${index}:</span> ${formatValue(item)}`;
                            nodeContent.appendChild(itemValue);
                        }
                    });
                } else if (typeof value === 'object' && value !== null) {

                    const objLabel = document.createElement('div');
                    objLabel.className = 'ast-object-label';
                    objLabel.innerHTML = `<span class="ast-property-name">${key}:</span> {Object}`;
                    nodeContent.appendChild(objLabel);
                    buildASTNode(value, nodeContent);
                } else {

                    const prop = document.createElement('div');
                    prop.className = 'ast-property';
                    prop.innerHTML = `<span class="ast-property-name">${key}:</span> ${formatValue(value)}`;
                    nodeContent.appendChild(prop);
                }
            }

            nodeElement.appendChild(nodeHeader);
            nodeElement.appendChild(nodeContent);
            parentElement.appendChild(nodeElement);
        }

        function formatValue(value) {
            if (typeof value === 'string') {
                return `<span class="ast-string">"${value}"</span>`;
            } else if (typeof value === 'number') {
                return `<span class="ast-number">${value}</span>`;
            } else if (typeof value === 'boolean') {
                return `<span class="ast-boolean">${value}</span>`;
            } else {
                return String(value);
            }
        }

        buildASTNode(ast, astTree);
        syntaxOutput.appendChild(astTree);


        const firstNode = syntaxOutput.querySelector('.ast-parent');
        const firstContent = syntaxOutput.querySelector('.ast-children');
        if (firstNode && firstContent) {
            firstNode.classList.add('expanded');
            firstContent.classList.add('expanded');
        }
    }


    async function initializeGrammar() {
        try {
            loadingIndicator.style.display = 'flex';
            const grammar = await grammarLoader.loadGrammar('../compiler/violetscript.grm');
            displayGrammarInfo(grammar);
            loadingIndicator.style.display = 'none';
        } catch (error) {
            showError(`Failed to load grammar file: ${error.message}`);
            loadingIndicator.style.display = 'none';
        }
    }


    initializeGrammar();


    function displayGrammarInfo(grammar) {
        if (!grammar) {
            grammarOutput.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-circle"></i> Grammar definition not available</div>';
            return;
        }

        let html = `
            <div class="grammar-info">
                <h4>${grammar.name || 'VioletScript'} ${grammar.version ? 'v' + grammar.version : ''}</h4>
                <p class="grammar-author">by ${grammar.author || 'Unknown'}</p>
                <p class="grammar-about">${grammar.about || 'No description available'}</p>
            </div>
        `;


        html += `
            <div class="grammar-section">
                <h5>Language Syntax</h5>
        `;

        const rules = grammar.rules || {};
        if (Object.keys(rules).length > 0) {
            html += '<div class="grammar-rules">';


            const importantRules = [
                'Program', 'Statement', 'IfStatement', 'Declaration',
                'Expression', 'LoopStatement', 'PrintStatement'
            ];


            const displayedRules = new Set();
            importantRules.forEach(rule => {
                if (rules[rule]) {
                    displayedRules.add(rule);
                    html += createRuleDisplay(rule, rules[rule]);
                }
            });


            let additionalRulesCount = 0;
            Object.keys(rules).forEach(rule => {
                if (!displayedRules.has(rule) && additionalRulesCount < 3) {
                    html += createRuleDisplay(rule, rules[rule]);
                    additionalRulesCount++;
                    displayedRules.add(rule);
                }
            });


            const remainingRules = Object.keys(rules).filter(rule => !displayedRules.has(rule));
            if (remainingRules.length > 0) {
                html += `<div class="more-rules">+ ${remainingRules.length} more rules</div>`;
            }

            html += '</div>';
        } else {
            html += '<div class="no-rules">No syntax rules defined</div>';
        }

        html += '</div>';


        html += `
            <div class="grammar-section">
                <h5>Keywords</h5>
                <div class="keyword-list">
        `;

        const keywords = grammar.keywords || {};
        if (Object.keys(keywords).length > 0) {
            Object.values(keywords).forEach(keyword => {
                html += `<span class="keyword">${keyword}</span>`;
            });
        } else {
            html += '<span class="no-items">No keywords defined</span>';
        }

        html += '</div></div>';


        html += `
            <div class="grammar-section">
                <h5>Operators</h5>
                <div class="operator-list">
        `;

        const operators = grammar.operators || {};
        if (Object.keys(operators).length > 0) {
            Object.values(operators).forEach(operator => {
                html += `<span class="operator">${operator}</span>`;
            });
        } else {
            html += '<span class="no-items">No operators defined</span>';
        }

        html += '</div></div>';

        grammarOutput.innerHTML = html;


        function createRuleDisplay(ruleName, definitions) {
            let ruleHtml = `
                <div class="grammar-rule">
                    <div class="rule-name">&lt;${ruleName}&gt;</div>
                    <div class="rule-definitions">
            `;

            definitions.forEach((def, index) => {
                ruleHtml += `<div class="rule-definition">${index === 0 ? '::=' : '|'} ${escapeHtml(def)}</div>`;
            });

            ruleHtml += '</div></div>';
            return ruleHtml;
        }


        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
    }


    function initParticleSystem() {
        const particles = document.querySelectorAll('.floating-particle');


        particles.forEach(particle => {
            const randomX = (Math.random() - 0.5) * 20;
            const randomY = (Math.random() - 0.5) * 20;
            const randomScale = 0.8 + Math.random() * 0.4;

            particle.style.transform = `translate(${randomX}px, ${randomY}px) scale(${randomScale})`;
        });
    }


    function initTabAnimations() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabSlider = document.querySelector('.tab-slider');

        if (!tabSlider) return;

        function positionSlider(activeTab) {
            const activeRect = activeTab.getBoundingClientRect();
            const tabsRect = activeTab.parentElement.getBoundingClientRect();

            tabSlider.style.width = `${activeRect.width}px`;
            tabSlider.style.left = `${activeRect.left - tabsRect.left}px`;
        }


        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            setTimeout(() => positionSlider(activeTab), 100);
        }

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                positionSlider(btn);


                const ripple = document.createElement('span');
                ripple.classList.add('tab-ripple');
                btn.appendChild(ripple);

                ripple.style.width = ripple.style.height = Math.max(btn.offsetWidth, btn.offsetHeight) + 'px';
                ripple.style.left = '0px';
                ripple.style.top = '0px';

                setTimeout(() => ripple.remove(), 1000);
            });
        });


        window.addEventListener('resize', () => {
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab) positionSlider(activeTab);
        });
    }


    function initScrollAnimations() {
        const animatedElements = [
            ...document.querySelectorAll('.grammar-section'),
            ...document.querySelectorAll('.token-table'),
            ...document.querySelectorAll('.ast-tree')
        ];

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        animatedElements.forEach(el => {
            el.classList.add('scroll-animate');
            observer.observe(el);
        });
    }


    function initTypingAnimation() {
        const codeInput = document.getElementById('codeInput');
        const loadSampleBtn = document.getElementById('loadSampleBtn');

        if (!codeInput || !loadSampleBtn) return;

        loadSampleBtn.addEventListener('click', () => {
            const sampleCode = loadSampleBtn.getAttribute('data-sample') || sampleCode;


            codeInput.value = '';


            let i = 0;
            const typingSpeed = 10;

            function typeChar() {
                if (i < sampleCode.length) {
                    codeInput.value += sampleCode.charAt(i);
                    i++;
                    setTimeout(typeChar, typingSpeed);


                    codeInput.scrollTop = codeInput.scrollHeight;
                }
            }

            typeChar();
        });
    }


    function startAnimations() {
        initParticleSystem();
        initTabAnimations();
        initScrollAnimations();
        initTypingAnimation();


        setInterval(() => {
            const sparkle = document.createElement('div');
            sparkle.classList.add('sparkle');

            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;

            sparkle.style.left = `${x}px`;
            sparkle.style.top = `${y}px`;

            document.body.appendChild(sparkle);

            setTimeout(() => {
                sparkle.remove();
            }, 1000);
        }, 2000);
    }


    startAnimations();


    const sparkleStyle = document.createElement('style');
    sparkleStyle.innerHTML = `
        .sparkle {
            position: fixed;
            width: 5px;
            height: 5px;
            border-radius: 50%;
            pointer-events: none;
            background: white;
            box-shadow: 0 0 10px 2px var(--violet-primary);
            animation: sparkle-anim 1s forwards ease-out;
            z-index: 1000;
        }
        
        @keyframes sparkle-anim {
            0% { transform: scale(0); opacity: 0; }
            20% { transform: scale(1); opacity: 1; }
            100% { transform: scale(0); opacity: 0; }
        }
        
        .scroll-animate {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .tab-ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
            transform: scale(0);
            animation: tab-ripple 1s linear;
            pointer-events: none;
        }
        
        @keyframes tab-ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;

    document.head.appendChild(sparkleStyle);
});


function updateTabSlider(activeButton) {
    const tabSlider = document.querySelector('.tab-slider');
    tabSlider.style.width = `${activeButton.offsetWidth}px`;
    tabSlider.style.left = `${activeButton.offsetLeft}px`;
}


function highlightCode() {
    const code = codeInput.value;
    const lexer = new Lexer();
    try {
        const tokens = lexer.tokenize(code);
        let highlightedCode = '';
        let lastIndex = 0;

        tokens.forEach(token => {

            if (token.type === 'EOF') return;


            const tokenStart = getPositionIndex(code, token.line, token.column);
            if (tokenStart > lastIndex) {
                highlightedCode += escapeHtml(code.substring(lastIndex, tokenStart));
            }


            const cssClass = getTokenClass(token.type, grammarLoader.grammar);
            highlightedCode += `<span class="${cssClass}">${escapeHtml(token.value)}</span>`;

            lastIndex = tokenStart + token.value.length;
        });


        if (lastIndex < code.length) {
            highlightedCode += escapeHtml(code.substring(lastIndex));
        }


        document.getElementById('highlightedCode').innerHTML = highlightedCode;
    } catch (e) {

        console.error("Highlighting error:", e);
    }
}

function validateGrammar(grammar) {
    const issues = [];


    const allRules = new Set();
    const referencedRules = new Set();


    Object.keys(grammar.rules).forEach(rule => {
        allRules.add(rule);
    });


    Object.values(grammar.rules).forEach(definitions => {
        definitions.forEach(def => {
            const matches = def.match(/<([^>]+)>/g);
            if (matches) {
                matches.forEach(match => {
                    const ruleName = match.replace(/[<>]/g, '');
                    referencedRules.add(ruleName);
                });
            }
        });
    });


    referencedRules.forEach(rule => {
        if (!allRules.has(rule)) {
            issues.push(`Grammar error: Rule <${rule}> is referenced but never defined.`);
        }
    });

    return issues;
}