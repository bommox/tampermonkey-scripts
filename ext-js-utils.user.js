// ==UserScript==
// @name         ExtJS Dev Tools Utils
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  Use the x() function to search for one or more extJs components. Try x("all")
// @homepageURL  https://github.com/bommox/tampermonkey-scripts
// @updateUrl    https://raw.githubusercontent.com/bommox/tampermonkey-scripts/master/ext-js-utils.user.js
// @author       Jorge Blom (@bommox)
// @include     http*
// @run-at      document-end
// @grant       none
// ==/UserScript==

(function() {

    if (window.Ext === undefined) {
        console.log("Tampermonkey ExtJS DEV TOOLS UTILS not used in this page. (no Ext found)");
        return;
    }

    var CMP_QUERY           = "x";

    var WELCOME_MESSAGE = [
        '',
        ' ==============================================================',
        '   ExtJS DEV TOOLS UTILS',
        '   @Author: Jorge Blom (@bommox)',
        ' --------------------------------------------------------------',
        ' ',
        '  Lookup one component  (stored in ' + CMP_QUERY +  '0  var):',
        '    > By ID: Use ' + CMP_QUERY + '("ext-field-5"). ',
        '    > Containing DOM : Use ' + CMP_QUERY + '($0).  $0 is the DOM element selected in dev tools.',
        '    > Containing DOM, filter className: Use ' + CMP_QUERY + '($0, "App").',        
        '  Get a list of components:',
        '    > All components: ' + CMP_QUERY + '("all"). ',
        '    > All components, filter className: ' + CMP_QUERY + '("all", "App"). ',
        '    > By alias: ' + CMP_QUERY + '("widget.text"). ',
        '    > By className: ' + CMP_QUERY + '("Ext.field.Text"). ',
        '  Get Application objects ',
        '    > Get application instance: ' + CMP_QUERY + '("application"). ',
        '    > Get controllers: ' + CMP_QUERY + '("controllers"). ',
        '    > Get stores: ' + CMP_QUERY + '("stores"). ',
        ''

    ].join("\n");

    console.log(WELCOME_MESSAGE);

    window[CMP_QUERY] = function(id, prefix) {
        if (id == "all" || id == "ALL") {
            id = undefined;
        }
        return cmp(id, prefix); 
    };

    function getAllComponents() {
        return (Ext.ComponentManager.getAll)
            ? Ext.ComponentManager.getAll()
            : Ext.ComponentManager.all.getArray();
    }

 
    function cmp(id, classPrefix) {

        if (id === undefined) {
            // Lista todos los componentes 
            var allComponents = getAllComponents();
            if (classPrefix) {
                // Filtra por clase
                allComponents = allComponents.filter((c) => c.$className.indexOf(classPrefix) === 0);
            }
            return getComponentDataArray(allComponents);
        }


        if (typeof(id) == "string" ) {
            id = id.replace("#","");
            var isAlias = Ext.ClassManager.getByAlias(id) != undefined;
            if (isAlias) {
                // Se resuelve la clase
                id = Ext.getClassName(Ext.ClassManager.getByAlias(id));
            }
            var isClass = Ext.ClassManager.get(id) != undefined;
            var resultCmp = Ext.getCmp(id);
            if (resultCmp) {
                return selectCmp(resultCmp);
            } else if (id == "stores") {
                return getStores();
            } else if (id == "controllers") {
                return getControllers();
            } else if (id == "application") {
                return getApplication();
            } else if (isClass) {
                // Es una clase.
                var classComponents = getAllComponents().filter((c) => c.$className == id);
                return getComponentDataArray(classComponents);          
            }
        }

        if (Ext.getClassName(Ext.get(id)) == "Ext.dom.Element") {
            // Es un elemento DOM
            // Se busca su padre
            var resultCmp = getParentComponent(id, classPrefix);
            if (resultCmp) {
                return selectCmp(resultCmp);
            }
        }
        
        return undefined;    
    }

    function selectCmp(cmp) {
        var data = getComponentData(cmp);
        console.log("#" + data.id + " " + data.alias + " [" + data.$class + "]");
        console.log(data);
        var storedName = CMP_QUERY +  '0';
        window[storedName] = cmp;
        console.log(" - Component stored in " + storedName + " var.");
        return cmp;
    }

    function getParentComponent(domEl, classPrefix) {
        var cid;
        try {
            cid = domEl.getAttribute("data-componentid");
        } catch(e) {
            return undefined;
        }
        var cmp;
        if (cid) {
            cmp = Ext.getCmp(cid)
        }
        if (cmp && (!classPrefix || Ext.getClassName(cmp).indexOf(classPrefix) > -1 )) {
            return cmp;
        } else {
            return getParentComponent(domEl.parentNode, classPrefix);
        }
    }


    function getComponentData(cmp) {
        return {
            alias :  cmp.alias && cmp.alias[0],
            id : cmp.id,
            $class : cmp.$className,
            dom : cmp.el && cmp.el.dom,
            cmp : cmp
        }
    }

    function getComponentDataArray(cmpArray) {
        var result = {};
        console.log(cmpArray.length + " components");
        cmpArray.forEach(function(cmp) {
            var data = getComponentData(cmp);
            result["[" + data.alias + "] " + "#" + data.id] = data;
        });
        return result;
    }

    function getApplication() {
        var app;        
        Ext.ClassManager.names && Ext.ClassManager.names.forEach(function(n) {
           if (window[n] && window[n].app && window[n].app.controllers) {
               app = window[n].app;
           } 
        });
        if (!app) {
            Object.keys(Ext.ClassManager.classes)
                .filter((k) => k.indexOf("Ext") == -1)
                .map((k) => k.substr(0, k.indexOf(".")))
                .reduce((a,b) => (a.indexOf(b) == -1) ? (a + "," + b) :  a)
                .split(",").filter(v => v.length > 0)
                .forEach(prefix => {
                    if (window[prefix] && window[prefix].app && window[prefix].app.$className == "Ext.app.Application") {
                        app = window[prefix].app;
                    }
                });
        }
        
        return app;
    }

    function getControllers() {
        var app = getApplication();
        var result = {};
        var controllers = (app.controllers) 
            ? app.controllers
            : app.controllers.items.map(c => Ext.getClassName(c));
        controllers.forEach(c => {
            try {
                result[c] = app.getController(c);
            } catch (e) {  }
        });
        return result;
    }

    function getStores() {
        var app = getApplication();
        var result = {};
        app.getStores().forEach((s) => {
            result[Ext.getClassName(s)] = s;
        });
        return result;
    }

})();