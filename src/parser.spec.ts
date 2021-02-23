import { Parsers } from "./parser";
import { Builders } from "./builder";
import { UNIX_WILDCARD_OPERATORS } from './constants';
import { Tokenizer } from "@softwareplumber/abstract-tokenizer";

describe('test parsers', ()=>{
    it('parses simple pattern', ()=>{
        let pattern = Parsers.parseUnixWildcard("abc");
        expect(pattern.match("abc")).toBe(true);
        expect(pattern.match("abcx")).toBe(false);
        expect(pattern.match("xabc")).toBe(false);
        expect(pattern.match("ab")).toBe(false);
        expect(pattern.match("bc")).toBe(false);
        expect(pattern.match("")).toBe(false);    
    });

    it('testParseUnixWildcardWithSinglePlaceholder', ()=>{
        let pattern = Parsers.parseUnixWildcard("a?c");
        expect(pattern.match("abc")).toBe(true);
        expect(pattern.match("abcx")).toBe(false);
        expect(pattern.match("xabc")).toBe(false);
        expect(pattern.match("axc")).toBe(true);
        expect(pattern.match("axyc")).toBe(false);
    });

    it('testParseUnixWildcardWithEscapedPlaceholder', ()=>{
        let pattern = Parsers.parseUnixWildcard("a\\?c");
        expect(pattern.match("a?c")).toBe(true);
        expect(pattern.match("abc")).toBe(false);
        expect(pattern.match("abcx")).toBe(false);
        expect(pattern.match("xabc")).toBe(false);
        expect(pattern.match("axc")).toBe(false);
        expect(pattern.match("axyc")).toBe(false);
    });
    
    it('testParseUnixWildcardWithNonstandardEscapedPlaceholder', ()=>{
        let pattern = Parsers.parseUnixWildcard("a+?c",'+');
        expect(pattern.match("a?c")).toBe(true);
        expect(pattern.match("abc")).toBe(false);
        expect(pattern.match("abcx")).toBe(false);
        expect(pattern.match("xabc")).toBe(false);
        expect(pattern.match("axc")).toBe(false);
        expect(pattern.match("axyc")).toBe(false);
    });    

    it('testParseUnixWildcardWithMultiplePlaceholder', ()=>{
        let pattern = Parsers.parseUnixWildcard("a*c");
        expect(pattern.match("abc")).toBe(true);
        expect(pattern.match("abcx")).toBe(false);
        expect(pattern.match("xabc")).toBe(false);
        expect(pattern.match("axc")).toBe(true);
        expect(pattern.match("axyc")).toBe(true);
    });  

    it('testParseUnixWildcardWithCharListPlaceholder', ()=>{
        let pattern = Parsers.parseUnixWildcard("a[bc]d");
        expect(pattern.match("abd")).toBe(true);
        expect(pattern.match("acd")).toBe(true);
        expect(pattern.match("xabd")).toBe(false);
        expect(pattern.match("abdx")).toBe(false);
        expect(pattern.match("axd")).toBe(false);
    });  

    it('testParseUnixWildcardWithEscapedCharListPlaceholder', ()=>{
        let pattern = Parsers.parseUnixWildcard("a\\[bc\\]d");
        expect(pattern.match("abd")).toBe(false);
        expect(pattern.match("acd")).toBe(false);
        expect(pattern.match("xabd")).toBe(false);
        expect(pattern.match("abdx")).toBe(false);
        expect(pattern.match("axd")).toBe(false);
        expect(pattern.match("a[bc]d")).toBe(true);
    });

    it('testParseUnixWildcardWithNonstandardEscapedCharListPlaceholder', ()=>{
        let pattern = Parsers.parseUnixWildcard("a+[bc+]d",'+');
        expect(pattern.match("abd")).toBe(false);
        expect(pattern.match("acd")).toBe(false);
        expect(pattern.match("xabd")).toBe(false);
        expect(pattern.match("abdx")).toBe(false);
        expect(pattern.match("axd")).toBe(false);
        expect(pattern.match("a[bc]d")).toBe(true);
    });  
    
    it('testParseUnixWildcardWithQuotedPlaceholders', ()=>{
        let pattern = Parsers.parseUnixWildcard("\"a[bc]d\"");
        expect(pattern.match("abd")).toBe(false);
        expect(pattern.match("acd")).toBe(false);
        expect(pattern.match("xabd")).toBe(false);
        expect(pattern.match("abdx")).toBe(false);
        expect(pattern.match("axd")).toBe(false);
        expect(pattern.match("a[bc]d")).toBe(true);
    });  

    it('testParseUnixWildcardWithEscapedQuotedPlaceholders', ()=>{
        let pattern = Parsers.parseUnixWildcard("\\\"a[bc]d\\\"");
        expect(pattern.match("\"abd\"")).toBe(true);
        expect(pattern.match("\"acd\"")).toBe(true);
        expect(pattern.match("x\"abd")).toBe(false);
        expect(pattern.match("\"abd\"x")).toBe(false);
        expect(pattern.match("\"axd\"")).toBe(false);
        expect(pattern.match("\"a[bc]d\"")).toBe(false);
    });  

    it('testParseUnixWildcardWithNonstandardEscapedQuotedPlaceholders', ()=>{
        let pattern = Parsers.parseUnixWildcard("+\"a[bc]d+\"",'+');
        expect(pattern.match("\"abd\"")).toBe(true);
        expect(pattern.match("\"acd\"")).toBe(true);
        expect(pattern.match("x\"abd")).toBe(false);
        expect(pattern.match("\"abd\"x")).toBe(false);
        expect(pattern.match("\"axd\"")).toBe(false);
        expect(pattern.match("\"a[bc]d\"")).toBe(false);
    });  

    it('testParseUnixWildcardStopsOnUnrecognizedOperator', ()=>{
        let tokenizer = new Tokenizer("a?b*c|d"[Symbol.iterator](),  '\\', new Set([...UNIX_WILDCARD_OPERATORS, "|" ]));
        let pattern = Parsers.parseUnixWildcard(tokenizer);
        expect(pattern.build(Builders.toUnixWildcard())).toBe("a?b*c");
    });  
    
    it('testParseSQL92SimpleText', ()=>{
        let pattern = Parsers.parseSQL92("abc",'\\');
        expect(pattern.match("abc")).toBe(true);
        expect(pattern.match("abcx")).toBe(false);
        expect(pattern.match("xabc")).toBe(false);
        expect(pattern.match("ab")).toBe(false);
        expect(pattern.match("bc")).toBe(false);
        expect(pattern.match("")).toBe(false);
    });  
    
    it('testParseSQL92WithSinglePlaceholder', ()=>{
        let pattern = Parsers.parseSQL92("a_c",'\\');
        expect(pattern.match("abc")).toBe(true);
        expect(pattern.match("abcx")).toBe(false);
        expect(pattern.match("xabc")).toBe(false);
        expect(pattern.match("axc")).toBe(true);
        expect(pattern.match("axyc")).toBe(false);
    });      

    it('testParseSQL92WithMultiplePlaceholder', ()=>{
        let pattern = Parsers.parseSQL92("a%c",'\\');
        expect(pattern.match("abc")).toBe(true);
        expect(pattern.match("abcx")).toBe(false);
        expect(pattern.match("xabc")).toBe(false);
        expect(pattern.match("axc")).toBe(true);
        expect(pattern.match("axyc")).toBe(true);
    });      
});

