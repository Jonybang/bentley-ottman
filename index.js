const _ = require('lodash');
const geometry = require('./geometry');
const Tree = require('avl');

const input = [
    [[1.201198389753699301, 104.507961440831422805], [1.200340250506997107, 104.532680679112672805]],
    [[1.209607785567641256, 104.532165359705686569], [1.210809247568249700, 104.518947433680295944]],
    [[1.221278244629502294, 104.517917465418577194], [1.221964722499251363, 104.533367324620485305]],
    [[1.232232553884387014, 104.523194376379251478], [1.194818755611777304, 104.524910990148782728]]
];

const intersections = calcQueue(input);
console.log(intersections.map(point => [point.x, point.y]));


function calcQueue(lines){
    let segmentsCount = 0;
    const segmentsByIds = {

    };
    
    const sweepline = {
        y: 0
    };
    
    const queue = new Tree(geometry.pointCompare, true);
    
    lines.forEach((linePoints, index) => {
        if(linePoints[0][1] > linePoints[1][1]) {
            linePoints = [linePoints[1], linePoints[0]];
        }
        
        linePoints[0] = {x: linePoints[0][0], y: linePoints[0][1]};
        linePoints[1] = {x: linePoints[1][0], y: linePoints[1][1]};

        linePoints[0].line = linePoints;
        linePoints[1].line = linePoints;

        queue.insert(linePoints[0], linePoints[0]);
        queue.insert(linePoints[1], linePoints[1]);

        linePoints.queuePositions = [];
        
        return linePoints;
    });
    
    // console.log('queue', queue);

    // const statusT = geometry.tree([]);
    // statusT.key(geometry.lineSort.bind(sweepline));
    const lineCompare = geometry.lineCompare.bind(sweepline);
    const statusT = new geometry.LinkedList(lineCompare);
    
    const intersections = [];
    
    queue.forEach((node) => {
        // console.log('node', node);
        const d = node.key;
        
        sweepline.y = d.y;

        if (d.line && equalPoints(d.line[0], d)){
            // insert
            d.color = d.line.color;
            d.type = 'insert';
            //
            // const index = statusT.insert(d.line);
            // console.log('insert', index, shortLine(d.line));
            // const next = statusT[index + 1];
            // const prev = statusT[index - 1];

            const index = statusT.insert(d.line);
            console.log('insert', statusT.getIndex(index), shortLine(d.line));
            const next = statusT.getValue(statusT.next(index));
            const prev = statusT.getValue(statusT.prev(index));

            console.log('checkIntersection d.line, next');
            checkIntersection(d.line, next);
            console.log('checkIntersection d.line, prev');
            checkIntersection(d.line, prev);
        } else if (d.line){
            console.log('removal');
            // removal 
            d.color = d.line.color;
            d.type = 'removal';

            // console.log('find', shortLine(d.line));
            // const index = statusT.findIndex(d.line);
            // console.log('found', index);
            // const prev = statusT[index - 1];
            // const cur = statusT[index];
            // statusT.remove(d.line);

            const index = statusT.find(d.line);
            console.log('find', shortLine(d.line), index);
            const prev = statusT.getValue(statusT.prev(index));
            const cur = statusT.getValue(index);
            console.log('found', statusT.getIndex(index));
            statusT.remove(index);

            // console.log('findIndex', index, d.line);
            // d.line.queuePositions.push({x: index, y: Math.max(y - 10, queue.prev(node).key.y)});
            console.log('checkIntersection prev, cur');
            checkIntersection(prev, cur);
        } else if (d.lineA && d.lineB){
            console.log('intersection');
            // intersection
            //
            // let indexA = statusT.findIndex(d.lineA);
            // let indexB = statusT.findIndex(d.lineB);
            // console.log('swap lineA', indexA, shortLine(d.lineA));
            // console.log('swap lineB', indexB, shortLine(d.lineB));
            // statusT[indexA] = d.lineB;
            // statusT[indexB] = d.lineA;
            //
            // const minIndex = indexA < indexB ? indexA : indexB;
            // console.log('min', shortLine(statusT[minIndex]));
            // const prev = statusT[minIndex - 1];
            // const min = statusT[minIndex];
            // const next = statusT[minIndex + 1];
            // const nextNext = statusT[minIndex + 2];

            let indexA = statusT.find(d.lineA);
            let indexB = statusT.find(d.lineB);
            console.log('swap lineA', statusT.getIndex(indexA), shortLine(d.lineA));
            console.log('swap lineB', statusT.getIndex(indexB), shortLine(d.lineB));
            statusT.swap(indexA, indexB);

            const minIndex = statusT.max(indexA, indexB);
            console.log('min', lineCompare(d.lineA, d.lineB), shortLine(statusT.getValue(minIndex)));
            const prev = statusT.getValue(statusT.prev(minIndex));
            // console.log('prev', lineCompare(statusT.getValue(minIndex), statusT.getValue(statusT.prev(minIndex))), shortLine(statusT.getValue(statusT.prev(minIndex))));
            const min = statusT.getValue(minIndex);
            const next = statusT.getValue(statusT.next(minIndex));
            const nextNext = statusT.getValue(statusT.next(minIndex, 2));
            
            console.log('checkIntersection prev, min');
            checkIntersection(prev, min);
            console.log('checkIntersection next, nextNext');
            checkIntersection(next, nextNext);
        }
        //
        // statusT.forEach(function(d, i){
        //     d.queuePositions.push({x: i, y: y})
        // })
    });

    function checkIntersection(a, b){
        if (!a || !b) 
            return;
        console.log('checkIntersection not null', shortLine(a), shortLine(b));
        const i = geometry.intersection(a[0], a[1], b[0], b[1]);
        i.lineA = a;
        i.lineB = b;
        if (i.isIntersection) {
            intersections.push(i);
            queue.insert(i);
        }
    }

    return intersections;
}

function equalPoints(point1, point2) {
    return point1.x === point2.x && point1.y === point2.y;
}

function shortLine(l) {
    return [[l[0].x, l[0].y], [l[1].x, l[1].y]];
}
