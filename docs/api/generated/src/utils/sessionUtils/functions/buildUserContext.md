[**amdWiki API v1.5.0**](../../../../README.md)

***

[amdWiki API](../../../../README.md) / [src/utils/sessionUtils](../README.md) / buildUserContext

# Function: buildUserContext()

> **buildUserContext**(`req`): `Promise`\<[`UserContext`](../interfaces/UserContext.md)\>

Defined in: [src/utils/sessionUtils.ts:48](https://github.com/jwilleke/amdWiki/blob/a3539936e35c848c1c2953d38bbab41386a1cf67/src/utils/sessionUtils.ts#L48)

Builds userContext from Express session, using ConfigurationManager for amdwiki.authorizer
and UserManager to gather user information.
Prepares for future AuthorizationManager.js (JSPWiki-inspired).

## Parameters

### req

`RequestWithSession`

Express request object with session

## Returns

`Promise`\<[`UserContext`](../interfaces/UserContext.md)\>

userContext with user data and roles
