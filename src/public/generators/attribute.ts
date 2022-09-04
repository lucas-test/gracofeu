
export class Integer {
    name: string;
    value: number = 0;

    constructor(name: string) {
        this.name = name;
    }

    create_input_element() {
        const input = document.createElement("input");
        input.name = this.name;
        input.type = "number";
        input.min = "0";
        input.value = String(this.value);
        input.onchange = (e) => {
            this.value = parseInt(input.value);
        }
        return input;
    }
}

export class Percentage {
    name: string;
    value: number = 0.5;

    constructor(name: string) {
        this.name = name;
    }

    create_input_element() {
        const input = document.createElement("input");
        input.name = this.name;
        input.type = "range";
        input.min = "0.";
        input.max = "100";
        input.step = "0.1";
        input.value = String(this.value*100);
        input.onchange = (e) => {
            this.value = (parseFloat(input.value))/100;
            console.log(this.value)
        }
        return input;
    }
}

// TODO realnumber

export interface AttributesArray extends Array<Integer | Percentage> { };
