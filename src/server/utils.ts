// UTILS
// generic functions


// return a string made of random alphanumeric character
// parameter: length: the length of the returned string
export function makeid(length: number): string {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// decide if there is equality between two sets xs and ys
export function eqSet (xs: Set<number>, ys: Set<number>): boolean {
    return xs.size === ys.size && [...xs].every((x) => ys.has(x));
}

export function eq_indices (xs: Array<[string,number]>, ys: Array<[string,number]>): boolean {
    for (const element of xs){
        let found = false;
        for (const e2 of ys){
            if (element[0] == e2[0] && element[1] == e2[1] ){
                found = true;
                break;
            }
        }
        if (!found){
            return false;
        }
    }
    return xs.length === ys.length;
}