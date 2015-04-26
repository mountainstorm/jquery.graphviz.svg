README
======

This is a first take on a jquery plugin to make svg output from graphviz more interactive.

Example
-------

Have a look at the fiddle: http://jsfiddle.net/vo7pjdeb/


Documentation
-------------

 \brief Provides utility functions for manipulating Graphviz generated svg diagrams.
        These functions allow you to import svg graphs, make them look prettier and
        provide a level of interactivity.

 \param action    the action to perform (see below)
 \param options   (optional) the options to the action

 \details requires:
              https://github.com/jquery/jquery-mousewheel (for enableZoom)
              https://github.com/jquery/jquery-color/ (for highlight)

          Actions:

          "load": loads, adopts and setsup svg from a URL.  
                  options {url: "test.svg", complete:function() {} } and any specified in "setup".

          "adopt": adopts and setsup a chunk of svg and loads it inside this node.  options
                   {svg: xmlData} and any specified in "setup"

          "setup": perform multipl actions to setup the graph
                   options: {shrink: "0.1pt", merge=false} etc
                            svg specifies the xml data to load; key/values specifies actions
                            (and their options) to perform once loaded; merge (optional) 
                            specifies if the supplied actions should be merged with the 
                            default ones - or replace them

                            any graphviz comments supplied are added in "data-comment" attributes

                            defaults:
                                  shrink: "0.125pt",
                                  dropTitles: true,
                                  tooltips: "bootstrap",
                                  noselect: true,
                                   
          "shrink": shrinks all nodes to provide a gap between the edges and nodes
                    making it look nicer and more modern.  

                    options: a number; a string e.g. "1px" or "1pt"; or an object of 
                             the format {x: 6, y: "1pt"}.  "pt" is treated as graphviz 
                             points - allowing you to add padding/width when generating 
                             svg in points.

          "dropTitles": removes the title elements which get added with the .dot node name, 
                        and causes browsers to show tooltips.  We remove them and store the 
                        value as in "data-name" on the "g" element.

          "tooltips": converts tooltip values (xlink:title] to "title", preventing making it 
                      easier to use 3rd party tooltip tools.  If true; just changes attribute
                      if "bootstrap", calls bootstrap tooltip function with this as the container

          "noselect": marks everything (in css) as no-select; so you can't select labels 

          "nodes": select all "g" elements which are nodes

          "edges": select all "g" elements which are edges

          "all": select all "g" elements

          "names": returns a dict {nodes: {n0: element}, edges: {"n0->n1", element}}

          "tooltip-show": show all tooltips of selected nodes/edges; keep them visible even on
                          hover; requires bootstrap tooltips
                   
          "tooltip-hide": hide all tooltips of selected nodes/edges; stop keeping them visible
                          even on hover; requires bootstrap tooltips

          "color": temporarily changes the stroke and fill of nodes/edges, options: color

          "stroke": temporarily changes the stroke of nodes/edges, options: color

          "fill": temporarily changes the fill of nodes/edges, options: color

          "send-to-back": sends the selected nodes/edges to the back 

          "send-to-front": sends the selected nodes/edges to the front

          "zoom": zoom to various levels; options = "x1" (native), "x2", "x0.5", "200%" etc or "fit"

          "enableZoom": enables 'shift'-scroll to zoom graph - sets zoom to fit

          "select-down": selects all nodes/edges linking from this one

          "select-up": selects all nodes/edges linking to this one

          "select-linked": selects all nodes/edges linking to this one

          "select-all": selects all nodes/edges connection with this one
              
          "enable-highlight": enables automatic highlighting on mouse over
              
          "highlight": highlights the selected nodes
              
          "un-highlight": un-highlights all nodes


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