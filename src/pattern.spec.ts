import { Pattern, ANY_CHAR } from './pattern';

describe('tests basic Pattern operations', () => {

    it('compares patterns', () => {
        expect(Pattern.of("abc123").equals(Pattern.of("abc123"))).toBe(true);
        expect(Pattern.of("abc123").equals(Pattern.of("abd123"))).toBe(false);
        expect(ANY_CHAR.equals(ANY_CHAR)).toBe(true);
        expect(ANY_CHAR.equals(Pattern.of("xyz"))).toBe(false);
        expect(Pattern.oneOf("123").equals(Pattern.oneOf("123"))).toBe(true);
        expect(Pattern.oneOf("123").equals(Pattern.of("123"))).toBe(false);
        expect(ANY_CHAR.atLeast(2).equals(ANY_CHAR.atLeast(2))).toBe(true);
        expect(ANY_CHAR.atLeast(2).equals(ANY_CHAR.atLeast(1))).toBe(false);
        expect(Pattern.of("x").atLeast(1).equals(ANY_CHAR.atLeast(1))).toBe(false);
        expect(Pattern.of("xy").then(ANY_CHAR).equals(Pattern.of("xy").then(ANY_CHAR))).toBe(true);
    });

    it('has default string representation', () => {
        expect(Pattern.of("abc123").toString()).toEqual("abc123");
        expect(ANY_CHAR.toString()).toEqual("?");
        expect(ANY_CHAR.atLeast(2).toString()).toEqual("??*");
        expect(Pattern.of("xy").then(ANY_CHAR).toString()).toEqual("xy?");
    });

    it('char sequence has lower bound', () => {
        let pattern = Pattern.of("abc123");
        expect(pattern.lowerBound()).toEqual("abc123");
    });

    it('any char has lower bound', () => {
        let pattern = ANY_CHAR;
        expect(pattern.lowerBound()).toEqual("");
    });

    it('oneof has lower bound', () => {
        let pattern = Pattern.oneOf("abc234");
        expect(pattern.lowerBound()).toEqual("2");
    });

    it('zeroOrMore has lower bound', () => {
        let pattern = ANY_CHAR.atLeast(0);
        expect(pattern.lowerBound()).toEqual("");
        pattern = Pattern.of("abc123").atLeast(0);
        expect(pattern.lowerBound()).toEqual("");
        pattern = Pattern.oneOf("abc123").atLeast(0);
        expect(pattern.lowerBound()).toEqual("");
    });
    
    it('oneOrMore has lower bound', () => {
        let pattern = ANY_CHAR.atLeast(1);
        expect(pattern.lowerBound()).toEqual("");
        pattern = Pattern.of("abc123").atLeast(1);
        expect(pattern.lowerBound()).toEqual("abc123");
        pattern = Pattern.oneOf("abc123").atLeast(1);
        expect(pattern.lowerBound()).toEqual("1");
    });

    it('group has lower bound', ()=>{
        let pattern = Pattern.of([Pattern.of("abc"), ANY_CHAR.atLeast(1)]);
        expect(pattern.lowerBound()).toEqual("abc");
    })
});
