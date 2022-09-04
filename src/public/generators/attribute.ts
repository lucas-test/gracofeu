// TODO
// pour ces classes, créer une méthode
// createInputElement


export class Integer {
    name: string;
    value: number = 0;

    constructor(name: string) {
        this.name = name;
    }
}

export class Percentage {
    name: string;
    value: number;

    constructor(name: string) {
        this.name = name;
    }
}

// TODO realnumber

export interface AttributesArray extends Array<Integer | Percentage> { };
