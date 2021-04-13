import { Parsers } from "./parser";
import { Builders } from "./builder";
import { ANY_STRING, ANY_CHAR } from './pattern';
import { UNIX_WILDCARD_OPERATORS } from './constants';
import { Tokenizer } from "@softwareplumber/abstract-tokenizer";

describe('test parsers', ()=>{
    it('parses simple pattern', ()=>{
        let pattern = Parsers.parseUnixWildcard("abc");
        expect(pattern.test("abc")).toBe(true);
        expect(pattern.test("abcx")).toBe(false);
        expect(pattern.test("xabc")).toBe(false);
        expect(pattern.test("ab")).toBe(false);
        expect(pattern.test("bc")).toBe(false);
        expect(pattern.test("")).toBe(false);    
    });

    it('testParseUnixWildcardWithSinglePlaceholder', ()=>{
        let pattern = Parsers.parseUnixWildcard("a?c");
        expect(pattern.test("abc")).toBe(true);
        expect(pattern.test("abcx")).toBe(false);
        expect(pattern.test("xabc")).toBe(false);
        expect(pattern.test("axc")).toBe(true);
        expect(pattern.test("axyc")).toBe(false);
    });

    it('testParseUnixWildcardSinglePlaceholderEquivalentToANY_CHAR', ()=>{
        let pattern = Parsers.parseUnixWildcard("?");
        expect(pattern).toEqual(ANY_CHAR);
    });       

    it('testParseUnixWildcardWithEscapedPlaceholder', ()=>{
        let pattern = Parsers.parseUnixWildcard("a\\?c");
        expect(pattern.test("a?c")).toBe(true);
        expect(pattern.test("abc")).toBe(false);
        expect(pattern.test("abcx")).toBe(false);
        expect(pattern.test("xabc")).toBe(false);
        expect(pattern.test("axc")).toBe(false);
        expect(pattern.test("axyc")).toBe(false);
    });
    
    it('testParseUnixWildcardWithNonstandardEscapedPlaceholder', ()=>{
        let pattern = Parsers.parseUnixWildcard("a+?c",'+');
        expect(pattern.test("a?c")).toBe(true);
        expect(pattern.test("abc")).toBe(false);
        expect(pattern.test("abcx")).toBe(false);
        expect(pattern.test("xabc")).toBe(false);
        expect(pattern.test("axc")).toBe(false);
        expect(pattern.test("axyc")).toBe(false);
    });    

    it('testParseUnixWildcardWithMultiplePlaceholder', ()=>{
        let pattern = Parsers.parseUnixWildcard("a*c");
        expect(pattern.test("abc")).toBe(true);
        expect(pattern.test("abcx")).toBe(false);
        expect(pattern.test("xabc")).toBe(false);
        expect(pattern.test("axc")).toBe(true);
        expect(pattern.test("axyc")).toBe(true);
    });  

    it('testParseUnixWildcardMultiplePlaceholderEquivalentToANY_STRING', ()=>{
        let pattern = Parsers.parseUnixWildcard("*");
        expect(pattern).toEqual(ANY_STRING);
    });      

    it('testParseUnixWildcardWithCharListPlaceholder', ()=>{
        let pattern = Parsers.parseUnixWildcard("a[bc]d");
        expect(pattern.test("abd")).toBe(true);
        expect(pattern.test("acd")).toBe(true);
        expect(pattern.test("xabd")).toBe(false);
        expect(pattern.test("abdx")).toBe(false);
        expect(pattern.test("axd")).toBe(false);
    });  

    it('testParseUnixWildcardWithEscapedCharListPlaceholder', ()=>{
        let pattern = Parsers.parseUnixWildcard("a\\[bc\\]d");
        expect(pattern.test("abd")).toBe(false);
        expect(pattern.test("acd")).toBe(false);
        expect(pattern.test("xabd")).toBe(false);
        expect(pattern.test("abdx")).toBe(false);
        expect(pattern.test("axd")).toBe(false);
        expect(pattern.test("a[bc]d")).toBe(true);
    });

    it('testParseUnixWildcardWithNonstandardEscapedCharListPlaceholder', ()=>{
        let pattern = Parsers.parseUnixWildcard("a+[bc+]d",'+');
        expect(pattern.test("abd")).toBe(false);
        expect(pattern.test("acd")).toBe(false);
        expect(pattern.test("xabd")).toBe(false);
        expect(pattern.test("abdx")).toBe(false);
        expect(pattern.test("axd")).toBe(false);
        expect(pattern.test("a[bc]d")).toBe(true);
    });  
    
    it('testParseUnixWildcardWithQuotedPlaceholders', ()=>{
        let pattern = Parsers.parseUnixWildcard("\"a[bc]d\"");
        expect(pattern.test("abd")).toBe(false);
        expect(pattern.test("acd")).toBe(false);
        expect(pattern.test("xabd")).toBe(false);
        expect(pattern.test("abdx")).toBe(false);
        expect(pattern.test("axd")).toBe(false);
        expect(pattern.test("a[bc]d")).toBe(true);
    });  

    it('testParseUnixWildcardWithEscapedQuotedPlaceholders', ()=>{
        let pattern = Parsers.parseUnixWildcard("\\\"a[bc]d\\\"");
        expect(pattern.test("\"abd\"")).toBe(true);
        expect(pattern.test("\"acd\"")).toBe(true);
        expect(pattern.test("x\"abd")).toBe(false);
        expect(pattern.test("\"abd\"x")).toBe(false);
        expect(pattern.test("\"axd\"")).toBe(false);
        expect(pattern.test("\"a[bc]d\"")).toBe(false);
    });  

    it('testParseUnixWildcardWithNonstandardEscapedQuotedPlaceholders', ()=>{
        let pattern = Parsers.parseUnixWildcard("+\"a[bc]d+\"",'+');
        expect(pattern.test("\"abd\"")).toBe(true);
        expect(pattern.test("\"acd\"")).toBe(true);
        expect(pattern.test("x\"abd")).toBe(false);
        expect(pattern.test("\"abd\"x")).toBe(false);
        expect(pattern.test("\"axd\"")).toBe(false);
        expect(pattern.test("\"a[bc]d\"")).toBe(false);
    });  

    it('testParseUnixWildcardStopsOnUnrecognizedOperator', ()=>{
        let tokenizer = new Tokenizer("a?b*c|d"[Symbol.iterator](),  '\\', new Set([...UNIX_WILDCARD_OPERATORS, "|" ]));
        let pattern = Parsers.parseUnixWildcard(tokenizer);
        expect(pattern.build(Builders.toUnixWildcard())).toBe("a?b*c");
    });  
    
    it('testParseSQL92SimpleText', ()=>{
        let pattern = Parsers.parseSQL92("abc",'\\');
        expect(pattern.test("abc")).toBe(true);
        expect(pattern.test("abcx")).toBe(false);
        expect(pattern.test("xabc")).toBe(false);
        expect(pattern.test("ab")).toBe(false);
        expect(pattern.test("bc")).toBe(false);
        expect(pattern.test("")).toBe(false);
    });  
    
    it('testParseSQL92WithSinglePlaceholder', ()=>{
        let pattern = Parsers.parseSQL92("a_c",'\\');
        expect(pattern.test("abc")).toBe(true);
        expect(pattern.test("abcx")).toBe(false);
        expect(pattern.test("xabc")).toBe(false);
        expect(pattern.test("axc")).toBe(true);
        expect(pattern.test("axyc")).toBe(false);
    });      

    it('testParseSQL92WithMultiplePlaceholder', ()=>{
        let pattern = Parsers.parseSQL92("a%c",'\\');
        expect(pattern.test("abc")).toBe(true);
        expect(pattern.test("abcx")).toBe(false);
        expect(pattern.test("xabc")).toBe(false);
        expect(pattern.test("axc")).toBe(true);
        expect(pattern.test("axyc")).toBe(true);
    });      
});

