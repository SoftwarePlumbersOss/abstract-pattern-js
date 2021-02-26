import { Parsers } from "./parser";
import { Builders } from "./builder";
import { Pattern, ANY_CHAR } from './pattern';

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

    it('testCharSequenceAsUnixWildcard', ()=> {
        let pattern = Pattern.of("abc123");
        expect(pattern.build(Builders.toUnixWildcard())).toBe("abc123");
    });
       
    it('testCharSequenceAsSimplePattern', ()=> {
        let pattern = Pattern.of("abc123");
        expect(pattern.build(Builders.toSimplePattern())).toBe("abc123");
    });   
    
    it('testCharSequenceWithSpecialCharsAsUnixWildcard', ()=> {
        let pattern = Pattern.of("abc?123");
        expect(pattern.build(Builders.toUnixWildcard())).toBe("abc\\?123");
    });
    
    it('testCharSequenceWithSpecialCharsAsSimplePattern', ()=> {
        let pattern = Pattern.of("abc?123");
        expect(pattern.build(Builders.toSimplePattern())).toBe("abc?123");
    });  
    
    it('testCharSequenceWithSpecialCharsAsSimplePatternWithEscapedChars', ()=> {
        let pattern = Pattern.of("abc?/123");
        expect(pattern.build(Builders.toSimplePattern('\\', [ '/' ]))).toBe("abc?\\/123");
    });        

    it('testCharSequenceAsUnixWildcardWithEscapes', ()=> {
        let pattern = Pattern.of("ab+123");
        expect(pattern.build(Builders.toUnixWildcard('+'))).toBe("ab++123");
    });
     
    it('testCharSequenceAsUnixWildcardWithEscapesAndExtraOperators', ()=> {
        let pattern = Pattern.of("ab+123");
        expect(pattern.build(Builders.toUnixWildcard('+', [ '2' ]))).toBe("ab++1+23");
    });     
    
    it('testAnyCharAsUnixWildcard', ()=> {
        let pattern = ANY_CHAR;
        expect(pattern.build(Builders.toUnixWildcard())).toBe("?");
    });
     
    it('testOneOfAsUnixWildcard', ()=> {
        let pattern = Pattern.oneOf("abc234");
        expect(pattern.build(Builders.toUnixWildcard())).toBe("[abc234]");
    });

    it('testOneOfAsUnixWildcardWithDefaultEscape', ()=> {
        let pattern = Pattern.oneOf("abc[234");
        expect(pattern.build(Builders.toUnixWildcard())).toBe("[abc\\[234]");
    });
      
    it('testZeroOrMoreAsUnixWildcard', ()=> {
        let pattern = ANY_CHAR.atLeast(0);
        expect(pattern.build(Builders.toUnixWildcard())).toBe("*");
        pattern = Pattern.of("abc123").atLeast(0);
        expect(pattern.build(Builders.toUnixWildcard())).toBe("*");
        pattern = Pattern.oneOf("abc123").atLeast(0);
        expect(pattern.build(Builders.toUnixWildcard())).toBe("*");
    });
      
    it('testOneOrMoreAsUnixWildcard', ()=> {
        let pattern = ANY_CHAR.atLeast(1);
        expect(pattern.build(Builders.toUnixWildcard())).toBe("?*");
        pattern = Pattern.of("abc123").atLeast(1);
        expect(pattern.build(Builders.toUnixWildcard())).toBe("abc123*");
        pattern = Pattern.oneOf("abc123").atLeast(1);
        expect(pattern.build(Builders.toUnixWildcard())).toBe("[abc123]*");
    });
      
    it('testGroupAsUnixWildcard', ()=> {
        let pattern = Pattern.of([Pattern.of("abc"), ANY_CHAR.atLeast(1)]);
        expect(pattern.build(Builders.toUnixWildcard())).toBe("abc?*");
    });
    
    it('testCharSequenceAsSQL92', ()=> {
        let pattern = Pattern.of("abc123");
        expect(pattern.build(Builders.toSQL92('\\'))).toBe("abc123");
    });
      
    it('testCharSequenceAsSQL92WithEscape', ()=> {
        let pattern = Pattern.of("abc%12_3");
        expect(pattern.build(Builders.toSQL92('\\'))).toBe("abc\\%12\\_3");
    });     
    
    it('testCharSequenceAsSQL92WithEscapedEscape', ()=> {
        let pattern = Pattern.of("abc\\123");
        expect(pattern.build(Builders.toSQL92('\\'))).toBe("abc\\\\123");
    });    
    
    it('testAnyCharAsSQL92', ()=> {
        let pattern = ANY_CHAR;
        expect(pattern.build(Builders.toUnixWildcard())).toBe("?");
    });    
    
    it('testOneOfAsSQL92', ()=> {
        let pattern = Pattern.oneOf("abc234");
        expect(pattern.build(Builders.toSQL92('\\'))).toBe("_");
    });
       
    it('testZeroOrMoreAsSQL92', ()=> {
        let pattern = ANY_CHAR.atLeast(0);
        expect(pattern.build(Builders.toSQL92('\\'))).toBe("%");
        pattern = Pattern.of("abc123").atLeast(0);
        expect(pattern.build(Builders.toSQL92('\\'))).toBe("%");
        pattern = Pattern.oneOf("abc123").atLeast(0);
        expect(pattern.build(Builders.toSQL92('\\'))).toBe("%");
    });
    
    it('testOneOrMoreAsSQL92', ()=> {
        let pattern = ANY_CHAR.atLeast(1);
        expect(pattern.build(Builders.toSQL92('\\'))).toBe("_%");
        pattern = Pattern.of("abc123").atLeast(1);
        expect(pattern.build(Builders.toSQL92('\\'))).toBe("abc123%");
        pattern = Pattern.oneOf("abc123").atLeast(1);
        expect(pattern.build(Builders.toSQL92('\\'))).toBe("_%");
    });
     
    it('testGroupAsSQL92', ()=> {
        let pattern = Pattern.of([Pattern.of("abc"), ANY_CHAR.atLeast(1)]);
        expect(pattern.build(Builders.toSQL92('\\'))).toBe("abc_%");
    });    
});
