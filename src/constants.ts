
class ImmutableSet<T> extends Set<T> {
    private _lock : boolean;
    constructor(data : Iterable<T>) {
        super(data);
        this._lock=true;
    }
    clear() { throw new Error("set is immutable"); }
    delete(t : T) : boolean { throw new Error("set is immutable"); }
    add(t : T) : this { if (this._lock) throw new Error("set is immutable"); else return super.add(t); }
}

export const UNIX_WILDCARD_OPERATORS : Set<string> = new ImmutableSet([ "*", "?", "[" , "]", "\"" ]); 
export const SQL92_WILDCARD_OPERATORS : Set<string> = new ImmutableSet([ "%", "_" ]); 
export const REGEX_OPERATORS : Set<string> = new ImmutableSet(['[',']','(',')','*','+','?','|','.',',','^','$','{','}']);
export const UNIX_WILDCARD_ESCAPE = '\\';
export const REGEX_ESCAPE = '\\';
export const NO_ESCAPE = '';

export default Object.freeze({
    UNIX_WILDCARD_OPERATORS,
    SQL92_WILDCARD_OPERATORS,
    REGEX_OPERATORS,
    UNIX_WILDCARD_ESCAPE,
    REGEX_ESCAPE,
    NO_ESCAPE
});

