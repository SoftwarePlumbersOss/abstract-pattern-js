import ImmutableSet from "@softwareplumber/immutable-set";
import { default as Constants, SQL92_WILDCARD_OPERATORS, UNIX_WILDCARD_OPERATORS } from "./constants";


describe('test constants', ()=>{
    it('Constant values map to named exports', ()=>{
        expect([...Constants.SQL92_WILDCARD_OPERATORS]).toEqual([...SQL92_WILDCARD_OPERATORS]);
        expect([...Constants.UNIX_WILDCARD_OPERATORS]).toEqual([...UNIX_WILDCARD_OPERATORS]);
    });

    it('Constant values are immutable', () => {
        Constants.SQL92_WILDCARD_OPERATORS.add('*');
        expect(SQL92_WILDCARD_OPERATORS.has('*')).toBe(false);
        Constants.UNIX_WILDCARD_OPERATORS.add('%');
        expect(UNIX_WILDCARD_OPERATORS.has('%')).toBe(false);
    });

    it('Constant values have the right type', () => {
        let a : ImmutableSet<String> = Constants.UNIX_WILDCARD_OPERATORS;
    });

});