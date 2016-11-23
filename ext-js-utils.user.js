// ==UserScript==
// @name         ExtJS Utils
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Utils to inspect ExtJs components. Call cmp() or cmp('id-of-your-component') to see the info
// @homepageURL  https://github.com/bommox/tampermonkey-scripts
// @updateUrl    https://raw.githubusercontent.com/bommox/tampermonkey-scripts/master/ext-js-utils.user.js
// @author       Jorge Blom
// @include      http*/mov/*
// @include      http*/ria/*
// @run-at      document-start
// @grant       none
// ==/UserScript==

(function() {
    console.log("ExtJS Utils!");
    function cmp(id) {
        if (typeof(id) == "object" && Ext.getClassName(id) === "") {
            // Puede ser un DOM Element
            return cmp(getParentComponent(id));
        } else if (id) {
            window.lcmp = Ext.getCmp(id); 
            console.log(window.lcmp.$className);
            if (window.lcmp.el) {
                console.log(window.lcmp.el.dom); 
            }
            return window.lcmp;

        } else {
            return printCmp();
        }

    }

    function getParentComponent(domEl) {
        if (domEl.getAttribute("data-componentid")) {
            return domEl.getAttribute("data-componentid");
        } else {
            return getParentComponent(domEl.parentNode);
        }
    }

    function printCmp() {
        var result = {};
        $$("[data-componentid]").forEach((el) =>  {
            var id = el.getAttribute("data-componentid");
            var cmp = Ext.getCmp(id);
            var data = {
                alias : cmp.alias,
                id : id,
                $class :  Ext.getClassName(cmp),
                dom : el,
                cmp : cmp
            };
            result[data.$class + "#" + id] = data;
        });
        return result;
    }
    
    window.cmp = cmp;

})();