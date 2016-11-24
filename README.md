# Tampermonkey Scripts

## ExtJS Dev Tools Utils

This script allows you to manage all your extJs components from Dev Tools console.

### Installation

Tampermonkey extension is required and enabled (https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=es)

Just open this link and click on install:

 https://raw.githubusercontent.com/bommox/tampermonkey-scripts/master/ext-js-utils.user.js

### Usage
 
Lookup one component  (stored in x0  var):

- By ID: Use `x("ext-field-5")`. 
- Containing DOM : Use `x($0)`.  `$0` is the DOM element selected in dev tools.
- Containing DOM, filter className: Use `x($0, "App")`.

Get a list of components:

- All components: `x("all")`. 
- All components, filter className: `x("all", "App")`. 
- By alias: `x("widget.text")`. 
- By className: `x("Ext.field.Text")`. 

