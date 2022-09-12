
export class Integer {
    name: string;
    value: number = 0;
    input: HTMLInputElement = null;
    min: number = Number.NaN;
    max: number = Number.NaN;

    constructor(name: string, min?: number, max?: number) {
        this.name = name;
        if (typeof min !== 'undefined') { 
            this.min = min; 
        }
        if (typeof max !== 'undefined') { 
            this.max = max; 
        }

        this.input = document.createElement("input");
        this.input.classList.add("attribute_input", "attr_integer");
        this.input.name = this.name;
        this.input.type = "number";
        if (typeof min !== 'undefined') { 
            this.input.min = String(min); 
            this.value = min;
        }
        if (typeof max !== 'undefined') { 
            this.input.max = String(max); 
        }
        this.input.value = String(this.value);
        this.input.onchange = (e) => {
            const value_parsed = parseInt(this.input.value);
            if ( isNaN(value_parsed) || ( !isNaN(this.min) && value_parsed < this.min) || ( !isNaN(this.max) && value_parsed > this.max)){
                this.input.classList.add("invalid");
                this.value = 0;
            }else {
                this.input.classList.remove("invalid");
                this.value = value_parsed;
            }
            
            
        }
    }

    create_input_element() {
        return this.input;
    }


}

export class Percentage {
    name: string;
    value: number = 0.5;
    input: HTMLInputElement = null;

    constructor(name: string) {
        this.name = name;

        this.input = document.createElement("input");
        this.input.classList.add("attribute_input", "attr_percentage");
        this.input.name = this.name;
        this.input.type = "range";
        this.input.min = "0.";
        this.input.max = "100";
        this.input.step = "0.1";
        this.input.value = String(this.value*100);
        this.input.onchange = (e) => {
            this.value = (parseFloat(this.input.value))/100;
        }
    }

    create_input_element() {
        return this.input;
    }
}

// TODO realnumber

export interface AttributesArray extends Array<Integer | Percentage> { };
