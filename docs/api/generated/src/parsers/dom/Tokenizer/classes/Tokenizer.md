[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/dom/Tokenizer](../README.md) / Tokenizer

# Class: Tokenizer

Defined in: [src/parsers/dom/Tokenizer.js:111](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L111)

Token structure

## Constructors

### Constructor

> **new Tokenizer**(`input`): `Tokenizer`

Defined in: [src/parsers/dom/Tokenizer.js:116](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L116)

Create a new Tokenizer

#### Parameters

##### input

`string`

The wiki markup to tokenize

#### Returns

`Tokenizer`

## Properties

### column

> **column**: `number`

Defined in: [src/parsers/dom/Tokenizer.js:121](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L121)

Column number where token starts

***

### input

> **input**: `string`

Defined in: [src/parsers/dom/Tokenizer.js:117](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L117)

***

### length

> **length**: `number`

Defined in: [src/parsers/dom/Tokenizer.js:118](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L118)

***

### line

> **line**: `number`

Defined in: [src/parsers/dom/Tokenizer.js:120](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L120)

Line number where token starts

***

### position

> **position**: `number`

Defined in: [src/parsers/dom/Tokenizer.js:119](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L119)

Character position in input

***

### pushbackBuffer

> **pushbackBuffer**: `any`[]

Defined in: [src/parsers/dom/Tokenizer.js:122](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L122)

***

### tokens

> **tokens**: `any`[]

Defined in: [src/parsers/dom/Tokenizer.js:123](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L123)

## Methods

### createToken()

> **createToken**(`type`, `value`, `metadata?`): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.js:313](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L313)

Create a token with current position information

#### Parameters

##### type

`string`

Token type from TokenType enum

##### value

`string`

Token value

##### metadata?

`any` = `{}`

Additional token metadata

#### Returns

[`Token`](../interfaces/Token.md)

The created token

***

### expect()

> **expect**(`str`): `void`

Defined in: [src/parsers/dom/Tokenizer.js:385](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L385)

Expect a specific string at current position, throw if not found

#### Parameters

##### str

`string`

String to expect

#### Returns

`void`

#### Throws

If string not found

***

### getPosition()

> **getPosition**(): `any`

Defined in: [src/parsers/dom/Tokenizer.js:298](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L298)

Get current position information

#### Returns

`any`

Position information

***

### isEOF()

> **isEOF**(): `boolean`

Defined in: [src/parsers/dom/Tokenizer.js:282](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L282)

Check if we're at the end of the input

#### Returns

`boolean`

True if at EOF

***

### isLineStart()

> **isLineStart**(): `boolean`

Defined in: [src/parsers/dom/Tokenizer.js:290](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L290)

Check if we're at the start of a line

#### Returns

`boolean`

True if at line start

***

### match()

> **match**(`str`, `consume`): `boolean`

Defined in: [src/parsers/dom/Tokenizer.js:368](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L368)

Match a specific string at current position

#### Parameters

##### str

`string`

String to match

##### consume

`boolean` = `false`

Whether to consume if matched

#### Returns

`boolean`

True if matched

***

### nextChar()

> **nextChar**(): `string`

Defined in: [src/parsers/dom/Tokenizer.js:146](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L146)

Get the next character and advance position

#### Returns

`string`

Next character or null if at EOF

***

### nextToken()

> **nextToken**(): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.js:443](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L443)

Get the next token from the input

#### Returns

[`Token`](../interfaces/Token.md)

Next token or null if EOF

***

### parseBoldToken()

> **parseBoldToken**(): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.js:783](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L783)

Parse bold: **text**

#### Returns

[`Token`](../interfaces/Token.md)

Bold token

***

### parseBracketDirective()

> **parseBracketDirective**(): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.js:594](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L594)

Parse bracket directive [{...}]
Determines type based on content:

- [{$...}] → Variable
- [{SET ...}] → Metadata
- [{...}] → Plugin

#### Returns

[`Token`](../interfaces/Token.md)

Directive token

***

### parseCodeBlockToken()

> **parseCodeBlockToken**(): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.js:837](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L837)

Parse code block: {{{code}}}

#### Returns

[`Token`](../interfaces/Token.md)

Code block token

***

### parseCodeInlineToken()

> **parseCodeInlineToken**(): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.js:819](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L819)

Parse inline code: {{text}}

#### Returns

[`Token`](../interfaces/Token.md)

Code inline token

***

### parseCommentToken()

> **parseCommentToken**(): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.js:855](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L855)

Parse HTML comment: <!-- comment -->

#### Returns

[`Token`](../interfaces/Token.md)

Comment token

***

### parseEscapedToken()

> **parseEscapedToken**(): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.js:543](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L543)

Parse escaped text: [[text]
Syntax: [[content] where [[ outputs literal [
Everything between [[ and ] is treated as plain text
Example: [[{$variable}] renders as literal [{$variable}]

#### Returns

[`Token`](../interfaces/Token.md)

Escaped token

***

### parseHeadingToken()

> **parseHeadingToken**(): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.js:709](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L709)

Parse heading: !!!, !!, !

#### Returns

[`Token`](../interfaces/Token.md)

Heading token

***

### parseItalicToken()

> **parseItalicToken**(): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.js:801](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L801)

Parse italic: ''text''

#### Returns

[`Token`](../interfaces/Token.md)

Italic token

***

### parseListItemToken()

> **parseListItemToken**(): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.js:735](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L735)

Parse list item: *, #, **, ##, etc.

#### Returns

[`Token`](../interfaces/Token.md)

List item token

***

### parseMetadataToken()

> **parseMetadataToken**(`pos`): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.js:640](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L640)

Parse metadata: [{SET name=value}]
Called after [{ has been consumed

#### Parameters

##### pos

`any`

Position object

#### Returns

[`Token`](../interfaces/Token.md)

Metadata token

***

### parseNewlineToken()

> **parseNewlineToken**(): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.js:526](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L526)

Parse newline token

#### Returns

[`Token`](../interfaces/Token.md)

Newline token

***

### parsePluginToken()

> **parsePluginToken**(`pos`): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.js:661](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L661)

Parse plugin: [{PluginName param1=value1}]
Called after [{ has been consumed

#### Parameters

##### pos

`any`

Position object

#### Returns

[`Token`](../interfaces/Token.md)

Plugin token

***

### parseTableCellToken()

> **parseTableCellToken**(): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.js:765](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L765)

Parse table cell: | cell

#### Returns

[`Token`](../interfaces/Token.md)

Table cell token

***

### parseTextToken()

> **parseTextToken**(): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.js:873](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L873)

Parse plain text until next special character

#### Returns

[`Token`](../interfaces/Token.md)

Text token

***

### parseVariableToken()

> **parseVariableToken**(`pos`): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.js:619](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L619)

Parse variable: [{$varname}]
Called after [{has been consumed

#### Parameters

##### pos

`any`

Position object

#### Returns

[`Token`](../interfaces/Token.md)

Variable token

***

### parseWikiTagToken()

> **parseWikiTagToken**(): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.js:677](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L677)

Parse wiki tag or link: [link], [link|text]

#### Returns

[`Token`](../interfaces/Token.md)

Wiki tag or link token

***

### peekAhead()

> **peekAhead**(`count`): `string`

Defined in: [src/parsers/dom/Tokenizer.js:220](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L220)

Peek ahead N characters without consuming them

#### Parameters

##### count

`number`

Number of characters to peek ahead

#### Returns

`string`

String of next N characters

***

### peekChar()

> **peekChar**(): `string`

Defined in: [src/parsers/dom/Tokenizer.js:130](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L130)

Get the current character without advancing

#### Returns

`string`

Current character or null if at EOF

***

### pushBack()

> **pushBack**(`char`): `void`

Defined in: [src/parsers/dom/Tokenizer.js:180](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L180)

Push a character back onto the input stream
Allows the tokenizer to "undo" reading a character

#### Parameters

##### char

`string`

Character to push back

#### Returns

`void`

***

### readUntil()

> **readUntil**(`delimiters`, `consume`): `string`

Defined in: [src/parsers/dom/Tokenizer.js:330](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L330)

Read until a specific character or string is found

#### Parameters

##### delimiters

Character(s) to stop at

`string` | `string`[]

##### consume

`boolean` = `false`

Whether to consume the delimiter

#### Returns

`string`

Text read until delimiter

***

### reset()

> **reset**(): `void`

Defined in: [src/parsers/dom/Tokenizer.js:407](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L407)

Reset tokenizer to beginning

#### Returns

`void`

***

### skipAllWhitespace()

> **skipAllWhitespace**(): `number`

Defined in: [src/parsers/dom/Tokenizer.js:264](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L264)

Skip all whitespace including newlines

#### Returns

`number`

Number of whitespace characters skipped

***

### skipWhitespace()

> **skipWhitespace**(): `number`

Defined in: [src/parsers/dom/Tokenizer.js:246](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L246)

Skip whitespace characters (space, tab)
Does NOT skip newlines

#### Returns

`number`

Number of whitespace characters skipped

***

### substring()

> **substring**(`start`, `end`): `string`

Defined in: [src/parsers/dom/Tokenizer.js:400](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L400)

Get a substring of the input

#### Parameters

##### start

`number`

Start position

##### end

`number`

End position

#### Returns

`string`

Substring

***

### tokenize()

> **tokenize**(): [`Token`](../interfaces/Token.md)[]

Defined in: [src/parsers/dom/Tokenizer.js:423](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/parsers/dom/Tokenizer.js#L423)

Tokenize the entire input into tokens

#### Returns

[`Token`](../interfaces/Token.md)[]

Array of tokens
