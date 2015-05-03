jquery.graphviz.svg
===================

jQuery plugin to make Graphviz SVG output more interactive and easier to navigate.  Makes it easy to have features like:
* Highlight nodes/edges
* Zoom in/out
* Graph navigation - select linked nodes
* Fancy UI tooltips; bootstrap supported out the box
* Move things forward/back in the graph

Have a look at the demo: https://cdn.rawgit.com/mountainstorm/jquery.graphviz.svg/master/demo.html


Documentation
-------------

Create a node where you want your SVG graph to be displayed.  Typically you will want to:
* set its size (width/height/top/bottom etc)
* set it as a positioning root; set `positioning: relative` or somethign else
* enable `overflow: scroll`

Something like this works pretty well:
`<div id="graph" style="width: 100%; height: 100%; overflow: scroll; position: relative;"></div>`

Next includes the css, and javascript:
`<link rel="stylesheet" href="css/graphviz.svg.css">`

`<script type="text/javascript" src="js/graphviz.svg.js"></script>`

Then init the node as a Graphviz object:
```
$(document).ready(function(){
    $("#graph").graphviz({
        url: "demo.svg", 
        ready: function() {
            var gv = this
        }
    });
});
```

Depending on the options passed this will load, adopt and setup the Graphviz generated SVG under `#graph` and call your supplied `ready` function when the setup is complete.

Options:
* __url__: if present the url to fetch the svg from
* __svg__: raw SVG (xml) data to adopt 
* __shrink__: the amount to shrink nodes by; this gives a nice gap between nodes and edges.  Default '0.125pt'
* __tooltips__: object containing callbacks for `init`, `show`, `hide` and `update`.  Default implementation uses bootstrap
* __zoom__: enable shift-scroll zoom.  Default true
* __highlight__: object containing callbacks for `selected`, `unselected`; Default dims color of unselected
* __ready__: callback when setup is complete.  Will be asyncronous if loading svg from a url

The demo (demo.html) and the source (`GraphvizSvg.DEFAULTS`) show how these work in detail.

There are also other methods you can call to navigate the graph, select elements, highlight, move etc.  To access these you need to get the 'graphviz.svg' object from the jQuery element you initialized (`$('#graph').data('graphviz.svg')`); it is also supplied as `this` to the `ready` callback.

`GraphvizSvg.nodes()`
Returns all node DOM elements

`GraphvizSvg.edges()`
Returns all edge DOM elements

`GraphvizSvg.nodesByName()`
Returns an object mapping graphviz node names to its DOM element

`GraphvizSvg.edgesByName()`
Returns an object mapping graphviz edge names to its DOM element

`GraphvizSvg.linkedTo(node, includeEdges)`
Returns a jQuery set of DOM elements linked to `node`; if includeEdges is true if also includes the edges

`GraphvizSvg.linkedFrom(node, includeEdges)`
Returns a jQuery set of DOM elements linked from `node`; if includeEdges is true if also includes the edges

`GraphvizSvg.linked(node, includeEdges)`
Returns a jQuery set of DOM elements linked with `node` (in an undirected graph); if includeEdges is true if also includes the edges

`GraphvizSvg.tooltip($elements, show)`
Show/hide tooltips on the SOM elements in the `$elements` set

`GraphvizSvg.bringToFront($elements)`
Brings the DOM elements in the jQuery set to the front
  
`GraphvizSvg.sendToBack($elements)`
Sends the DOM elements in the jQuery set to the back

`GraphvizSvg.highlight($nodesEdges, tooltips)`
Highlight the DOM elements in `$nodesEdges`, if `tooltips` is true also show tooltips.  If no nodes are passed it unselects all nodes/edges


Dependencies
------------

* jquery-2.1.3.js; for everything
* Bootstrap; for default tooltips - not needed if you disable/dont use your own tooltips
* jquery.color.js; for default highligh coloring - not needed it you supply your own
* jquery.mousewheel.js; for scrolling - not needed if you turn it off


Keywords
--------
jQuery, Graphviz, dot, svg


License
-------

Copyright (c) 2015 Mountainstorm
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.