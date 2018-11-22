const _ = require('lodash');
const geometry = require('./geometry');
const Tree = require('avl');

const EPS = 1e-9;
const input = [
    [[1.201198389753699301, 104.507961440831422805], [1.200340250506997107, 104.532680679112672805]],
    [[1.209607785567641256, 104.532165359705686569], [1.210809247568249700, 104.518947433680295944]],
    [[1.221278244629502294, 104.517917465418577194], [1.221964722499251363, 104.533367324620485305]],
    [[1.232232553884387014, 104.523194376379251478], [1.194818755611777304, 104.524910990148782728]]
];

const intersections = calcQueue(input);
console.log(intersections.map(point => [point.x, point.y]));

function calcQueue(lines){
    const points = [];
    
    lines.forEach(linePoints => {
        if(linePoints[0][1] > linePoints[1][1]) {
            linePoints = [linePoints[1], linePoints[0]];
        }
        
        linePoints[0] = {x: linePoints[0][0], y: linePoints[0][1]};
        linePoints[1] = {x: linePoints[1][0], y: linePoints[1][1]};

        linePoints[0].line = linePoints;
        linePoints[1].line = linePoints;

        points.push(linePoints[0]);
        points.push(linePoints[1]);

        linePoints.queuePositions = [];
        
        return linePoints;
    });
    
    const queue = geometry.tree(points.slice())
        .key(function(d){ return d.y + EPS*d.x })
        .order();
    
    // console.log('queue', queue);

    const intersections = [];

    const statusT = geometry.tree([]);
    
    for (let i = 0; i < queue.length && i < 1000; i++){
        const d = queue[i];
        const y = d.y;
        // console.log(d, 'equalPoints', d);
        if (d.line && equalPoints(d.line[0], d)){
            console.log('insert');
            // insert
            d.color = d.line.color;
            d.type = 'insert';
            const index = statusT
                .key(function(e){ return geometry.lineXatY(e, d.y - EPS/1000) })
                .insert(d.line);
            
            checkIntersection(d.line, statusT[index + 1]);
            checkIntersection(d.line, statusT[index - 1]);

        } else if (d.line){
            console.log('removal');
            // removal 
            d.color = d.line.color;
            d.type = 'removal';

            const index = statusT.findIndex(d.line);
            // console.log('findIndex', index, d.line);
            statusT.remove(d.line);

            d.line.queuePositions.push({x: index, y: Math.max(y - 10, queue.prev(i).y)});
            checkIntersection(statusT[index - 1], statusT[index])
        } else if (d.lineA && d.lineB){
            // console.log('intersection');
            // intersection
            statusT.key(function(e){ return geometry.lineXatY(e, d.y - EPS/1000) });

            let indexA = statusT.findIndex(d.lineA);
            let indexB = statusT.findIndex(d.lineB);
            if (indexA === indexB) {
                indexA = indexA + 1;
            }
            statusT[indexA] = d.lineB;
            statusT[indexB] = d.lineA;

            const minIndex = indexA < indexB ? indexA : indexB;
            checkIntersection(statusT[minIndex - 1], statusT[minIndex]);
            checkIntersection(statusT[minIndex + 1], statusT[minIndex + 2])
        }

        statusT.forEach(function(d, i){
            d.queuePositions.push({x: i, y: y})
        })
    }

    function checkIntersection(a, b){
        // console.log('checkIntersection', a, b);
        if (!a || !b) 
            return;
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
