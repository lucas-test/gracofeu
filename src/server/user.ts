export class User{
    name: string;
    color: string;

    constructor (id: string){
        this.name =  id.substring(0, 5)
        this.color = "#" + Math.floor(Math.random() * 16777215).toString(16);
    }
}

export const users = new Map<string,User>();