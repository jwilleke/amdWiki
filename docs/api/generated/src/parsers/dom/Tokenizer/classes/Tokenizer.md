[**amdWiki API v1.5.0**](../../../../../README.md)

***

[amdWiki API](../../../../../README.md) / [src/parsers/dom/Tokenizer](../README.md) / Tokenizer

# Class: Tokenizer

Defined in: [src/parsers/dom/Tokenizer.ts:166](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L166)

Tokenizer class

## Constructors

### Constructor

> **new Tokenizer**(`input`): `Tokenizer`

Defined in: [src/parsers/dom/Tokenizer.ts:189](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L189)

Create a new Tokenizer

#### Parameters

##### input

The wiki markup to tokenize

`string` | `null` | `undefined`

#### Returns

`Tokenizer`

## Properties

### column

> **column**: `number`

Defined in: [src/parsers/dom/Tokenizer.ts:180](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L180)

Current column number

***

### line

> **line**: `number`

Defined in: [src/parsers/dom/Tokenizer.ts:177](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L177)

Current line number

***

### position

> **position**: `number`

Defined in: [src/parsers/dom/Tokenizer.ts:174](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L174)

Current position in input

## Methods

### createToken()

> **createToken**(`type`, `value`, `metadata`): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.ts:386](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L386)

Create a token with current position information

#### Parameters

##### type

`string`

Token type from TokenType enum

##### value

`string`

Token value

##### metadata

[`TokenMetadata`](../interfaces/TokenMetadata.md) = `{}`

Additional token metadata

#### Returns

[`Token`](../interfaces/Token.md)

The created token

***

### expect()

> **expect**(`str`): `void`

Defined in: [src/parsers/dom/Tokenizer.ts:459](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L459)

Expect a specific string at current position, throw if not found

#### Parameters

##### str

`string`

String to expect

#### Returns

`void`

#### Throws

Error if string not found

***

### getPosition()

> **getPosition**(): [`PositionInfo`](../interfaces/PositionInfo.md)

Defined in: [src/parsers/dom/Tokenizer.ts:371](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L371)

Get current position information

#### Returns

[`PositionInfo`](../interfaces/PositionInfo.md)

Position information

***

### isEOF()

> **isEOF**(): `boolean`

Defined in: [src/parsers/dom/Tokenizer.ts:355](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L355)

Check if we're at the end of the input

#### Returns

`boolean`

True if at EOF

***

### isLineStart()

> **isLineStart**(): `boolean`

Defined in: [src/parsers/dom/Tokenizer.ts:363](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L363)

Check if we're at the start of a line

#### Returns

`boolean`

True if at line start

***

### match()

> **match**(`str`, `consume`): `boolean`

Defined in: [src/parsers/dom/Tokenizer.ts:442](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L442)

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

> **nextChar**(): `string` \| `null`

Defined in: [src/parsers/dom/Tokenizer.ts:218](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L218)

Get the next character and advance position

#### Returns

`string` \| `null`

Next character or null if at EOF

***

### nextToken()

> **nextToken**(): [`Token`](../interfaces/Token.md) \| `null`

Defined in: [src/parsers/dom/Tokenizer.ts:516](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L516)

Get the next token from the input

#### Returns

[`Token`](../interfaces/Token.md) \| `null`

Next token or null if EOF

***

### parseBoldToken()

> **parseBoldToken**(): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.ts:855](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L855)

Parse bold: __text__

#### Returns

[`Token`](../interfaces/Token.md)

Bold token

***

### parseBracketDirective()

> **parseBracketDirective**(): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.ts:666](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L666)

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

Defined in: [src/parsers/dom/Tokenizer.ts:909](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L909)

Parse code block: {{{code}}}

#### Returns

[`Token`](../interfaces/Token.md)

Code block token

***

### parseCodeInlineToken()

> **parseCodeInlineToken**(): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.ts:891](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L891)

Parse inline code: {{text}}

#### Returns

[`Token`](../interfaces/Token.md)

Code inline token

***

### parseCommentToken()

> **parseCommentToken**(): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.ts:927](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L927)

Parse HTML comment: <!-- comment -->

#### Returns

[`Token`](../interfaces/Token.md)

Comment token

***

### parseEscapedToken()

> **parseEscapedToken**(): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.ts:615](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L615)

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

Defined in: [src/parsers/dom/Tokenizer.ts:781](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L781)

Parse heading: !!!, !!, !

#### Returns

[`Token`](../interfaces/Token.md)

Heading token

***

### parseItalicToken()

> **parseItalicToken**(): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.ts:873](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L873)

Parse italic: ''text''

#### Returns

[`Token`](../interfaces/Token.md)

Italic token

***

### parseListItemToken()

> **parseListItemToken**(): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.ts:807](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L807)

Parse list item: *, #, **, ##, etc.

#### Returns

[`Token`](../interfaces/Token.md)

List item token

***

### parseMetadataToken()

> **parseMetadataToken**(`pos`): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.ts:712](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L712)

Parse metadata: [{SET name=value}]
Called after [{ has been consumed

#### Parameters

##### pos

[`PositionInfo`](../interfaces/PositionInfo.md)

Position object

#### Returns

[`Token`](../interfaces/Token.md)

Metadata token

***

### parseNewlineToken()

> **parseNewlineToken**(): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.ts:598](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L598)

Parse newline token

#### Returns

[`Token`](../interfaces/Token.md)

Newline token

***

### parsePluginToken()

> **parsePluginToken**(`pos`): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.ts:733](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L733)

Parse plugin: [{PluginName param1=value1}]
Called after [{ has been consumed

#### Parameters

##### pos

[`PositionInfo`](../interfaces/PositionInfo.md)

Position object

#### Returns

[`Token`](../interfaces/Token.md)

Plugin token

***

### parseTableCellToken()

> **parseTableCellToken**(): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.ts:837](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L837)

Parse table cell: | cell

#### Returns

[`Token`](../interfaces/Token.md)

Table cell token

***

### parseTextToken()

> **parseTextToken**(): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.ts:945](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L945)

Parse plain text until next special character

#### Returns

[`Token`](../interfaces/Token.md)

Text token

***

### parseVariableToken()

> **parseVariableToken**(`pos`): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.ts:691](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L691)

Parse variable: [{$varname}]
Called after [{has been consumed

#### Parameters

##### pos

[`PositionInfo`](../interfaces/PositionInfo.md)

Position object

#### Returns

[`Token`](../interfaces/Token.md)

Variable token

***

### parseWikiTagToken()

> **parseWikiTagToken**(): [`Token`](../interfaces/Token.md)

Defined in: [src/parsers/dom/Tokenizer.ts:749](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L749)

Parse wiki tag or link: [link], [link|text]

#### Returns

[`Token`](../interfaces/Token.md)

Wiki tag or link token

***

### peekAhead()

> **peekAhead**(`count`): `string`

Defined in: [src/parsers/dom/Tokenizer.ts:293](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L293)

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

> **peekChar**(): `string` \| `null`

Defined in: [src/parsers/dom/Tokenizer.ts:202](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L202)

Get the current character without advancing

#### Returns

`string` \| `null`

Current character or null if at EOF

***

### pushBack()

> **pushBack**(`char`): `void`

Defined in: [src/parsers/dom/Tokenizer.ts:254](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L254)

Push a character back onto the input stream
Allows the tokenizer to "undo" reading a character

#### Parameters

##### char

Character to push back

`string` | `null`

#### Returns

`void`

***

### readUntil()

> **readUntil**(`delimiters`, `consume`): `string`

Defined in: [src/parsers/dom/Tokenizer.ts:403](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L403)

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

Defined in: [src/parsers/dom/Tokenizer.ts:481](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L481)

Reset tokenizer to beginning

#### Returns

`void`

***

### skipAllWhitespace()

> **skipAllWhitespace**(): `number`

Defined in: [src/parsers/dom/Tokenizer.ts:337](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L337)

Skip all whitespace including newlines

#### Returns

`number`

Number of whitespace characters skipped

***

### skipWhitespace()

> **skipWhitespace**(): `number`

Defined in: [src/parsers/dom/Tokenizer.ts:319](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L319)

Skip whitespace characters (space, tab)
Does NOT skip newlines

#### Returns

`number`

Number of whitespace characters skipped

***

### substring()

> **substring**(`start`, `end`): `string`

Defined in: [src/parsers/dom/Tokenizer.ts:474](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L474)

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

Defined in: [src/parsers/dom/Tokenizer.ts:496](https://github.com/jwilleke/amdWiki/blob/b6a859c7c9297966de89735ea5e8f953df289ac1/src/parsers/dom/Tokenizer.ts#L496)

Tokenize the entire input into tokens

#### Returns

[`Token`](../interfaces/Token.md)[]

Array of tokens
