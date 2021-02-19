# abstract-pattern

abstract-pattern is designed to help perform wildcard searches in a cross-platform environment.

A native 'abstract pattern' wildcard expression can be constructed programatically:

```javascript
    let pattern = Pattern.of([Pattern.of("abc"), ANY_CHAR.atLeast(1)])
```

Matches the string 'abc' followed by at least one other character. This can be output in various ways:

```javascript
    let wildcardFormat = pattern.build(Builders.toUnixWildcard()); // produces abc?*
    let sqlFormat = pattern.build(Builders.toSQL92()); // produces abc_%
    let regex = pattern.build(Builders.toRegularExpression()); // produces abc.+
```

The pattern object can also be used to directly match strings:

```javascript
    let result = pattern.match('abc123');
```

Note that a pattern may be constructed which cannot be precisely expressed in the target format. For example:

```javascript
    let pattern = Pattern.oneOf('1234567890');
    let wildcardFormat = pattern.build(Builders.toSQL92()); // produces ?
    let regex = pattern.build(Builders.toRegularExpression()); // produces [1234567890]
```

The principle here is that the format produced should select for the minimum possible superset of the results that would selected by the native pattern, given the limitations of the target format.

Abstract pattern also provides for the parsing of expressions in some target formats:

```javascript
    let pattern = Parsers.parseUnixWildcard('abc*');
    let pattern = Parsers.parseSQL('abc%');
```
