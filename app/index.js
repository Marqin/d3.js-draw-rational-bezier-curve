"use strict";

var d3 = require('d3');
require('./main.css');
var RationalBezierCurve = require('../lib/rational-bezier-curve');

var svg = d3.select('#example').append('svg');
var circleLayer = svg.append('g').attr('class', 'circle-layer');
var controlLayer = svg.append('g').attr('class', 'control-layer');
var curveLayer = svg.append('g').attr('class', 'curve-layer');

getJSON ( "data.json", function ( err, json, out ) {
    if ( err )
      console.log("ERROR:", err);
    else {
      var controlPoints = json;

      var cxArr = controlPoints.map( function(x){return x.cx;} );
      var cyArr = controlPoints.map( function(x){return x.cy;} );
      var wArr = controlPoints.map( function(x){return x.w;} );

      var minX = Math.min( ...cxArr ),
        width = Math.abs( Math.max( ...cxArr ) - minX ),
        minY = Math.min( ...cyArr ),
        height = Math.abs( Math.max( ...cyArr ) - minY );

      minX -= 5; minY -= 5; width += 10; height += 10;

      // The curve is completely contained in the convex hull of its control points :-)
      svg.attr({
        viewBox: minX + " " + minY + " " + width + " " + height,
        width: 512,
        height: 512
      });

      drawControlPoints(controlPoints);
      drawRationalBezierCurve(cxArr, cyArr, wArr);
    }
});

// functions:

function getJSON ( path, callback ) {

  callback = ( typeof callback === 'function' ) ? callback : function() {};

  var req = new XMLHttpRequest();

  req.onreadystatechange = function () {
    if ( req.readyState === XMLHttpRequest.DONE ) {
      // req.status === 0 for Local file @ Chrome
      if ( req.status === 200 || req.status === 0 ) {
        var json;
        try {
          json = JSON.parse( req.responseText );;
        } catch(e) {
          callback ( e, null );
          return;
        }
        callback ( null, json );
      } else
        callback ( req, null );
    }
  };

  req.open("GET", path, true);
  req.overrideMimeType("application/json");
  req.send();
}

function drawControlPoints(controlPoints) {
  controlLayer.selectAll('circle.control').data(controlPoints)
    .enter().append('circle')
    .attr({
      'class': 'control',
      cx: function(d) { return d.cx; },
      cy: function(d) { return d.cy; },
      r: 2
    });
}


function drawRationalBezierCurve(cxArr, cyArr, wArr) {
  var i, t;
  var n = 32;
  var curvePoints = [];


  var curve = new RationalBezierCurve( cxArr, cyArr, wArr );

  for (i = 0; i <= n; i++) {
    t = i / n;
    curvePoints.push(curve.getPointAt(t));
  }
  curveLayer.selectAll('circle.curve').data(curvePoints)
    .enter().append('circle')
    .attr({
      'class': 'curve',
      cx: function(d) { return d.x; },
      cy: function(d) { return d.y; },
      r: 1
    });

  var lines = [];
  for (i = 0; i < n; i++) {
    lines.push({
      x1: curvePoints[i].x,
      y1: curvePoints[i].y,
      x2: curvePoints[i + 1].x,
      y2: curvePoints[i + 1].y
    });
  }
  curveLayer.selectAll('line.curve').data(lines)
    .enter().append('line')
    .attr({
      'class': 'curve',
      x1: function(d) { return d.x1; },
      y1: function(d) { return d.y1; },
      x2: function(d) { return d.x2; },
      y2: function(d) { return d.y2; }
    });
}
