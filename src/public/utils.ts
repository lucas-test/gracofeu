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
