//creates new point 
const d3 = require('d3');

const EPS = 1e-9;

function P(x, y, color){
    var rv;
    if (x.map){
        rv = {x: x[0], y: x[1], color: 'black'}
    } else{
        rv = {x: x, y: y, color: color || 'black'}
    }
    rv.toString = function(){ return rv.x + ',' + rv.y };
    rv.type = 'point';
    return rv
}

function clone(d){
    if (d.type === 'point'){
        return P(d.x, d.y, d.color)
    }
}

//dist
function distP(a, b){
    return Math.sqrt(
        Math.pow(a.x - b.x, 2) +
        Math.pow(a.y - b.y, 2))
}

//http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
//todo clean up
function distLine(a, b, p){
    function sqr(x) { return x * x }
    function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
    function distToSegmentSquared(p, v, w) {
        var l2 = dist2(v, w);
        if (l2 === 0) {
            return dist2(p, v);
        }
        var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        if (t < 0) return dist2(p, v);
        if (t > 1) return dist2(p, w);
        return dist2(p, { x: v.x + t * (w.x - v.x),
            y: v.y + t * (w.y - v.y) });
    }
    function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }
    return distToSegment(p, a, b)
}

function calcAngle(a, b, c){
    var v1 = [b.x - a.x, b.y - a.y];
    var v2 = [c.x - b.x, c.y - b.y];

    var dot = v1[0]*v2[0] + v1[1]*v2[1];

    var ab = distP(a, b);
    var bc = distP(b, c);
    var ca = distP(c, a);

    return Math.acos((bc*bc + ab*ab - ca*ca)/(2*bc*ab))//*180/Math.PI
    // return Math.acos((bc*bc + ab*ab - ca*ca)/(2*bc*ab))*180/Math.PI
}


//intersection between lines connect points [a, b] and [c, d]
function intersection(a, b, c, d){
    var det = (a.x - b.x)*(c.y - d.y)
        - (a.y - b.y)*(c.x - d.x),

        l = a.x*b.y - a.y*b.x,
        m = c.x*d.y - c.y*d.x,

        ix = (l*(c.x - d.x) - m*(a.x - b.x))/det,
        iy = (l*(c.y - d.y) - m*(a.y - b.y))/det,
        i = P(ix, iy)

    i.isOverlap = (ix === a.x && iy === a.y) || (ix === b.x && iy === b.y);

    i.isIntersection = !(a.x < ix ^ ix < b.x)
        && !(c.x < ix ^ ix < d.x)
        && !i.isOverlap
        && det;

    // if (isNaN(i.x)) debugger

    return i
}

function isLeft(a, b, c){
    return (b.x - a.x)*(c.y - a.y) - (b.y - a.y)*(c.x - a.x) > 0
}

//http://stackoverflow.com/questions/2049582/how-to-determine-a-point-in-a-2d-triangle
function triangleContains(a, b, c, p){
    var b1 = isLeft(p, a, b);
    var b2 = isLeft(p, b, c);
    var b3 = isLeft(p, c, a);

    return (b1 === b2) && (b2 === b3)
}

function lineXatY(l, y){
    var a = l[0], b = l[1],
        m = (a.y - b.y)/(a.x - b.x);

    return (y - a.y + m*a.x)/m
}


function toPathStr(d){ 
    return 'M' + d.join('L');
}

function negFn(d){ 
    return !d;
}

function clamp(a,b,c){ 
    return Math.max(a, Math.min(b, c));
}

function pairs(array){
    var rv = [];
    array.forEach(function(d, i){
        for (var j = i + 1; j < array.length; j++) {
            rv.push([d, array[j]]);
        }
    });

    return rv;
}

function mod(n, m){ 
    return ((n % m) + m) % m;
}


// function to find out middle element 

// Function for implementing the Binary 
// Search on linked list 

function shortLine(l) {
    return [[l[0].x, l[0].y], [l[1].x, l[1].y]];
}

function LinkedList(comparator) {
    const nodesByIds = {};
    const valuesByIds = {};
    let headId = null;
    let count = 0;
    
    this.find = (value) => {
        return binarySearch(value);
    };
    
    this.insert = (value) => {
        if(!headId) {
            headId = ++count;
            nodesByIds[headId] = {
                nextId: null,
                prevId: null
            };
            valuesByIds[headId] = value;
            return headId;
        }
        const foundLeft = binarySearch(value, true);
        console.log('foundLeft', foundLeft);
        
        const compareResult = comparator(valuesByIds[foundLeft], value);
        
        if(compareResult === 0) {
            return foundLeft;
        } else if(compareResult < 0) {
            // console.log('insertAfter', foundLeft);
            return this.insertAfter(foundLeft, value);
        } else {
            if(foundLeft === headId) {
                const newId = ++count;
                nodesByIds[newId] = {
                    nextId: headId,
                    prevId: null
                };
                valuesByIds[newId] = value;

                nodesByIds[headId].prevId = newId;
                // console.log('insert head', newId, nodesByIds);
                headId = newId;
                return newId;
            }
            // console.log('headId', headId, nodesByIds[headId]);
            // console.log('foundLeft', foundLeft, nodesByIds[foundLeft]);

            // console.log('insertBefore', foundLeft);
            return this.insertAfter(nodesByIds[foundLeft].prevId, value);
        }
    };
    
    this.insertAfter = function(prevId, value) {
        const newId = ++count;
        valuesByIds[newId] = value;
        
        nodesByIds[newId] = {
            nextId: nodesByIds[prevId].nextId,
            prevId: prevId
        };
        
        // console.log('insertAfter', newId, nodesByIds[newId]);

        nodesByIds[prevId].nextId = newId;
        if(nodesByIds[newId].nextId) {
            nodesByIds[nodesByIds[newId].nextId].prevId = newId;
        }
        return newId;
    };

    this.remove = function(id) {
        if(!id) {
            return;
        }
        const node = nodesByIds[id];
        // console.log('before remove', id, nodesByIds);
        
        if(node.prevId) {
            nodesByIds[node.prevId].nextId = node.nextId;
        }
        if(node.nextId) {
            nodesByIds[node.nextId].prevId = node.prevId;
        }
        
        if(id === headId) {
            headId = node.nextId;
        }
        
        delete nodesByIds[id];

        // console.log('after remove', id, nodesByIds);
    };
    
    this.swap = function (aId, bId) {
        const aNode = nodesByIds[aId];
        const bNode = nodesByIds[bId];
        const aNodePrevId = aNode.prevId;
        const aNodeNextId = aNode.nextId;
        const bNodePrevId = bNode.prevId;
        const bNodeNextId = bNode.nextId;

        console.log('before swap', aId, bId, nodesByIds);

        if(aNodePrevId === bId) {
            aNode.prevId = aId;
            bNode.nextId = bId;
        } else if(aNodeNextId === bId) {
            aNode.nextId = aId;
            bNode.prevId = bId;
        }
        
        if(aNodePrevId) {
            nodesByIds[aNodePrevId].nextId = bId;
        }
        if(aNodeNextId) {
            nodesByIds[aNodeNextId].prevId = bId;
        }
        if(bNodePrevId) {
            nodesByIds[bNodePrevId].nextId = aId;
        }
        if(bNodeNextId) {
            nodesByIds[bNodeNextId].prevId = aId;
        }
        
        
        //a: { prevId: 3, nextId: b }
        //b: { prevId: a, nextId: null }
        
        nodesByIds[aId] = bNode;
        nodesByIds[bId] = aNode;
        
        if(!nodesByIds[aId].prevId) {
            headId = aId;
        }
        if(!nodesByIds[bId].prevId) {
            headId = bId;
        }
        
        console.log('after swap', aId, bId, nodesByIds);
    };
    
    this.getIndex = function (id) {
        if(!id) {
            return null;
        }
        let curId = headId;
        let index = 0;
        do {
            if(curId === id) {
                return index;
            }
            curId = nodesByIds[curId].nextId;
            index++;
        } while(true);
    };

    this.min = function (aId, bId) {
        const compareResult = comparator(valuesByIds[aId], valuesByIds[bId]);
        if(compareResult < 0) {
            return aId;
        } else {
            return bId;
        }
    };

    this.max = function (aId, bId) {
        const compareResult = comparator(valuesByIds[aId], valuesByIds[bId]);
        if(compareResult > 0) {
            return aId;
        } else {
            return bId;
        }
    };
    
    this.next = function(id, mul) {
        if(!id || !nodesByIds[id].nextId) {
            return null;
        }
        if(mul === 1 || !mul) {
            return nodesByIds[id].nextId;
        } else {
            return this.next(nodesByIds[id].nextId, mul - 1);
        }
    };

    this.prev = function(id, mul) {
        console.log('prev', id, nodesByIds);
        if(!id || !nodesByIds[id].prevId) {
            return null;
        }
        if(mul === 1 || !mul) {
            return nodesByIds[id].prevId;
        } else {
            return this.next(nodesByIds[id].prevId, mul - 1);
        }
    };
    
    this.getValue = function(id) {
        return valuesByIds[id];
    };
    
    function binarySearch(value, returnLeft = false) {
        // console.log('binarySearch begin', returnLeft, headId, nodesByIds);
        if(!headId) {
            return null;
        }

        let curId = headId;
        // let prevId = null;
        
        do {
            let compareResult = comparator(valuesByIds[curId], value);
            // console.log('compareResult', compareResult, shortLine(valuesByIds[curId]));
            
            if(compareResult === 0) {
                return curId;
            } else if(!returnLeft) {
                if(!nodesByIds[curId].nextId) {
                    return null;
                }
                curId = nodesByIds[curId].nextId;
            } else {
                if(compareResult < 0 && nodesByIds[curId].nextId) {
                    curId = nodesByIds[curId].nextId;
                } else {
                    return curId;
                }
            }
        } while (true);
        
        do {
            let compareResult = comparator(valuesByIds[curId], value);
            console.log('compareResult', curId, compareResult);
            if(compareResult === 0) {
                return curId;
            } else if(compareResult < 0) {
                if(nodesByIds[curId].nextId && nodesByIds[nodesByIds[curId].nextId].nextId) {
                    curId = nodesByIds[nodesByIds[curId].nextId].nextId;
                } else if(nodesByIds[curId].nextId) {
                    compareResult = comparator(valuesByIds[nodesByIds[curId].nextId], value);
                    console.log('compareResult next', nodesByIds[curId].nextId, compareResult);
                    if(compareResult === 0) {
                        return nodesByIds[curId].nextId;
                    } else if(compareResult < 0) {
                        return returnLeft ? nodesByIds[curId].nextId : null;
                    } else {
                        return returnLeft ? curId : null;
                    }
                } else {
                    return returnLeft ? curId : null;
                }
            } else if(nodesByIds[curId].prevId) {
                compareResult = comparator(valuesByIds[nodesByIds[curId].prevId], value);
                console.log('compareResult prev', nodesByIds[curId].prevId, compareResult);
                if(compareResult === 0) {
                    return nodesByIds[curId].prevId;
                } else {
                    return returnLeft ? nodesByIds[curId].prevId : null;
                }
            } else {
                console.log('compareResult no prev', nodesByIds[curId]);
                return returnLeft ? curId : null;
            }
        } while(true);
        
        let start = headId;
        let last = null;
        
        do {
            // Find middle 
            let mid = middle(start, last);
            // console.log('binarySearch', 'start', start, 'last', last, 'mid', mid);

            // If middle is empty 
            if (mid === null)
                return null;
            
            const compareResult = comparator(valuesByIds[mid], value);

            // If value is present at middle 
            if (compareResult === 0)
                return mid;

            // If value is more than mid 
            else if (compareResult < 0 && nodesByIds[mid].nextId)
                start = nodesByIds[mid].nextId;

            // If the value is less than mid. 
            else
                last = mid;
            
            if(start === last) {
                break;
            }
        } while (last === null || nodesByIds[last].nextId !== start);

        if(returnLeft) {
            return start;
        } else {
            return null;
        }
    }

    function middle(start, last) {
        if (start === null)
            return null;

        let slow = start;
        let fast = nodesByIds[start].next;
        if (!fast) {
            return start;
        }

        while (comparator(valuesByIds[fast], nodesByIds[last]) !== 0) {
            fast = nodesByIds[fast].next;
            if (comparator(valuesByIds[fast], nodesByIds[last]) !== 0){
                slow = nodesByIds[slow].next;
                fast = nodesByIds[fast].next;
            }
        }
        return slow;
    }
}

function tree(array){
    var key = function(d){ return d };
    var bisect = d3.bisector(function(d){ return key(d) }).left;

    array.insert = function(d){
        var i = array.findIndex(d);
        var val = key(d);
        if (array[i] && val === key(array[i])) {
            return; // don't add dupes
        }
        array.splice(i, 0, d);
        return i
    };

    array.remove = function(d){
        var i = array.findIndex(d);
        array.splice(i, 1);
        return i
    };

    array.swap = function(i, j){

    };

    array.findIndex = function(d){ 
        return bisect(array, key(d)) 
    };

    array.key = function(_){
        key = _;
        return array
    };

    array.order = function(){
        array.sort(ascendingKey(key));
        return array
    };
    
    array.prev = function(index) {
        if(index - 1 > 0) {
            return array[index];
        } else {
            return array[array.length - 1];
        }
    };

    return array
}

function ascendingKey(key) {
    return typeof key == 'function' ? function (a, b) {
        return key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : key(a) >= key(b) ? 0 : NaN;
    } : function (a, b) {
        return a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : a[key] >= b[key] ? 0 : NaN;
    };
};


function pointValue(point) {
    return point.y + EPS * point.x;
}
function pointCompare(point1, point2) {
    const point1Value = pointValue(point1);
    const point2Value = pointValue(point2);
    if(point1Value === point2Value) {
        return 0;
    }
    return point1Value > point2Value ? 1 : -1;
}

function lineCompare(line1, line2){
    const line1Value = lineXatY(line1, this.y - EPS/1000);
    const line2Value = lineXatY(line2, this.y - EPS/1000);
    let result;
    if(line1Value === line2Value) {
        result = 0;
    } else {
        result = line1Value > line2Value ? 1 : -1;
    }
    // console.log('lineCompare', result, [[line1[0].x, line1[0].y], [line1[1].x, line1[1].y]], [[line2[0].x, line2[0].y], [line2[1].x, line2[1].y]]);
    return result;
}

function lineSort(line){
    return lineXatY(line, this.y - EPS/1000);
}

module.exports = {
    EPS,
    P,
    clone,
    distP,
    distLine,
    calcAngle,
    intersection,
    isLeft,
    triangleContains,
    lineXatY,
    toPathStr,
    negFn,
    clamp,
    pairs,
    mod,
    tree,
    pointValue,
    pointCompare,
    lineCompare,
    lineSort,
    LinkedList
};
