import PatternType from './patterntype';
import { Tokens, TokenType } from 'abstract-tokenizer';

import { 
    REGEX_OPERATORS, 
    REGEX_ESCAPE, 
    NO_ESCAPE, 
    UNIX_WILDCARD_OPERATORS, 
    SQL92_WILDCARD_OPERATORS, 
    UNIX_WILDCARD_ESCAPE 
} from './constants';

export interface Builder<T> {
    begin(type : PatternType, attrs: Map<string,any> | undefined, chars: string | undefined) : void;
    end(type: PatternType) : void;
    build() : T;
}

function escape(chars : string, escape: string, specialChars : Set<string>) {
    const buffer : string[] = [];
    for (let token of Tokens.fromString(chars, '', specialChars)) {
        switch (token.type) {
            case TokenType.CHAR_SEQUENCE:
                buffer.push(token.data); break;
            case TokenType.OPERATOR:
                buffer.push(escape);
                buffer.push(token.data); break;
            default:
                break;
        }
    }
    return buffer.join('');
}


class RegularExpressionBuilder implements Builder<String> {

    private buffer : string[];
    private scopes:  (Map<String,any>|undefined)[];

    constructor() {
        this.buffer = ['^'];
        this.scopes = [];
    }

    private static REGEX_SPECIAL_CHARS : Set<string> = new Set([...REGEX_OPERATORS, REGEX_ESCAPE]);

    private static escape(chars : string) {
        return escape(chars, REGEX_ESCAPE, RegularExpressionBuilder.REGEX_SPECIAL_CHARS);
    }

    begin(type : PatternType, attrs: Map<string,any> | undefined, chars : string | undefined) {
        switch(type) {
            case PatternType.ANY_CHAR_EXPR:
                this.buffer.push("."); break;
            case PatternType.CHAR_SEQUENCE:
                this.buffer.push(RegularExpressionBuilder.escape(chars || "")); break;
            case PatternType.GROUP_EXPR:
                this.buffer.push("("); break;
            case PatternType.ONE_OF_EXPR:
                this.buffer.push("[");
                this.buffer.push(RegularExpressionBuilder.escape(chars || ""));
                break;
            case PatternType.AT_LEAST:
                this.scopes.push(attrs);
            default:
                break;

        }
    }

    end(type: PatternType) {
        switch(type) {
            case PatternType.GROUP_EXPR:
                this.buffer.push(")");
                break;
            case PatternType.ONE_OF_EXPR:
                this.buffer.push("]");
                break;
            case PatternType.AT_LEAST:
                let count = this.scopes.pop()?.get("count");
                if (count === 0)
                    this.buffer.push('*');
                else if (count === 1)
                    this.buffer.push('+');
                else 
                    this.buffer.push('{'+count+',}')
                break;
            default:
                break;
        }
    }

    build() : string  {
        this.buffer.push('$');
        return this.buffer.join("");
    }
}

class RegExpBuilder implements Builder<RegExp> {

    private builder : RegularExpressionBuilder;

    constructor() {
        this.builder = new RegularExpressionBuilder();
    }

    begin(type : PatternType, attrs : Map<string,any>, chars : string | undefined) {
        this.builder.begin(type, attrs, chars);
    }

    end(type: PatternType) {
        this.builder.end(type);
    }

    build() : RegExp {
        return new RegExp(this.builder.build());
    }
}

class UnixWildcardBuilder implements Builder<String> { 

    private tokens : string[];
    private scopes: [ start: number, attrs: Map<String,any> | undefined ][];
    private specialChars: Set<string>;
    private escapeChar: string;

    private static UNIX_WILDCARD_SPECIAL_CHARS : Set<string> = new Set([...UNIX_WILDCARD_OPERATORS, UNIX_WILDCARD_ESCAPE]);

    constructor(escapeChar = UNIX_WILDCARD_ESCAPE, specialChars : Iterable<string> | undefined) {
        this.tokens = [];
        this.scopes = [];
        this.escapeChar = escapeChar;
        if (specialChars === undefined) {
            this.specialChars = escapeChar === UNIX_WILDCARD_ESCAPE 
                ? UnixWildcardBuilder.UNIX_WILDCARD_SPECIAL_CHARS
                : new Set([...UNIX_WILDCARD_OPERATORS, escapeChar]);
        } else {
            this.specialChars = new Set([...UNIX_WILDCARD_OPERATORS, ...specialChars, escapeChar])
        }
    }


    private escape(chars : string) {
        return escape(chars, this.escapeChar, this.specialChars);
    }

    begin(type : PatternType, attrs : Map<string,any> | undefined, chars : string | undefined) {
        switch(type) {
            case PatternType.ANY_CHAR_EXPR:
                this.tokens.push("?"); break;
            case PatternType.CHAR_SEQUENCE:
                this.tokens.push(this.escape(chars || "")); 
                break;
            case PatternType.GROUP_EXPR:
                this.scopes.push([this.tokens.length,attrs]);
                break;
            case PatternType.ONE_OF_EXPR:
                this.scopes.push([this.tokens.length,attrs]);
                this.tokens.push('[');
                this.tokens.push(this.escape(chars || ''));
                break;
            case PatternType.AT_LEAST:
                this.scopes.push([this.tokens.length,attrs]);
                break;
            default:
                break;
        }
    }

    end(type: PatternType) {
        let start, attrs;
        switch(type) {
            case PatternType.GROUP_EXPR:
                [start, attrs] = this.scopes.pop() || [0, undefined];
                this.tokens.push(this.tokens.splice(start).join(''));
                break;
            case PatternType.ONE_OF_EXPR:
                [start, attrs] = this.scopes.pop() || [0, undefined];
                this.tokens.push(']');
                this.tokens.push(this.tokens.splice(start).join(''));
                break;
            case PatternType.AT_LEAST:
                [start, attrs] = this.scopes.pop() || [0, undefined];
                let pattern = this.tokens.splice(start).join('');
                if (attrs === undefined) throw new Error("bad attributes for at least pattern");
                this.tokens.push(pattern.repeat(attrs.get("count") as number) + "*");
                break;
            default:
                break;
        }
    }

    build() {
        return this.tokens.join('');
    }
}

class SQL92Builder implements Builder<String> { 

    private tokens : string[];
    private scopes: [ start: number, attrs: Map<String,any> | undefined ][];
    private specialChars: Set<string>;
    private escapeChar: string;

    private static SQL92_SPECIAL_CHARS : Set<string> = new Set([...SQL92_WILDCARD_OPERATORS, UNIX_WILDCARD_ESCAPE]);

    constructor(escapeChar = UNIX_WILDCARD_ESCAPE, specialChars : Iterable<string> | undefined) {
        this.tokens = [];
        this.scopes = [];
        this.escapeChar = escapeChar;
        if (specialChars === undefined) {
            this.specialChars = escapeChar === UNIX_WILDCARD_ESCAPE 
                ? SQL92Builder.SQL92_SPECIAL_CHARS
                : new Set([...SQL92_WILDCARD_OPERATORS, escapeChar]);
        } else {
            this.specialChars = new Set([...SQL92_WILDCARD_OPERATORS, ...specialChars, escapeChar])
        }
    }


    private escape(chars : string) {
        return escape(chars, this.escapeChar, this.specialChars);
    }

    begin(type : PatternType, attrs : Map<string,any> | undefined, chars : string | undefined) {
        switch(type) {
            case PatternType.ANY_CHAR_EXPR:
                this.tokens.push("_"); break;
            case PatternType.CHAR_SEQUENCE:
                this.tokens.push(this.escape(chars || "")); 
                break;
            case PatternType.GROUP_EXPR:
                this.scopes.push([this.tokens.length,attrs]);
                break;
            case PatternType.ONE_OF_EXPR:
                this.tokens.push('_');
                break;
            case PatternType.AT_LEAST:
                this.scopes.push([this.tokens.length,attrs]);
                break;
            default:
                break;
        }
    }

    end(type: PatternType) {
        let start, attrs;
        switch(type) {
            case PatternType.GROUP_EXPR:
                [start, attrs] = this.scopes.pop() || [0, undefined];
                this.tokens.push(this.tokens.splice(start).join(''));
                break;
            case PatternType.AT_LEAST:
                [start, attrs] = this.scopes.pop() || [0, undefined];
                let pattern = this.tokens.splice(start).join('');
                if (attrs === undefined) throw new Error("bad attributes for at least pattern");
                this.tokens.push(pattern.repeat(attrs.get("count") as number) + "%");
                break;
            default:
                break;
        }
    }

    build() {
        return this.tokens.join('');
    }
}

class SimplePatternBuilder implements Builder<String> {

    private buffer : string[];
    private specialChars: Set<string>;
    private escapeChar: string;

    private static SIMPLE_PATTERN_SPECIAL_CHARS : Set<string> = new Set();

    constructor(escapeChar = NO_ESCAPE, specialChars : Iterable<string> | undefined) {
        this.buffer = [];
        this.escapeChar = escapeChar;
        if (specialChars === undefined) {
            this.specialChars = escapeChar === NO_ESCAPE 
                ? SimplePatternBuilder.SIMPLE_PATTERN_SPECIAL_CHARS
                : new Set([escapeChar]);
        } else {
            this.specialChars = new Set([...specialChars, escapeChar])
        }
    }

    private escape(chars : string) {
        return escape(chars, this.escapeChar, this.specialChars);
    }    

    begin(type : PatternType, attrs: Map<string,any> | undefined, chars : string | undefined) {
        switch(type) {
            case PatternType.ONE_OF_EXPR:
            case PatternType.ANY_CHAR_EXPR:
            case PatternType.AT_LEAST:
                throw new Error('not a simple pattern');
            case PatternType.CHAR_SEQUENCE:
                this.buffer.push(this.escape(chars || "")); break;
                break;
            default:
                break;

        }
    }

    end(type: PatternType) {
    }

    build() : string  {
        return this.buffer.join("");
    }
}


export class Builders {
    static toRegularExpression() : Builder<String> {
        return new RegularExpressionBuilder();
    }

    static toRegExp() : Builder<RegExp> {
        return new RegExpBuilder();
    }

    static toUnixWildcard(escape? : string, specialChars? : Iterable<string>) : Builder<String> {
        return new UnixWildcardBuilder(escape, specialChars);
    }

    static toSimplePattern(escape? : string, specialChars? : Iterable<string>) : Builder<String> {
        return new SimplePatternBuilder(escape, specialChars);
    }

    static toSQL92(escape? : string, specialChars? : Iterable<string>) : Builder<String> {
        return new SQL92Builder(escape, specialChars);
    }
}

export default Builders;