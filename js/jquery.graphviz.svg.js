/*
 * Copyright (c) 2015 Mountainstorm
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// from: http://stackoverflow.com/questions/5706837/get-unique-selector-of-element-in-jquery
(function($) {
	var GRAPHVIZ_PT_2_PX = 32.5;

	var scalePolygon = function(polygon, dx, dy) {
		// this is more complex - we need to scale it manually
		var bbox = polygon[0].getBBox();
		var cx = bbox.x + (bbox.width / 2);
		var cy = bbox.y + (bbox.height / 2);
		var pts = polygon.attr("points").split(" ");
		var points = ""; // new values
		for (var i in pts) {
			var xy = pts[i].split(",");
			var ox = parseFloat(xy[0]);
			var oy = parseFloat(xy[1]);
			points += (((cx - ox) / (bbox.width / 2) * dx) + ox)
				+ "," +
				(((cy - oy) / (bbox.height / 2) * dy) + oy)
				+ " ";
		}
		polygon.attr("points", points);
	}

	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	}

	var valueToNumber = function(val) {
		// convert what the user supplied to a pixel value float
		var retval = val;
		if (typeof val == "string") {
			if (val.endsWith("px")) {
				retval = parseFloat(val.substring(0, val.length-2));
			}
			if (val.endsWith("pt")) {
				// get value; then convert to graphviz pt size (using fixed const)
				retval = parseFloat(val.substring(0, val.length-2));
				retval *= GRAPHVIZ_PT_2_PX;
			}
		}
		return retval;
	}

	var actionLoad = function(graph, options) {
		$.get(options.url, null, function(data) {
			options.svg = $("svg", data);
			graph.graphviz("adopt", options);
			if (options.complete) {
				options.complete();
			}
		}, "xml");
	}

	var actionAdopt = function(graph, options) {
		graph.html(document.adoptNode(options.svg[0]));
		graph.graphviz("setup", options);
	}

	var storeComments = function(graph) {
		graph.find(".node, .edge").each(function() {
			var node = $(this);
			var title = node.children("title");
			if (title) {
				title = title.text();
				// without a title we can't tell if its a user comment or not
				var previousSibling = this.previousSibling;
				while (previousSibling && previousSibling.nodeType != 8) {
					previousSibling = previousSibling.previousSibling;
				}
				if (previousSibling != null && previousSibling.nodeType == 8) {
					// this is the comment
					function htmlDecode(input){
						var e = document.createElement('div');
						e.innerHTML = input;
						return e.childNodes[0].nodeValue;
					}
					value = htmlDecode(previousSibling.nodeValue.trim());
					if (value != title) {
						// user added comment
						node.attr("data-comment", value);
					}
				}
			}
		});
	}

	var storeSize = function(graph) {
		var svg = graph.find("svg");
		var width = svg.attr("width");
		var height = svg.attr("height");
		svg.attr("data-original-width", width.substring(0, width.length-2)); // strip 'pt'
		svg.attr("data-original-height", height.substring(0, height.length-2)); // strip 'pt'
	}

	var actionSetup = function(graph, options) {
		var settings = $.extend({
			shrink: "0.125pt",
			dropTitles: true,
			tooltips: "bootstrap",
			noselect: true,
		}, options);

		graph.addClass("graphviz-svg");
		graph.css("position", "relative");
		// set the background of graph to the background color of the graph
		var bg = graph.find(".graph polygon[fill]");
		if (bg) {
			graph.css("background", bg.attr("fill"));
			graph.attr("data-background", bg.attr("fill"));
		}
		storeComments(graph); // must do this before we get rid of the titles
		storeSize(graph);
		graph.find("svg").attr("data-zoom", "100%");		

		var opt = settings;
		if (options.merge == false) {
			opt = options;
		}
		for (var action in opt) {
			graph.graphviz(action, opt[action]);
		}
	}

	var actionShrink = function(graph, options) {
		// shrink nodes
		if (options) {
			if (typeof options != "object") {
				// duplicate to x and y if only one supplied
				options = {
					x: options, 
					y: options
				};
			}
			var dx = valueToNumber(options.x);
			var dy = valueToNumber(options.y);

			// do ellipse/circle nodes
			graph.find(".node ellipse").each(function() {
				var ellipse = $(this);
				ellipse.attr("rx", parseFloat(ellipse.attr("rx")) - dx);
				ellipse.attr("ry", parseFloat(ellipse.attr("ry")) - dy);
			});
			// do polygon nodes
			graph.find(".node polygon").each(function() {
				scalePolygon($(this), dx, dy);
			});
		}
	}

	var actionDropTitles = function(graph, options) {
		if (options != false) {
			// move the title info to data-name of its parent (g element)
			graph.find("title").each(function() {
				var title = $(this); 
				title.parent().attr("data-name", title.text());
				title.remove();
			});
		}
	}

	var actionTooltips = function(graph, options) {
		if (options != false) {
			// xlink:title can't be matched directly by jquery - so do custom filter
			graph.find("g > a").filter(function() { return $(this).attr("xlink:title"); }).each(function() {
				var a = $(this);
				a.parent().attr("data-tooltip", a.attr("xlink:title"));
				a.attr("title", a.attr("xlink:title"));
				a.removeAttr("xlink:title");
			});

			if (options == "bootstrap") {
				var newclass = "<style type='text/css'>.graphviz-svg .tooltip-inner {\n\
	white-space: nowrap;\n\
}\n\
</style>";
			$(newclass).appendTo("head");

				graph.find("g a[title]").tooltip({
					container: graph,
					placement: "auto left",
					viewport: null // dont clip to anything
				});
				graph.scroll(function() {
					updateTooltips(graph);
				});			
			}
		}
	}

	var actionNoselect = function(graph, options) {
		if (options != false) {
			// mark "text" elements (labels) as no select
			var newclass = "<style type='text/css'>.graphviz-svg g text {\n\
	-webkit-touch-callout: none;\n\
	-webkit-user-select: none;\n\
	-khtml-user-select: none;\n\
	-moz-user-select: none;\n\
	-ms-user-select: none;\n\
	user-select: none;\n\
	cursor: default;\n\
}\n\
</style>";
			$(newclass).appendTo("head");
		}
	}

	var actionNodes = function(graph, options) {
		return graph.find("g.node");
	}

	var actionEdges = function(graph, options) {
		return graph.find("g.edge");
	}

	var actionAll = function(graph, options) {
		return graph.find("g > g.node, g > g.edge");
	}

	var actionNames = function(graph, options) {
		var nodes = {};
		graph.find(".node").each(function() {
			nodes[$(this).attr("data-name")] = this;
		});
		var edges = {};
		graph.find(".edge").each(function() {
			edges[$(this).attr("data-name")] = this;
		});
		return {nodes: nodes, edges: edges};
	}

	var actionTooltipShow = function(nodes, options) {
		var as = nodes.find("a[title]");
		as.attr("data-tooltip-keepvisible", true);
		var opt = {};
		if (options) {
			opt = options;
		}
		as.tooltip("show", opt).on("hide.bs.tooltip", function() {
			// keep them visible even if you acidentally mouse over
			if ($(this).attr("data-tooltip-keepvisible")) {
				return false;
			}
		});
	}

	var actionTooltipHide = function(nodes, options) {
		var as = nodes.find("a[title]");
		as.removeAttr("data-tooltip-keepvisible");
		as.tooltip("hide");
	}

	var actionColor = function(nodes, options) {
		actionStroke(nodes, options);
		actionFill(nodes, options);
	}

	var replaceColor = function(nodes, attr, color) {
		nodes.find("polygon, ellipse, path").each(function() {
			var shape = $(this);
			if (color != undefined) {
				// save and replace
				if (attr != "fill" || shape.prop("tagName") != "path") {
					// only set fill if its not a path
					if (shape.attr("data-original-" + attr) == undefined) {
						// we've not already saved it
						shape.attr("data-original-" + attr, shape.attr(attr));
					}
					shape.attr(attr, color);
				}
			} else {
				// restore
				var original = shape.attr("data-original-" + attr);
				if (original) {
					shape.attr(attr, original);
					shape.removeAttr("data-original-" + attr);
				}
			}
		});
	}

	var actionStroke = function(nodes, color) {
		replaceColor(nodes, "stroke", color);
	}

	var actionFill = function(nodes, color) {
		replaceColor(nodes, "fill", color);
	}

	var actionSendToBack = function(nodes, options) {
		var first = nodes.siblings(":first");
		if(first.prop("tagName") == "g") {
			// we need to become the first items
			nodes.prependTo(first.parent());
		} else {
			nodes.insertAfter(first);
		}
	}

	var actionSendToFront = function(nodes, options) {
		var first = nodes.siblings(":first");
		nodes.appendTo(first.parent());
	}

	var updateTooltips = function(graph) {
		graph.find("a[data-tooltip-keepvisible]").each(function() {
			var tt = new $.fn.tooltip.Constructor($(this), {
				placement: "auto left", 
				container: graph,
				viewport: null // dont clip to anything
			});
			tt.$tip = graph.find("#" + $(this).attr("aria-describedby"));

			var that = tt
			var $tip = tt.tip()

			var placement = typeof tt.options.placement == 'function' ?
				tt.options.placement.call(tt, $tip[0], tt.$element[0]) :
				tt.options.placement

			var autoToken = /\s?auto?\s?/i
			var autoPlace = autoToken.test(placement)
			if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

			tt.options.container ? $tip.appendTo(tt.options.container) : $tip.insertAfter(tt.$element)

			var pos          = tt.getPosition()
			var actualWidth  = $tip[0].offsetWidth
			var actualHeight = $tip[0].offsetHeight

			if (autoPlace) {
				var orgPlacement = placement
				var $container   = tt.options.container ? $(tt.options.container) : tt.$element.parent()
				var containerDim = tt.getPosition($container)

				placement = placement == 'bottom' && pos.bottom + actualHeight > containerDim.bottom ? 'top'    :
							placement == 'top'    && pos.top    - actualHeight < containerDim.top    ? 'bottom' :
							placement == 'right'  && pos.right  + actualWidth  > containerDim.width  ? 'left'   :
							placement == 'left'   && pos.left   - actualWidth  < containerDim.left   ? 'right'  :
							placement

				$tip
					.removeClass('left')
					.removeClass('right')
					.removeClass('top')
					.removeClass('bottom')
					.addClass(placement)
			}
			
			var calculatedOffset = tt.getCalculatedOffset(placement, pos, actualWidth, actualHeight)
		
			tt.applyPlacement(calculatedOffset, placement)

			var complete = function () {
				var prevHoverState = that.hoverState
				that.$element.trigger('move.bs.' + that.type)
				that.hoverState = null

				if (prevHoverState == 'out') that.leave(that)
			}

			$.support.transition && tt.$tip.hasClass('fade') ?
				$tip
					.one('bsTransitionEnd', complete)
					.emulateTransitionEnd($.fn.tooltip.TRANSITION_DURATION) :
				complete()
		});		
	}

	var actionZoom = function(graph, options) {
		var svg = graph.find("svg");
		var width = null;
		var height = null;
		if (options == "fit") {
			// fit to parent
			width = "100%";
			height = "100%";
		} else if (typeof options == "string") {
			if (options[0] == "x") {
				var scale = parseFloat(options.substring(1));
				// multiplication scale
				width = (parseFloat(svg.attr("data-original-width")) * scale) + "pt";
				height = (parseFloat(svg.attr("data-original-height")) * scale) + "pt";
			} else if (options[options.length-1] == "%") {
				width = options;
				height = options;
			}
		}
		svg.attr("data-zoom", options);
		svg.attr("width", width);
		svg.attr("height", height);
		updateTooltips(graph);
	}

	var actionEnableZoom = function(graph, options) {
		graph.graphviz("zoom", "100%"); // fit 
		graph.mousewheel(function(evt) {
			if (evt.shiftKey) {
				var z = graph.find("svg").attr("data-zoom");
				var zoom = parseFloat(z.substring(0, z.length-1));
				zoom -= evt.deltaY * evt.deltaFactor;
				if (zoom < 100.0) {
					zoom = 100.0;
				}
				// get pointer offset in view
				var svg = graph.find("svg");
				// ratio offset within svg
				var dx = evt.pageX - svg.offset().left;
				var dy = evt.pageY - svg.offset().top;
				var rx = dx / svg.width();
				var ry = dy / svg.height();

				// offset within frame (graph)
				var px = evt.pageX - graph.offset().left;
				var py = evt.pageY - graph.offset().top;

				graph.graphviz("zoom", zoom + "%");
				// scroll so pointer is still in same place
				graph.scrollLeft((rx * svg.width()) + 0.5 - px);
				graph.scrollTop((ry * svg.height()) + 0.5 - py);
				return false; // stop propogation
			}
		});
	}

	var selectNodes = function(nodes, joint, lnk, match, outset) {
		var ftr = "g[data-name" + "='" + match + "']";
		nodes.filter(ftr).each(function() {
			if (!setIn(outset, this)) {
				setAdd(outset, this);
				selectEdges(nodes, joint, lnk, $(this).attr("data-name"), outset);
			}
		});
	}

	var selectEdges = function(nodes, joint, lnk, match, outset) {
		var lnka = "";
		var lnkb = lnk;
		if (joint == "$") {
			lnka = lnk;
			lnkb = "";
		}
		var ftr = "g[data-name" + joint + "='" + lnka + match + lnkb + "']";
		nodes.filter(ftr).each(function() {
			if (!setIn(outset, this)) {
				setAdd(outset, this);
				var name = $(this).attr("data-name");
				var i = name.lastIndexOf(lnk);
				var next = name.substring(i+2);
				if (joint == "$") {
					next = name.substring(0, i)
				}
				selectNodes(nodes, joint, lnk, next, outset);
			}
		});
	}

	var selectAny = function(nodes, joint, lnk, match, outset) {
		console.log(nodes)
		if (nodes.hasClass("node")) {
			selectEdges(nodes, joint, lnk, match, outset);		
		}
	}

	var setIn = function(set, a) {
		var retval = false;
		for (var i in set) {
			if (set[i] == a) {
				retval = true;
				break
			}
		}
		return retval;
	}

	var setAdd = function(set, a) {
		set.push(a);
	}

	var actionSelectDown = function(node, options) {
		var outset = [];
		if (node.attr("class") == "node") {
			selectEdges(node.siblings(), "^", "->", node.attr("data-name"), outset);
		} else if (node.attr("class") == "edge") {
			var name = node.attr("data-name");
			var i = name.indexOf("->");
			selectNodes(node.siblings(), "^", "->", name.substring(i+2), outset);
		}
		return $(outset);
	}

	var actionSelectUp = function(node, options) {
		var outset = [];
		if (node.attr("class") == "node") {
			selectEdges(node.siblings(), "$", "->", node.attr("data-name"), outset);
		} else if (node.attr("class") == "edge") {
			var name = node.attr("data-name");
			var i = name.indexOf("->");
			selectNodes(node.siblings(), "$", "->", name.substring(0, i), outset);
		}
		return $(outset);
	}

	var actionSelectLinked = function(node, options) {
		var outset = [];
		if (node.attr("class") == "node") {
			selectEdges(node.siblings(), "$", "--", node.attr("data-name"), outset);
		} else if (node.attr("class") == "edge") {
			var name = node.attr("data-name");
			var i = name.indexOf("--");
			selectNodes(node.siblings(), "$", "--", name.substring(0, i), outset);
		}
		return $(outset);
	}

	var actionSelectAll = function(node, options) {
		var set = node.graphviz("select-up");
		set = set.add(node.graphviz("select-down"));
		set = set.add(node.graphviz("select-linked"));
		set = set.add(node);
		return set;
	}

	var actionEnableHighlight = function(graph, options) {
		var all = graph.graphviz("all");
		all.hover(function() {
			var $path = $(this).graphviz("select-all");
			actionHighlight($path);
		}, function() {
			actionUnHighlight($(this).parents("[class='graphviz-svg']"));
		});
	}

	var actionHighlight = function($path, options) {
		var $graph = $path.parents("[class='graphviz-svg']");
		var all = $graph.graphviz("all");
		$path.graphviz("tooltip-show");
		all.each(function() {
			var e = this;
			var inPath = false;
			$path.each(function() {
				if (e == this) {
					inPath = true;
					return false;
				}
			});
			if (!inPath) {
				var $this = $(this);
				var color = $this.find("ellipse, polygon, path").attr("stroke");
				if (!color) {
					color = $this.find("ellipse, polygon, path").attr("fill");
				}
				var bg = $graph.attr("data-background");
				$this.graphviz("color", jQuery.Color(color).transition(bg, 0.9));
			}
		});
	}

	var actionUnHighlight = function(graph, options) {
			var all = graph.graphviz("all");
			all.graphviz("tooltip-hide");
			all.graphviz("color");
	}

	/*
	 * \brief Provides utility functions for manipulating Graphviz generated svg diagrams.
	 *		  These functions allow you to import svg graphs, make them look prettier and
	 *		  provide a level of interactivity.
	 *
	 * \param action 	the action to perform (see below)
	 * \param options	(optional) the options to the action
	 *
	 * \details requires:
	 *				https://github.com/jquery/jquery-mousewheel (for enableZoom)
	 *				https://github.com/jquery/jquery-color/ (for highlight)
	 *
	 *			Actions:
	 *
	 * 			"load": loads, adopts and setsup svg from a URL.  
	 *					options {url: "test.svg", complete:function() {} } and any specified in "setup".
	 *
	 *			"adopt": adopts and setsup a chunk of svg and loads it inside this node.  options
	 *					 {svg: xmlData} and any specified in "setup"
	 *
	 *			"setup": perform multipl actions to setup the graph
	 *					 options: {shrink: "0.1pt", merge=false} etc
	 *							  svg specifies the xml data to load; key/values specifies actions
	 *							  (and their options) to perform once loaded; merge (optional) 
	 *							  specifies if the supplied actions should be merged with the 
	 *							  default ones - or replace them
	 *
	 *							  any graphviz comments supplied are added in "data-comment" attributes
	 *
	 *							  defaults:
	 *									shrink: "0.125pt",
	 *									dropTitles: true,
	 *									tooltips: "bootstrap",
	 *									noselect: true,
	 *									 
	 *			"shrink": shrinks all nodes to provide a gap between the edges and nodes
	 *					  making it look nicer and more modern.  
	 *
	 *					  options: a number; a string e.g. "1px" or "1pt"; or an object of 
	 *							   the format {x: 6, y: "1pt"}.  "pt" is treated as graphviz 
	 *							   points - allowing you to add padding/width when generating 
	 *							   svg in points.
	 *
	 *			"dropTitles": removes the title elements which get added with the .dot node name, 
	 * 						  and causes browsers to show tooltips.  We remove them and store the 
	 *						  value as in "data-name" on the "g" element.
	 *
	 *			"tooltips": converts tooltip values (xlink:title] to "title", preventing making it 
	 *						easier to use 3rd party tooltip tools.  If true; just changes attribute
	 *						if "bootstrap", calls bootstrap tooltip function with this as the container
	 *
	 *			"noselect": marks everything (in css) as no-select; so you can't select labels 
	 *
	 *			"nodes": select all "g" elements which are nodes
	 *
	 *			"edges": select all "g" elements which are edges
	 *
	 *			"all": select all "g" elements
	 *
	 *			"names": returns a dict {nodes: {n0: element}, edges: {"n0->n1", element}}
	 *
	 *			"tooltip-show": show all tooltips of selected nodes/edges; keep them visible even on
	 *							hover; requires bootstrap tooltips
	 *					 
	 *			"tooltip-hide": hide all tooltips of selected nodes/edges; stop keeping them visible
	 *							even on hover; requires bootstrap tooltips
	 *
	 *			"color": temporarily changes the stroke and fill of nodes/edges, options: color
	 *
	 *			"stroke": temporarily changes the stroke of nodes/edges, options: color
	 *
	 *			"fill": temporarily changes the fill of nodes/edges, options: color
	 *
	 *			"send-to-back": sends the selected nodes/edges to the back 
	 *
	 *			"send-to-front": sends the selected nodes/edges to the front
	 *
	 * 			"zoom": zoom to various levels; options = "x1" (native), "x2", "x0.5", "200%" etc or "fit"
	 *
	 * 			"enableZoom": enables 'shift'-scroll to zoom graph - sets zoom to fit
	 *
	 *			"select-down": selects all nodes/edges linking from this one
	 *
	 *			"select-up": selects all nodes/edges linking to this one
	 *
	 *			"select-linked": selects all nodes/edges linking to this one
	 *
	 *			"select-all": selects all nodes/edges connection with this one
	 *				
	 *			"enable-highlight": enables automatic highlighting on mouse over
	 *				
	 *			"highlight": highlights the selected nodes
	 *				
	 *			"un-highlight": un-highlights all nodes
	 *
	 */
	$.fn.graphviz = function(action, options) {
		var actions = {
			load: actionLoad,
			adopt: actionAdopt,
			setup: actionSetup,
			shrink: actionShrink,
			dropTitles: actionDropTitles,
			tooltips: actionTooltips,
			noselect: actionNoselect,
			nodes: actionNodes,
			edges: actionEdges,
			all: actionAll,
			names: actionNames,
			"tooltip-show": actionTooltipShow,
			"tooltip-hide": actionTooltipHide,
			color: actionColor,
			stroke: actionStroke,
			fill: actionFill,
			"send-to-back": actionSendToBack,
			"send-to-front": actionSendToFront,
			zoom: actionZoom,
			enableZoom: actionEnableZoom,
			"select-down": actionSelectDown,
			"select-up": actionSelectUp,
			"select-linked": actionSelectLinked,
			"select-all": actionSelectAll,
			"enable-highlight": actionEnableHighlight,
			"highlight": actionHighlight,
			"un-highlight": actionUnHighlight,
		};

		// dispatch action
		var retval = this;
		if (action in actions) {
			var ret = actions[action]($(this), options);
			if (ret != undefined) {
				retval = ret;
			}
		}
		return retval;
	};
}( jQuery ));
