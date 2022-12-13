import { Coord } from "gramoloss";

export function clamp(val: number, min:number, max:number):number{
    if(val < min){
        return min;
    }
    if(val > max){
        return max;
    }
    return val;
}



export function solutionQuadratic(a: number, b: number, c: number) {
    if (b == 0 && a == 0) {
        return [];
    }

    if (a == 0) {
        return [-c / b];
    }

    let delta = b * b - 4 * a * c;
    if (delta > 0) {
        return [(-b + Math.sqrt(delta)) / (2 * a), (-b - Math.sqrt(delta)) / (2 * a)];
    }
    if (delta == 0) {
        return [-b / (2 * a)];
    }
    return [];
}



export function bezierValue(t: number, p0: number, p1: number, p2: number) {
    return (1.0 - t) * (1.0 - t) * p0 + 2.0 * (1.0 - t) * t * p1 + t * t * p2;
}

// Solve equation t u + t'v = c where u, v and c are 2d vectors
// return false if there is no solution
function solve_linear_equation_2d( u: Coord, v: Coord, c: Coord){
    const det = u.x * v.y - u.y * v.x;
    if (det == 0){
        return false;
    }
    const t1 = (c.x * v.y - c.y * v.x )/det;
    const t2 = (c.y * u.x - c.x * u.y )/det;
    return [t1,t2];
}


export function is_segments_intersection(a: Coord, b: Coord, c: Coord, d: Coord): boolean{
    // t a + (1-t)b = t'c + (1-t')d
    // t (a-b) + b = t'(c-d) + d
    // t (a-b) +t'(d-c) = d-b
    // det = (a-b).x * (d-c).y - (a-b).y * (d-c).x
    // t1 = (d-b).x * (d-c).y + (d-b).y * (-(d-c).x) / det
    // t2 = (d-b).x *(- (a-b).y) + (d-b).y * (a-b).x / det
    const det = (a.x-b.x)*(d.y-c.y) - (a.y-b.y)*(d.x-c.x);
    if ( det == 0) {
        return false;
    }
    const t1 = ((d.x-b.x)*(d.y-c.y) + (d.y-b.y)*(-(d.x-c.x))) / det;
    const t2 = ((d.x-b.x)*(-(a.y-b.y))+(d.y-b.y)*(a.x-b.x)) / det;
    return 0.01 < t1 && t1 < 0.99 && 0.01 < t2 && t2 < 0.99;
}



export function is_point_in_triangle(point: Coord, q1: Coord, q2: Coord, q3: Coord): boolean{
    // point = r p1 + s p2 + t p3
    // r + s + t = 1 
    //  r (q1 -q3) + s (q2-q3) = point - q3
    const sol = solve_linear_equation_2d(q1.sub(q3), q2.sub(q3), point.sub(q3));
    if ( typeof sol == "boolean"){
        return false;
    }
    else {
        const r = sol[0];
        const s = sol[1];
        return 0 <= r && 0 <= s && 0 <= 1-r-s 
    }
}

// ---------------------
// return true if there is an intersection between two triangles given by their extremities
//
export function is_triangles_intersection(p1: Coord, p2: Coord, p3: Coord, q1: Coord, q2: Coord, q3: Coord): boolean{

    if( is_point_in_triangle(p1, q1,q2,q3) && is_point_in_triangle(p2, q1,q2,q3) && is_point_in_triangle(p3, q1,q2,q3 )){
        return true;
    }
    if ( is_point_in_triangle(q1, p1,p2,p3) && is_point_in_triangle(q2, p1,p2,p3) && is_point_in_triangle(q3, p1,p2,p3)){
        return true;
    }

    if( is_segments_intersection(p1,p2, q1,q2) ||
    is_segments_intersection(p1,p2, q1,q3) ||
    is_segments_intersection(p1,p2, q2,q3) ||
    is_segments_intersection(p1,p3, q1,q2) ||
    is_segments_intersection(p1,p3, q1,q3) ||
    is_segments_intersection(p1,p3, q2,q3) ||
    is_segments_intersection(p3,p2, q1,q2) ||
    is_segments_intersection(p3,p2, q1,q3) ||
    is_segments_intersection(p3,p2, q2,q3)){
        return true;
    }
    return false;
}