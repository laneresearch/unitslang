/*
 * Compile with:
 * em++ wasm_wrapper.cpp -o wasm_wrapper.js \
 *   -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap"]' \
 *   -s WASM=1 -s NO_EXIT_RUNTIME=1 -s "EXPORTED_FUNCTIONS=['_main']" \
 *   -s ALLOW_MEMORY_GROWTH=1 -O3
 */

#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <emscripten/emscripten.h>
#include <string>
#include <memory>
#include <sstream>
#include <variant>
#include "../units/units.hpp"
#include "../lexer.hpp"
#include "../parser/parser.hpp"
#include "../evaluator.hpp"
#include "../symbol_table.hpp"

using namespace emscripten;
using namespace ExprUA;

class ParserWrapper {
public:
    ParserWrapper(const std::string& source) 
        : source_(source)
        , symbol_table()
        , parser(symbol_table)
        , evaluator(symbol_table) {
            emscripten_log(EM_LOG_CONSOLE, "Source string:\n %s", source.c_str());
        }

    std::string parse_and_evaluate() {
        try {
            emscripten_log(EM_LOG_CONSOLE, "Parsing:\n %s", source_.c_str());
            current_ast = parser.parse(source_);
            emscripten_log(EM_LOG_CONSOLE, "Parsing complete");
            emscripten_log(EM_LOG_CONSOLE, "Evaluating:\n %s", current_ast.print_to_string().c_str());
            emscripten_log(EM_LOG_CONSOLE, "Evaluation started");
            EvaluationResult result = evaluator.evaluate(current_ast);
            emscripten_log(EM_LOG_CONSOLE, "Evaluation complete");
            std::string result_str = print_to_string(result);
            emscripten_log(EM_LOG_CONSOLE, "Result string: %s", result_str.c_str());
            return result_str;
        } catch (const std::exception& e) {
            std::string error_msg = std::string("Error: ") + e.what();
            emscripten_log(EM_LOG_CONSOLE, "Error occurred: %s", error_msg.c_str());
            return error_msg;
        }
    }

    std::string get_symbol_table() const {
        return symbol_table.print_to_string();
    }

    std::string get_ast() const {
        return current_ast.print_to_string();
    }

    std::string get_tokens() const {
        return parser.tokens_to_string();
    }

private:
    std::string source_;
    SymbolTable symbol_table;
    Parser parser;
    Evaluator evaluator;
    AST current_ast;
};

EMSCRIPTEN_BINDINGS(parser_module) {
    class_<ParserWrapper>("ParserWrapper")
        .constructor<std::string>()
        .function("parseAndEvaluate", &ParserWrapper::parse_and_evaluate)
        .function("getSymbolTable", &ParserWrapper::get_symbol_table)
        .function("getAst", &ParserWrapper::get_ast)
        .function("getTokens", &ParserWrapper::get_tokens);
} 