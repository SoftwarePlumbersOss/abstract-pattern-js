import { default as Constants, SQL92_WILDCARD_OPERATORS, UNIX_WILDCARD_OPERATORS } from "./constants";


describe('test constants', ()=>{
    it('Constant values map to named exports', ()=>{
        expect([...Constants.SQL92_WILDCARD_OPERATORS]).toEqual([...SQL92_WILDCARD_OPERATORS]);
        expect([...Constants.UNIX_WILDCARD_OPERATORS]).toEqual([...UNIX_WILDCARD_OPERATORS]);
    });

    it('Constant values are immutable', () => {
        expect(()=>{ Constants.SQL92_WILDCARD_OPERATORS.add('*'); }).toThrow('set is immutable');
        expect(()=>{ Constants.UNIX_WILDCARD_OPERATORS.add('%'); }).toThrow('set is immutable');
    });

});