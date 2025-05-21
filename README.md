# VioletScript - Programming Language & IDE

![VioletScript Logo](./favicon.ico)

## Overview

VioletScript is an elegant, modern programming language with a purple theme, designed as part of a Programming Language Design course project. The language features a clean, readable syntax with emphasis on simplicity and expressiveness.

**Live Demo:** [https://violetscript.vercel.app](https://violetscript.vercel.app)

## Features

### Language Features

- Clean, intuitive syntax with keywords like `begin`, `end`, `check`, `otherwise`
- Strong variable typing using the arrow operator (`->`)
- Control structures including conditionals and loops
- Various loop constructs: `repeat-times`, `loop when`, and `foreach-in`
- Display output using the `display` keyword
- Comments using the `#` symbol

### IDE Features

- Syntax highlighting
- Live code analysis
- Token visualization
- Abstract Syntax Tree (AST) generation and visualization
- Grammar reference and documentation
- Dark/light theme toggle
- Responsive design for desktop and mobile devices

## Language Syntax Examples

### Variable Declaration

```
var x -> 10
var message -> "Hello, VioletScript!"
```

### Conditional Statements

```
check x == 10 begin
    display "x equals 10"
end

check y > 0 begin
    display "y is positive"
end otherwise begin
    display "y is not positive"
end
```

### Loops

```
# Repeat a specific number of times
repeat 5 times begin
    display "Hello!"
end

# While loop
loop when counter < 10 begin
    counter -> counter + 1
end

# For-each loop
foreach item in collection begin
    display item
end
```

## Project Structure

- `compiler/` - Contains the core language implementation
  - `lexer.js` - Tokenizes source code
  - `parser.js` - Builds AST from tokens
  - `grammarLoader.js` - Loads and processes the language grammar
  - `violetscript.grm` - Formal grammar definition
- `index.html` - Main application structure
- `app.js` - Application logic
- `styles.css` - Styling and animations
- `favicon.ico`

## Technical Implementation

The language implementation consists of several components:

1. **Lexer**: Breaks down source code into tokens, identifying keywords, identifiers, literals, and operators
2. **Parser**: Transforms tokens into an Abstract Syntax Tree representing the program structure
3. **Grammar Definition**: Formal BNF-style grammar that defines the language syntax
4. **IDE Interface**: Web application that provides coding environment and visualizations

## Local Development

To run this project locally:

1. Clone the repository
2. Open the project folder in your preferred code editor
3. Launch the `index.html` file in a modern web browser
4. Start coding in VioletScript!

No build steps are required as the project uses vanilla JavaScript.

## Deployment

This project is deployed on Vercel and can be accessed at:
[https://violetscript.vercel.app](https://violetscript.vercel.app)

## Future Enhancements

- Code execution
- Advanced error reporting with suggestions
- Type checking
- Code completion
- Expanded standard library
- Export/import functionality
- Saving programs to local storage

## Contributors

- [Zeyad Lotfy](https://zeyadlotfy.vercel.app/)
