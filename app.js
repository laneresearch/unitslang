import { initializeEditor } from './editor.js';

let ParserModule;
let inputEditor;
let outputEditor;
let currentTab = 'symbolTable';

const loading = document.getElementById('loading');
const content = document.getElementById('content');
const darkModeToggle = document.getElementById('darkModeToggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

function setTheme(isDark) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    if (inputEditor && outputEditor) {
        const theme = isDark ? 'exprua-dark' : 'exprua-light';
        monaco.editor.setTheme(theme);
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Initialize theme
const savedTheme = localStorage.getItem('theme');
const initialDark = savedTheme ? savedTheme === 'dark' : prefersDarkScheme.matches;
setTheme(initialDark);
darkModeToggle.checked = initialDark;

// Theme toggle handler
darkModeToggle.addEventListener('change', (e) => {
    setTheme(e.target.checked);
});

// System theme change handler
prefersDarkScheme.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        setTheme(e.matches);
        darkModeToggle.checked = e.matches;
    }
});

function updateLoadingStatus(status) {
    loading.textContent = status;
}

// Initialize the application
async function initializeApp() {
    try {
        console.time('Total initialization');
        
        // Start editor initialization early
        console.time('Editor initialization');
        const editorPromise = initializeEditor();
        
        // Load WASM module with detailed timing
        console.time('WASM module loading');
        updateLoadingStatus('Initializing WASM module...');
        
        const modulePromise = Module().then(module => {
            console.timeEnd('WASM module loading');
            return module;
        });

        // Wait for both to complete
        const [module, editors] = await Promise.all([modulePromise, editorPromise]);
        ParserModule = module;
        inputEditor = editors.inputEditor;
        outputEditor = editors.outputEditor;
        console.timeEnd('Editor initialization');
        
        // Set initial editor theme
        const theme = darkModeToggle.checked ? 'exprua-dark' : 'exprua-light';
        monaco.editor.setTheme(theme);
        
        loading.style.display = 'none';
        content.style.display = 'block';
        console.timeEnd('Total initialization');
    } catch (error) {
        console.error('Initialization error:', error);
        loading.innerHTML = `Error loading WebAssembly module: ${error.message}`;
        loading.classList.add('error');
    }
}

// Parse and evaluate the expression
function parseAndEvaluate() {
    if (!ParserModule || !inputEditor || !outputEditor) return;
    
    const playButton = document.querySelector('.play-button');
    playButton.disabled = true;
    const source = inputEditor.getModel().getValue();
    
    try {
        const parser = new ParserModule.ParserWrapper(source);
        const result = parser.parseAndEvaluate();
        console.log("Raw result from WASM:", result);
        
        if (!result) {
            throw new Error("No result returned from evaluator");
        }
        
        if (result.startsWith("Error:")) {
            throw new Error(result.substring(7));
        }
        
        document.getElementById('result').textContent = result;
        
        // Update output editor based on current tab
        let outputContent = '';
        switch (currentTab) {
            case 'symbolTable':
                outputContent = parser.getSymbolTable();
                break;
            case 'ast':
                outputContent = parser.getAst();
                break;
            case 'tokens':
                outputContent = parser.getTokens();
                break;
        }
        outputEditor.getModel().setValue(outputContent);
        document.getElementById('result').classList.remove('error');
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').textContent = `Error: ${error.message}`;
        document.getElementById('result').classList.add('error');
        outputEditor.getModel().setValue('');
    } finally {
        playButton.disabled = false;
    }
}

// Tab switching functionality
function showTab(tabName) {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    document.querySelector(`button[onclick="showTab('${tabName}')"]`).classList.add('active');
    currentTab = tabName;
    
    // Re-run parse and evaluate to update output
    parseAndEvaluate();
}

// Initialize the application when the page loads
window.addEventListener('load', initializeApp);

// Export functions that need to be accessible globally
window.parseAndEvaluate = parseAndEvaluate;
window.showTab = showTab; 