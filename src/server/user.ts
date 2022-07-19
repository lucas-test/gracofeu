export class User {
    label: string;
    id:string;
    color: string;
    followers : Array<string>;

    constructor(id: string, color:string) {
        this.id = id;
        this.label = id.substring(0, 5)
        this.color = color;
        this.followers = new Array<string>();
    }
}

export const users = new Map<string, User>();

// TO REMOVE
export function getRandomColor() {
    const h = 360 * Math.random();
    const s = (20 + 80 * Math.random())
    const l = (35 + 50 * Math.random()) / 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}
