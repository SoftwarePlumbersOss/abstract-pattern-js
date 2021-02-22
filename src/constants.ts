export const UNIX_WILDCARD_OPERATORS = new Set<string>([ "*", "?", "[" , "]", "\"" ]); 
export const SQL92_WILDCARD_OPERATORS = new Set<string>([ "%", "_" ]); 
export const REGEX_OPERATORS : Set<string> = new Set<string>(['[',']','(',')','*','+','?','|','.',',','^','$','{','}']);
export const UNIX_WILDCARD_ESCAPE = '\\';
export const REGEX_ESCAPE = '\\';
export const NO_ESCAPE = '';

function freeze<T extends Set<K>, K>(set : T) : Set<K> {
    let copy = new Set<K>(set);
    copy.clear = ()=>{ throw new Error("set is immutable"); };
    copy.delete = (k : K)=>{ throw new Error("set is immutable"); }
    copy.add = (k : K)=>{ throw new Error("set is immutable"); }
    return copy;
}

export default Object.freeze({
    UNIX_WILDCARD_OPERATORS: freeze(UNIX_WILDCARD_OPERATORS),
    SQL92_WILDCARD_OPERATORS: freeze(SQL92_WILDCARD_OPERATORS),
    REGEX_OPERATORS: freeze(REGEX_OPERATORS),
    UNIX_WILDCARD_ESCAPE,
    REGEX_ESCAPE,
    NO_ESCAPE
});

