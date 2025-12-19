[**amdWiki API v1.5.0**](../../../README.md)

***

[amdWiki API](../../../README.md) / [plugins/CounterPlugin](../README.md) / export=

# Variable: export=

> `const` **export=**: `object`

Defined in: [plugins/CounterPlugin.js:27](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/plugins/CounterPlugin.js#L27)

CounterPlugin - JSPWiki-style plugin for amdWiki
Maintains page-specific counters that increment each time they render

Unlike a persistent hit counter, this tracks counters within a single page render cycle.
Useful for numbering items, tracking plugin invocations, or conditional logic.

Counter values can be accessed as variables:
- [{$counter}] - Access default counter value without incrementing
- [{$counter-name}] - Access named counter value without incrementing

Syntax examples:
[{Counter}]                          - Default counter, increments by 1, shows value
[{Counter increment='5'}]            - Increments default counter by 5
[{Counter name='chapter'}]           - Named counter 'chapter'
[{Counter name='chapter' increment='2'}] - Increments 'chapter' by 2
[{Counter showResult='false'}]       - Silent increment (no output)
[{Counter start='100'}]              - Reset counter to 100
[{Counter name='section' start='1'}] - Reset named counter to 1
[{Counter increment='-1'}]           - Decrement counter

Based on JSPWiki's Counter.java:
https://github.com/apache/jspwiki/blob/master/jspwiki-main/src/main/java/org/apache/wiki/plugin/Counter.java
https://jspwiki-wiki.apache.org/Wiki.jsp?page=Counter

## Type Declaration

### author

> **author**: `string` = `'amdWiki'`

### description

> **description**: `string` = `'Maintains page-specific counters for numbering and tracking'`

### execute()

> **execute**(`context`, `params`): `string`

Execute the plugin

#### Parameters

##### context

`any`

Wiki context containing counter state

##### params

`any`

Plugin parameters

#### Returns

`string`

Counter value or empty string

### initialize()

> **initialize**(`engine`): `void`

Plugin initialization (JSPWiki-style)
Registers counter variables with VariableManager for [{$counter}] access

#### Parameters

##### engine

`any`

Wiki engine instance

#### Returns

`void`

### name

> **name**: `string` = `'CounterPlugin'`

### parseBoolean()

> **parseBoolean**(`value`, `defaultValue`): `boolean`

Parse a parameter value as a boolean

#### Parameters

##### value

`any`

Value to parse

##### defaultValue

`boolean`

Default if parsing fails

#### Returns

`boolean`

Parsed boolean

### parseNumber()

> **parseNumber**(`value`, `defaultValue`): `number`

Parse a parameter value as a number

#### Parameters

##### value

`any`

Value to parse

##### defaultValue

`number`

Default if parsing fails

#### Returns

`number`

Parsed number

### version

> **version**: `string` = `'1.0.0'`
