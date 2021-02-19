import { Tokenizer, Tokens, TokenType } from 'abstract-tokenizer';
import { Pattern, ANY_CHAR } from './pattern';
import { UNIX_WILDCARD_OPERATORS , SQL92_WILDCARD_OPERATORS, UNIX_WILDCARD_ESCAPE } from './constants';

function parseUnixCharacterList(tokenizer : Tokenizer) : Pattern {
    let buffer = [];
    while (tokenizer.current && tokenizer.current.data !==']') {
        buffer.push(tokenizer.current.data);
        tokenizer.next();
    }
    if (tokenizer.current) tokenizer.next();
    return Pattern.oneOf(buffer.join(''));
}

function parseUnixQuotedCharacterSequence(tokenizer : Tokenizer, quote : string) {
    let buffer = [];
    while (tokenizer.current && tokenizer.current.data !== quote) {
        buffer.push(tokenizer.current.data);
        tokenizer.next();
    }
    if (tokenizer.current) tokenizer.next();
    return Pattern.of(buffer.join(''));        
}

function parseUnixWildcardExpression(tokenizer : Tokenizer) : Pattern {

    let patterns : Pattern[] = [];
    let terminal = false;

    while (tokenizer.current && !terminal) {
        switch (tokenizer.current.type) {
            case TokenType.CHAR_SEQUENCE:
                patterns.push(Pattern.of(tokenizer.current.data.toString()));
                tokenizer.next();
                break;
            case TokenType.OPERATOR:
                let operator = tokenizer.current.data;
                switch (operator) {
                    case "*":
                        tokenizer.next();
                        patterns.push(ANY_CHAR.atLeast(0));
                        break;
                    case "?":
                        tokenizer.next();
                        patterns.push(ANY_CHAR);
                        break;
                    case "[":
                        tokenizer.next();
                        patterns.push(parseUnixCharacterList(tokenizer));
                        break;
                    case "\"":
                        tokenizer.next();
                        patterns.push(parseUnixQuotedCharacterSequence(tokenizer,"\""));
                    default:
                        terminal = true;
                }                    
                break;
        }
    }
    return Pattern.of(patterns);
}

function parseSQL92Expression(tokenizer : Tokenizer) {
    let patterns : Pattern[] = [];
    while (tokenizer.current) {
        switch (tokenizer.current.type) {
            case TokenType.CHAR_SEQUENCE:
                patterns.push(Pattern.of(tokenizer.current.data));
                break;
            case TokenType.OPERATOR:
                switch(tokenizer.current.data) {
                    case "%":
                        patterns.push(ANY_CHAR.atLeast(0));
                        break;
                    case "_":
                        patterns.push(ANY_CHAR);
                        break;
                    default:
                        throw new Error("Unknownn Operator");
                }
                break;
        }
        tokenizer.next();
    }
    return Pattern.of(patterns);
}

export class Parsers {

    static parseUnixWildcard(pattern : string | Tokenizer, escape : string = UNIX_WILDCARD_ESCAPE, operators: string[] | Set<string> = UNIX_WILDCARD_OPERATORS) {
        let operatorSet = Array.isArray(operators) ? new Set(operators) : operators;
        let tokenizer = typeof pattern === 'string' ? Tokens.fromString(pattern, escape, operatorSet)[Symbol.iterator]() as Tokenizer : pattern;
        return parseUnixWildcardExpression(tokenizer);
    }

    static parseSQL92(pattern : string | Tokenizer, escape : string) : Pattern {
        let tokenizer = typeof pattern === 'string' ? Tokens.fromString(pattern, escape, SQL92_WILDCARD_OPERATORS)[Symbol.iterator]() as Tokenizer : pattern;
        return parseSQL92Expression(tokenizer);        
    }
}