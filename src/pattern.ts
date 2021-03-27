import PatternType from './patterntype';
import { Builder, Builders } from './builder';
import { IPredicate } from '@softwareplumber/abstract-function'
import { UNIX_WILDCARD_ESCAPE, UNIX_WILDCARD_OPERATORS } from './constants';
import ImmutableSet from '@softwareplumber/immutable-set';

type Predicate<T> = (target : T) => boolean;

export abstract class Pattern implements Iterable<Pattern>, IPredicate<string> {
    /** match this pattern against some string */
    //abstract match(matchable: string) : boolean; 
    abstract get type() : PatternType;
    get chars() : string | undefined { return undefined; }
    get attrs() : Map<string,any> | undefined { return undefined; }
    abstract [Symbol.iterator]() : Iterator<Pattern>;
    abstract isSimple(): boolean;
    abstract lowerBound(): string;

    /** create a new pattern which will match this pattern, followed by another pattern */
    then(next : Pattern) : Pattern {
        return new GroupPattern([this, next]);
    }
    /** create a new pattern matching at least n instance of this pattern */
    atLeast(count : number) : Pattern {
        return new AtLeastPattern(this, count);
    }

    /** compare with another pattern */
    equals(object : Pattern | undefined | null) : boolean {
        if (this === object) return true;
        if (!object) return false;
        if (this.type !== object.type) return false;
        return true;        
    }

    test(target : string) : boolean {
        return this.build(Builders.toRegExp()).test(target);
    }

    /** build part of something from this pattern */
    private buildFragment(builder : Builder<any>) : void {
        builder.begin(this.type, this.attrs, this.chars);
        for (const pattern of this) {
            pattern.buildFragment(builder);
        }
        builder.end(this.type);
    }

    /** build something from this pattern */
    build<U>(builder : Builder<U>) : U {
        this.buildFragment(builder);
        return builder.build();
    }

    toString(escape = UNIX_WILDCARD_ESCAPE, operators = UNIX_WILDCARD_OPERATORS) : string {
        return this.build(Builders.toUnixWildcard(escape, operators));
    }

    /** create a pattern from a string or an array of patterns */
    static of(elems : string | Pattern[]) : Pattern {
        if (typeof elems === 'string') {
           return new CharSequencePattern(elems);
        }
        if (Array.isArray(elems)) {
            return new GroupPattern(elems);
        }
        throw new Error("can't create pattern from elements given");
    }

    /** create a pettern that matches one of a set of character */
    static oneOf(elems: string) {
        return new OneOfPattern(elems);
    }
}

class GroupPattern extends Pattern {

    elements : Pattern[];

    constructor(elements : Pattern[]) {
        super();
        this.elements = [...elements];
    }

    get type() { return PatternType.GROUP_EXPR; }
    [Symbol.iterator]() { return this.elements[Symbol.iterator](); }
    isSimple() { return this.elements.every(pattern=>pattern.isSimple()); }
    lowerBound() {
        let result : string = "";
        for (let element of this.elements) {
            result+=(element.lowerBound());
            if (!element.isSimple()) break;
        }
        return result;       
    }
    equals(pattern : Pattern | undefined | null) : boolean {
        if (!super.equals(pattern)) return false;
        let group = pattern as GroupPattern;
        if (this.elements.length !== group.elements.length) return false;
        return this.elements.every((v,i)=>v.equals(group.elements[i]));
    }
}

class AtLeastPattern extends Pattern {

    pattern : Pattern;
    count: number;

    constructor(pattern: Pattern, count: number) {
        super();
        this.pattern = pattern;
        this.count = count;
    }

    get type() { return PatternType.AT_LEAST; }
    get attrs() { return new Map([["count", this.count]]); }
    [Symbol.iterator]() { return [this.pattern][Symbol.iterator](); }
    isSimple() { return false; }
    lowerBound() {
        if (this.pattern.isSimple()) {
            return this.pattern.lowerBound().repeat(this.count);
        } else {
            return this.count == 0 ? "" : this.pattern.lowerBound();
        }          
    }
    equals(pattern : Pattern | undefined | null) : boolean {
        if (!super.equals(pattern)) return false;
        let atLeast = pattern as AtLeastPattern;
        if (this.count !== atLeast.count) return false;
        return this.pattern.equals(atLeast.pattern);
    }
}

class CharSequencePattern extends Pattern {
    private _chars : string;

    constructor(chars : string) {
        super();
        this._chars = chars;
    }

    get type() { return PatternType.CHAR_SEQUENCE; }
    get chars() { return this._chars; }
    [Symbol.iterator]() { return [][Symbol.iterator](); }
    isSimple() { return true; }
    lowerBound() { return this._chars; }
    equals(pattern : Pattern | undefined | null) : boolean {
        if (!super.equals(pattern)) return false;
        let charSequence = pattern as CharSequencePattern;
        return this._chars === charSequence._chars;
    }    
}

class OneOfPattern extends Pattern {
    private _chars : string;

    constructor(chars : string) {
        super();
        this._chars = chars;
    }

    get type() { return PatternType.ONE_OF_EXPR; }
    get chars() { return this._chars; }
    [Symbol.iterator]() { return [][Symbol.iterator](); }
    isSimple() { return false; }
    lowerBound() { return [...this._chars].sort()[0] }
    equals(pattern : Pattern | undefined | null) : boolean {
        if (!super.equals(pattern)) return false;
        let oneOf = pattern as OneOfPattern;
        return this._chars === oneOf._chars;
    }    
}

class AnyCharPattern extends Pattern {
    constructor() {
        super();
    }

    get type() { return PatternType.ANY_CHAR_EXPR; }
    [Symbol.iterator]() { return [][Symbol.iterator](); } 
    isSimple() { return false; }   
    lowerBound() { return ""; }
}

class EmptyPattern extends Pattern {
    constructor() {
        super();
    }

    get type() { return PatternType.EMPTY; }
    [Symbol.iterator]() { return [][Symbol.iterator](); }    
    isSimple() { return true; }
    lowerBound() { return ""; }
}

export const ANY_CHAR : Pattern = new AnyCharPattern();
export const EMPTY: Pattern = new EmptyPattern();