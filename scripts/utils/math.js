Math.log10 = function(v) {
    return Math.log(v) / 2.302585092994046;
};

Math.exp10 = function(v) {
    return Math.pow(10, v);
};

NS.Vector = function(x, y) {
    if(!x) x = 0;
    if(!y) y = 0;
    this.x = x;
    this.y = y;
};
NS.Vector.getVector = function(p) {
    return new NS.Vector(p.x, p.y);
};
NS.Vector.prototype = {
    clone: function() {
        return new NS.Vector(this.x, this.y);
    },
    add: function(v) {
        return new NS.Vector(v.x + this.x, v.y + this.y);
    },
    sub: function(v) {
        return new NS.Vector(this.x - v.x, this.y - v.y);
    },
    dot: function(v) {
        return this.x * v.x + this.y * v.y;
    },
    scale: function(s) {
        return new NS.Vector(this.x * s, this.y * s);
    },
    cross: function(v) {
        return this.x * v.y - this.y * v.x;
    },
    length: function() { return Math.sqrt(this.x * this.x + this.y * this.y); },
    normalize: function() {
        var l = this.length();
        return new NS.Vector(this.x / l, this.y / l);
    },
    distance2: function(p) {
        return (this.x - p.x) * (this.x - p.x) + (this.y - p.y) * (this.y - p.y);
    },
    distance: function(p) {
        return Math.sqrt(this.distance2(p));
    },
    rotate: function(angle) {
        return new NS.Vector(this.x * Math.cos(angle) - this.y * Math.sin(angle),
                             this.x * Math.sin(angle) + this.y * Math.cos(angle));
    },
    rotate90: function() {
        return new NS.Vector(-this.y, this.x);
    },
    angle: function() {
        var l = this.length();
        if (l == 0) return NaN;
        var a = Math.acos(this.x / l);
        if (this.y < 0) a = -a;
        return a;
    },
    interp: function(v, t) {
        return new NS.Vector(this.x + (v.x - this.x) * t,
                             this.y + (v.y - this.y) * t);
    },
    callMoveTo: function(g) { g.moveTo(this.x, this.y); },
    callLineTo: function(g) { g.lineTo(this.x, this.y); },
    serialize: function() {
        return { de: "Vector", x: this.x, y: this.y };
    }
};

NS.insidePolygon = function(poly, pt) {
    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i) {
       if ( ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
        && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) )
         (c = !c);
     }
    return c;
};

(function() {
// Convex Hull
// Copyright 2001, softSurfer (www.softsurfer.com)
// This code may be freely used and modified for any purpose
// providing that this copyright notice is included with it.
// SoftSurfer makes no warranty for this code, and cannot be held
// liable for any real or imagined damage resulting from its use.
// Users of this code must verify correctness for their application.
// http://softsurfer.com/Archive/algorithm_0203/algorithm_0203.htm
// Assume that a class is already given for the object:
//    Point with coordinates {float x, y;}
//===================================================================

// isLeft(): tests if a point is Left|On|Right of an infinite line.
//    Input:  three points P0, P1, and P2
//    Return: >0 for P2 left of the line through P0 and P1
//            =0 for P2 on the line
//            <0 for P2 right of the line

function sortPointX(a, b) {
    return a.x - b.x;
}
function sortPointY(a, b) {
    return a.y - b.y;
}

function isLeft(P0, P1, P2) {
    return (P1.x - P0.x) * (P2.y - P0.y) - (P2.x - P0.x) * (P1.y - P0.y);
}
//===================================================================

// chainHull_2D(): A.M. Andrew's monotone chain 2D convex hull algorithm
// http://softsurfer.com/Archive/algorithm_0109/algorithm_0109.htm
//
//     Input:  P[] = an array of 2D points
//                   presorted by increasing x- and y-coordinates
//             n = the number of points in P[]
//     Output: H[] = an array of the convex hull vertices (max is n)
//     Return: the number of points in H[]


function chainHull_2D(P, n, H) {
    // the output array H[] will be used as the stack
    var bot = 0,
    top = (-1); // indices for bottom and top of the stack
    var i; // array scan index
    // Get the indices of points with min x-coord and min|max y-coord
    var minmin = 0,
        minmax;

    var xmin = P[0].x;
    for (i = 1; i < n; i++) {
        if (P[i].x != xmin) {
            break;
        }
    }

    minmax = i - 1;
    if (minmax == n - 1) { // degenerate case: all x-coords == xmin
        H[++top] = P[minmin];
        if (P[minmax].y != P[minmin].y) // a nontrivial segment
            H[++top] = P[minmax];
        H[++top] = P[minmin]; // add polygon endpoint
        return top + 1;
    }

    // Get the indices of points with max x-coord and min|max y-coord
    var maxmin, maxmax = n - 1;
    var xmax = P[n - 1].x;
    for (i = n - 2; i >= 0; i--) {
        if (P[i].x != xmax) {
            break;
        }
    }
    maxmin = i + 1;

    // Compute the lower hull on the stack H
    H[++top] = P[minmin]; // push minmin point onto stack
    i = minmax;
    while (++i <= maxmin) {
        // the lower line joins P[minmin] with P[maxmin]
        if (isLeft(P[minmin], P[maxmin], P[i]) >= 0 && i < maxmin) {
            continue; // ignore P[i] above or on the lower line
        }

        while (top > 0) { // there are at least 2 points on the stack
            // test if P[i] is left of the line at the stack top
            if (isLeft(H[top - 1], H[top], P[i]) > 0) {
                break; // P[i] is a new hull vertex
            }
            else {
                top--; // pop top point off stack
            }
        }

        H[++top] = P[i]; // push P[i] onto stack
    }

    // Next, compute the upper hull on the stack H above the bottom hull
    if (maxmax != maxmin) { // if distinct xmax points
        H[++top] = P[maxmax]; // push maxmax point onto stack
    }

    bot = top; // the bottom point of the upper hull stack
    i = maxmin;
    while (--i >= minmax) {
        // the upper line joins P[maxmax] with P[minmax]
        if (isLeft(P[maxmax], P[minmax], P[i]) >= 0 && i > minmax) {
            continue; // ignore P[i] below or on the upper line
        }

        while (top > bot) { // at least 2 points on the upper stack
            // test if P[i] is left of the line at the stack top
            if (isLeft(H[top - 1], H[top], P[i]) > 0) {
                break;  // P[i] is a new hull vertex
            }
            else {
                top--; // pop top point off stack
            }
        }

        if (P[i].x == H[0].x && P[i].y == H[0].y) {
            return top + 1; // special case (mgomes)
        }

        H[++top] = P[i]; // push P[i] onto stack
    }

    if (minmax != minmin) {
        H[++top] = P[minmin]; // push joining endpoint onto stack
    }

    return top + 1;
}
NS.convexHull = function(points) {
    var H = [];
    var pts = [];
    for(var i = 0; i < points.length; i++) pts.push(points[i]);
    pts.sort(sortPointY);
    pts.sort(sortPointX);
    var n = chainHull_2D(pts, points.length, H);
    H = H.slice(0, n);
    return H;
};
})();

NS.affineTransform = function(matrix) {
    if(!matrix) matrix = [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ];
    this.m = matrix;
    /*
     0 1 2
     3 4 5
     6 7 8
    */
};

NS.makeTransform = {
    scale: function(sx, sy) {
        return new NS.affineTransform([
            sx,  0,  0,
             0, sy,  0,
             0,  0,  1
        ]);
    },
    translate: function(tx, ty) {
        return new NS.affineTransform([
            1,  0, tx,
            0,  1, ty,
            0,  0,  1
        ]);
    },
    rotate: function(radian) {
        var c = Math.cos(radian), s = Math.sin(radian);
        return new NS.affineTransform([
            c,  -s,  0,
            s,  c,  0,
            0,  0,  1
        ]);
    }
}

NS.affineTransform.prototype = {
    point: function(p) {
        var m = this.m;
        return [m[0] * p.x + m[1] * p.y + m[2],
                m[3] * p.x + m[4] * p.y + m[5]];
    },
    vector: function(v) {
        var m = this.m;
        return [m[0] * v.x + m[1] * v.y,
                m[3] * v.x + m[4] * v.y];
    },
    point_h: function(p) {
        var m = this.m;
        return [m[0] * p[0] + m[1] * p[1] + m[2] * p[2],
                m[3] * p[0] + m[4] * p[1] + m[5] * p[2],
                m[6] * p[0] + m[7] * p[1] + m[8] * p[2]];
    },
    // A.concat(B).point(p) = A.point(B.point(p)).
    concat: function(tr) {
        var m1 = this.m;
        var m2 = tr.m;
        return new NS.affineTransform([
            m1[0] * m2[0] + m1[1] * m2[3] + m1[2] * m2[6],
            m1[0] * m2[1] + m1[1] * m2[4] + m1[2] * m2[7],
            m1[0] * m2[2] + m1[1] * m2[5] + m1[2] * m2[8],
            m1[3] * m2[0] + m1[4] * m2[3] + m1[5] * m2[6],
            m1[3] * m2[1] + m1[4] * m2[4] + m1[5] * m2[7],
            m1[3] * m2[2] + m1[4] * m2[5] + m1[5] * m2[8],
            m1[6] * m2[0] + m1[7] * m2[3] + m1[8] * m2[6],
            m1[6] * m2[1] + m1[7] * m2[4] + m1[8] * m2[7],
            m1[6] * m2[2] + m1[7] * m2[5] + m1[8] * m2[8]
        ]);
    },
    svd: function() {
        var m = this.m;
        var k = [[m[0], m[1]], [m[3], m[4]]];
        var s = numeric.svd(k);
        var S = Math.sqrt((s.S[0] * s.S[0] + s.S[1] * s.S[1]) / 2);
        var U = s.U;
        var V = s.V;
        // VT
        var tmp = V[0][1];
        V[0][1] = V[1][0];
        V[1][0] = tmp;
        return new NS.affineTransform([
            S * U[0][0] * V[0][0] + S * U[0][1] * V[1][0],
            S * U[0][0] * V[0][1] + S * U[0][1] * V[1][1], m[2],
            S * U[1][0] * V[0][0] + S * U[1][1] * V[1][0],
            S * U[1][0] * V[0][1] + S * U[1][1] * V[1][1], m[5],
            0, 0, 1
        ]);
    },
    det: function() {
        var m = this.m;
        return m[0] * m[4] - m[1] * m[3];
    }
};

NS.lineCross = function(p1, d1, p2, d2) {
    // ( p1 + t d1 - p2 )  dot d2.rotate90 == 0
    // t = (p2 - p1).dot(d2.rotate90) / d1.dot(d2.rotate90);
    var rd2 = { x: -d2.y, y: d2.x };
    var b = d1.x * rd2.x + d1.y * rd2.y;
    var a = (p2.x - p1.x) * rd2.x + (p2.y - p1.y) * rd2.y;
    if(Math.abs(b) < 1e-5) return null;
    var t = a / b;
    return {
        x: p1.x + t * d1.x,
        y: p1.y + t * d1.y
    };
};

NS.distance = function(x0, y0, x1, y1) {
    return Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1));
};
NS.distance2 = function(a,b) {
    return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
};

NS.pointLineSegmentDistance = function(pt, p1, p2) {
    var d = p2.sub(p1);
    var t = pt.sub(p1).dot(d) / d.dot(d);
    if(t < 0)
        return pt.distance(p1);
    if(t > 1)
        return pt.distance(p2);
    var pfoot = p1.interp(p2, t);
    return pt.distance(pfoot);
};

// width, height may be negative.
NS.Rectangle = function(x0, y0, width, height, angle) {
    if(!angle) angle = 0;
    this.x0 = x0; this.y0 = y0;
    this.width = width;
    this.height = height;
    this.angle = angle;
};

NS.Rectangle.prototype = {
    clone: function() {
        return new NS.Rectangle(this.x0, this.y0, this.width, this.height, this.angle);
    },
    map: function(x, y) {
        var dx = x - this.x0;
        var dy = y - this.y0;
        var p = new NS.Vector(dx, dy).rotate(-this.angle);
        return p;
    },
    inside: function(x, y) {
        var p = this.map(x, y);
        return Math.abs(p.x) < Math.abs(this.width / 2) &&
               Math.abs(p.y) < Math.abs(this.height / 2);
    },
    // 1 -- 2
    // | -> |
    // 4 -- 3
    corner1: function() {
        var p = new NS.Vector(-this.width / 2, -this.height / 2).rotate(this.angle);
        return {
            x: this.x0 + p.x,
            y: this.y0 + p.y
        };
    },
    corner2: function() {
        var p = new NS.Vector(this.width / 2, -this.height / 2).rotate(this.angle);
        return {
            x: this.x0 + p.x,
            y: this.y0 + p.y
        };
    },
    corner3: function() {
        var p = new NS.Vector(this.width / 2, this.height / 2).rotate(this.angle);
        return {
            x: this.x0 + p.x,
            y: this.y0 + p.y
        };
    },
    corner4: function() {
        var p = new NS.Vector(-this.width / 2, this.height / 2).rotate(this.angle);
        return {
            x: this.x0 + p.x,
            y: this.y0 + p.y
        };
    },
    getCorners: function() {
        return [ this.corner1(), this.corner2(), this.corner3(), this.corner4() ];
    },
    serialize: function() {
        return { de: "Rectangle",
                 x0: this.x0, y0: this.y0,
                 width: this.width, height: this.height,
                 angle: this.angle };
    }
};
