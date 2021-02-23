
import ImmutableSet from '@softwareplumber/immutable-set';

export const UNIX_WILDCARD_OPERATORS  = new ImmutableSet([ "*", "?", "[" , "]", "\"" ]); 
export const SQL92_WILDCARD_OPERATORS = new ImmutableSet([ "%", "_" ]); 
export const REGEX_OPERATORS = new ImmutableSet(['[',']','(',')','*','+','?','|','.',',','^','$','{','}']);
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

