# Roles

The Roles system works like this:

1. The spefic User roles (like admin, reader, editor) that are assigned to a user are stored in users/users.json
2. Policies define what actions those roles can perform, stored in config/app-default-config.json under amdwiki.access.policies form src/managers/ConfigurationManager.js
3. PolicyEvaluator evaluates whether a role has permission to perform an action

| Constant Name         | Value | Meaning/Role in JSPWiki                                                      |
|----------------------|-------|------------------------------------------------------------------------------|
| **READ**             | 0     | Normal internal page link. Points to a wiki page for viewing (`<a class="wikipage">`). |
| **EDIT**             | 1     | Link to create or edit a page if it does not exist (`<a class="createpage">`).         |
| **EMPTY**            | 2     | Indicates an empty link, renders as underlined text (`<u>`), not clickable.           |
| **LOCAL**            | 3     | Local anchor/footnote within the same page (`<a class="footnote">`).                   |
| **LOCALREF**         | 4     | Reference to a footnote or section within the same page (`<a class="footnoteref">`).   |
| **IMAGE**            | 5     | Image link: an embedded image (`<img>`).                                              |
| **EXTERNAL**         | 6     | External link (URL outside wiki); may append outlink icon (`<a class="external">`).    |
| **INTERWIKI**        | 7     | Link to another wiki system (“InterWiki”) (`<a class="interwiki">`).                  |
| **IMAGELINK**        | 8     | Clickable image that acts as a link (`<a><img></a>`).                                 |
| **IMAGEWIKILINK**    | 9     | Wiki page link with a thumbnail image; links image to a wiki page.                     |
| **ATTACHMENT**       | 10    | Link to an attachment/file uploaded to the wiki (`<a class="attachment">`).            |
