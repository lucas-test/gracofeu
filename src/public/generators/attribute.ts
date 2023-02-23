import { ClientBoard } from "../board/board";

export class Integer {
    name: string;
    value: number = 0;
    div: HTMLDivElement;
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

        this.div = document.createElement("div");

        const label = document.createElement("label");
        label.innerText = name + ": ";
        label.classList.add("attribute_label");

        this.div.appendChild(label);


        let new_input = document.createElement("input");
        new_input.classList.add("attr_integer");
        new_input.name = this.name;
        new_input.type = "number";
        if (typeof min !== 'undefined') { 
            new_input.min = String(min); 
            this.value = min;
        }
        if (typeof max !== 'undefined') { 
            new_input.max = String(max); 
        }
        new_input.value = String(this.value);
        new_input.onchange = (e) => {
            const value_parsed = parseInt(new_input.value);
            if ( isNaN(value_parsed) || ( !isNaN(this.min) && value_parsed < this.min) || ( !isNaN(this.max) && value_parsed > this.max)){
                this.div.classList.add("invalid");
                this.value = 0;
            }else {
                this.div.classList.remove("invalid");
                this.value = value_parsed;
            }
        }

        this.div.appendChild(new_input);
    }

    reset_inputs(board: ClientBoard){
        this.div.classList.add("attribute_input");
    }
}

export class Percentage {
    name: string;
    value: number = 0.5;
    div: HTMLDivElement;

    constructor(name: string) {
        this.name = name;
        this.div = document.createElement("div");

        const label = document.createElement("label");
        label.innerText = name + ": ";
        label.classList.add("attribute_label");
        this.div.appendChild(label);


        const new_input = document.createElement("input");
        new_input.classList.add("attr_percentage");
        new_input.name = this.name;
        new_input.type = "range";
        new_input.min = "0.";
        new_input.max = "100";
        new_input.step = "0.1";
        new_input.value = String(this.value*100);

        new_input.oninput = (e) => {
            this.value = parseFloat((parseFloat(new_input.value)/100).toFixed(4));
            const current_value_span = document.getElementById(this.name+"_current_value");
            if(current_value_span){
                current_value_span.innerText = String(this.value);
            }
        }

        this.div.appendChild(new_input);
        
        const current_value = document.createElement("span");
        current_value.id = name+"_current_value";
        current_value.classList.add("attribute_range_current_value");
        current_value.innerText=String(this.value);
        this.div.appendChild(current_value);
    }

    reset_inputs(board: ClientBoard){
        this.div.classList.add("attribute_input");
    }
}

export class AreaIndex {
    name: string;
    value: number | string;
    div: HTMLDivElement;

    constructor(name: string) {
        this.name = name;
        this.div = document.createElement("div");
        this.value = "";
    }

    reset_inputs(board: ClientBoard){
        this.div.innerHTML = "";
        this.div.classList.add("attribute_input");

        const whole_input = document.createElement("input");

        whole_input.name = this.name;
        whole_input.type = "radio";
        whole_input.value = "Everything";
        whole_input.onchange = (e) => {
            this.value = "";
        }
        whole_input.checked = true;
        const everything_input_label = document.createElement("label");
        everything_input_label.innerText = "Everything";
        everything_input_label.htmlFor = "Everything";
        everything_input_label.onclick = (e) => {
            whole_input.checked = true;
            this.value = "";
        }
        const everything_div = document.createElement("div");
        everything_div.appendChild(whole_input);
        everything_div.appendChild(everything_input_label);
        this.div.appendChild(everything_div);

        // for every area add a radio input
        for( const [index, area] of board.areas.entries()){
            const new_input = document.createElement("input");
            new_input.name = this.name;
            new_input.type = "radio";
            new_input.value = area.label;
            new_input.onchange = (e) => {
                this.value = index;
            }
            const new_input_label = document.createElement("label");
            new_input_label.innerText = area.label;
            new_input_label.htmlFor = area.label;
            new_input_label.onclick = (e) => {
                new_input.checked = true;
                this.value = index;
            }

            const new_input_div = document.createElement("div");
            new_input_div.appendChild(new_input);
            new_input_div.appendChild(new_input_label);
            this.div.appendChild(new_input_div);
        }
    }

}

// TODO realnumber

export interface AttributesArray extends Array<Integer | Percentage | AreaIndex> { };
