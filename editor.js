// Default code example for the editor
const defaultCode = `
# Calculate Jupiter's orbital period using Kepler's Third Law
def calculate_orbital_period(semi_major_axis, central_mass):
    four_pi_squared = 4 * pi^2
    GM = G * central_mass
    r_cubed = semi_major_axis^3
    period_squared = (four_pi_squared / GM) * r_cubed
    return sqrt(period_squared)

M_sun = 1.989e30 kg
r_jupiter = 7.786e11 m
calculate_orbital_period(r_jupiter, M_sun)`;

import { language as exprUALanguage, lightTheme, darkTheme } from './language.js';

// Initialize Monaco Editors
export function initializeEditor() {
    return new Promise((resolve) => {
        require.config({
            paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }
        });

        require(['vs/editor/editor.main'], function() {
            // Register custom language for input editor
            monaco.languages.register({ id: 'exprua' });
            monaco.languages.setMonarchTokensProvider('exprua', exprUALanguage);
            
            // Define both themes
            monaco.editor.defineTheme('exprua-light', lightTheme);
            monaco.editor.defineTheme('exprua-dark', darkTheme);

            // Get initial theme
            const savedTheme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const initialTheme = savedTheme ? 
                (savedTheme === 'dark' ? 'exprua-dark' : 'exprua-light') : 
                (prefersDark ? 'exprua-dark' : 'exprua-light');

            // Create input editor
            const inputEditor = monaco.editor.create(document.getElementById('editor'), {
                value: defaultCode,
                language: 'exprua',
                theme: initialTheme,
                minimap: { enabled: true },
                scrollBeyondLastLine: true,
                fontSize: 14,
                lineNumbers: 'on',
                renderLineHighlight: 'line',
                automaticLayout: true,
                padding: { top: 12 },
                roundedSelection: false,
                renderIndentGuides: true,
                scrollbar: {
                    useShadows: false,
                    verticalScrollbarSize: 10,
                    horizontalScrollbarSize: 10,
                    vertical: 'auto',
                    horizontal: 'auto',
                    verticalSliderSize: 10,
                    horizontalSliderSize: 10,
                    verticalHasArrows: false,
                    horizontalHasArrows: false,
                    arrowSize: 0,
                    alwaysConsumeMouseWheel: false
                }
            });

            // Create output editor
            const outputEditor = monaco.editor.create(document.getElementById('outputEditor'), {
                value: '',
                theme: initialTheme,
                minimap: { enabled: true },
                scrollBeyondLastLine: true,
                fontSize: 14,
                lineNumbers: 'on',
                readOnly: true,
                automaticLayout: true,
                padding: { top: 12 },
                roundedSelection: false,
                renderIndentGuides: true,
                scrollbar: {
                    useShadows: false,
                    verticalScrollbarSize: 10,
                    horizontalScrollbarSize: 10,
                    vertical: 'auto',
                    horizontal: 'auto',
                    verticalSliderSize: 10,
                    horizontalSliderSize: 10,
                    verticalHasArrows: false,
                    horizontalHasArrows: false,
                    arrowSize: 0,
                    alwaysConsumeMouseWheel: false
                }
            });

            // Add custom CSS for VSCode-like scrollbars
            const style = document.createElement('style');
            style.textContent = `
                .monaco-editor .scrollbar .slider {
                    border-radius: 0;
                    background: rgba(121, 121, 121, 0.4) !important;
                }
                .monaco-editor .scrollbar .slider:hover {
                    background: rgba(100, 100, 100, 0.7) !important;
                }
                .monaco-editor .scrollbar.vertical .slider {
                    width: 10px !important;
                }
                .monaco-editor .scrollbar.horizontal .slider {
                    height: 10px !important;
                }
            `;
            document.head.appendChild(style);

            resolve({ inputEditor, outputEditor });
        });
    });
} 