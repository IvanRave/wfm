Developer notes
===

Build:
---
### Development (dev folder)
* grunt
### Production (dst folder)
* grunt --prod

Other build types:
---
#### IPad (IOS)
* grunt --ipad
#### Metro (Windows)
* grunt --metro
Metro application can not use links to directories. Please use full url path (with index.html)

AngularJs: 
---
* for ngSrc and href - use {[{ my.value }]}
* for other elements use <span ng-bind="my.value"></span>

Language:
---
* Generated any language using assemble.io engine
* Add folder to assemble_store/data/lang with need language json object
* Change settings in Gruntfile.js

CORS support:
---
* Do not use in production (IE9 doesn't support requests wit json type and cookies)
* Only for development (in modern browsers) and other project types (IOS, desktop etc.)

Javascript:
---
* Use single quotes

Html:
---
* Use double quotes