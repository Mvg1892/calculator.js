document.addEventListener('DOMContentLoaded', () => {
let last_action = null;

    // Event-Listener für Number-Buttons
    let inputs = document.querySelectorAll('.number');

    inputs.forEach(input => {
        input.addEventListener('click', function() {
            let output_field = document.getElementById('solution');
            if (output_field.textContent === '...') {
                output_field.textContent = input.textContent.trim();
            } else {
                output_field.textContent = output_field.textContent + input.textContent.trim();
            }
            last_action = null;
        });
    });

    // Event-Listener für Action-Buttons
    let actions = document.querySelectorAll('.action');

    actions.forEach(action => {
        action.addEventListener('click', function() {
            handle_action(action.textContent.trim());
        });
    });

    // Funktion zur Handhabung von Aktionen
    function handle_action(action_method) {
        let output_field = document.getElementById('solution');

        if (action_method === last_action && action_method !== 'DEL') {
            return;
        }
        if (output_field.textContent === '...') {
            output_field.textContent = '';
        }

        switch (action_method) {
            case 'DEL':
                if (output_field.textContent === '...') {
                    return;
                }
                if (output_field.textContent.length <= 1) {
                    output_field.textContent = '...';
                } else {
                    output_field.textContent = output_field.textContent.slice(0, -1);
                }
                break;
            case 'AC':
                output_field.textContent = '...';
                break;
            case ',':
            case '+':
            case '-':
            case 'x':
            case '/':
            case '(':
            case ')':
            case 'π':
                output_field.textContent = output_field.textContent + action_method;
                // output_field.textContent = output_field.textContent + ' ' + action_method + ' ';
                break;
            case '√':
                // output_field.textContent = action_method + output_field.textContent;
                try {
                    let value = output_field.textContent.replace(/,/g, '.');
                    value = parseFloat(value);
                    if (isNaN(value)) {
                        output_field.textContent = 'Error';
                    } else {
                        output_field.textContent = Math.sqrt(value);
                    }
                } catch (e) {
                    output_field.textContent = 'Error';
                }
                break;
            case 'x!':
                try {
                    let value = output_field.textContent.replace(/,/g, '.');
                    value = parseFloat(value);
                    if (isNaN(value)) {
                        output_field.textContent = 'Error';
                    } else {
                        value = fakultaet(value);
                        output_field.textContent = value;
                    }
                } catch (e) {
                    output_field.textContent = 'Error';
                }
                break;
            case 'x²':
                output_field.textContent = output_field.textContent * output_field.textContent;
                break;
            case '=':
                let solution = solve(output_field.textContent);
                output_field.textContent = solution;
                break;
            default:
                console.log('Unbekannte Aktion: ' + action_method);
        }
        last_action = action_method;
    }
});

function fakultaet (n) {
    if (n < 0 || !Number.isInteger(n)) return 'Error';
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// TODO: eigene Berechnungsmethode welche Klammern und Punkt vor Strich korrekt beachtet
/*
function solve (calculation_input) {
    // hier Rechenlogik
    calculation_input = calculation_input.replace(/,/g, '.');
    console.log(calculation_input);
    let tokens = calculation_input.split(/([+\-x/])/).filter(token => token.trim() !== '');
    console.log(tokens);
    console.log(tokens.length);
    
    for (let i = 0; i < tokens.length; i += 2) {
        // x
    }

    return 5*5; // fallback to debug
}
*/

// shunting-yard Methode duch Hilfe von Grok
function solve(calculation_input) {
    calculation_input = calculation_input.replace(/,/g, '.').replace(/x/g, '*');
    let tokens = calculation_input.split(/([+\-*/()])/).filter(token => token.trim() !== '');
    
    let outputQueue = [];
    let operatorStack = [];
    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };

    // Shunting-Yard: Umwandlung in RPN
    for (let token of tokens) {
        if (!isNaN(parseFloat(token))) {
            outputQueue.push(parseFloat(token));
        } else if (token in precedence) {
            while (operatorStack.length && operatorStack[operatorStack.length - 1] !== '(' &&
                   precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]) {
                outputQueue.push(operatorStack.pop());
            }
            operatorStack.push(token);
        } else if (token === '(') {
            operatorStack.push(token);
        } else if (token === ')') {
            while (operatorStack.length && operatorStack[operatorStack.length - 1] !== '(') {
                outputQueue.push(operatorStack.pop());
            }
            operatorStack.pop(); // Entferne '('
        }
    }
    while (operatorStack.length) {
        outputQueue.push(operatorStack.pop());
    }

    // Berechnung der RPN
    let stack = [];
    for (let token of outputQueue) {
        if (typeof token === 'number') {
            stack.push(token);
        } else {
            let b = stack.pop();
            let a = stack.pop();
            if (token === '+') stack.push(a + b);
            else if (token === '-') stack.push(a - b);
            else if (token === '*') stack.push(a * b);
            else if (token === '/') {
                if (b === 0) return 'Error';
                stack.push(a / b);
            }
        }
    }
    let result = stack[0];
    return isFinite(result) ? result : 'Error';
}