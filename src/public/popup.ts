export function create_popup(id: string){
    const div = document.createElement("div");
    div.classList.add("popup");
    div.id = id;
    document.body.appendChild(div);

    const close_button = document.createElement("div");
    close_button.classList.add("close_button");
    close_button.innerHTML = '<img src="img/parametor/plus.svg" alt="">';
    close_button.onclick = () => {
        div.style.display = "none";
    }
    div.appendChild(close_button);
    return div;
}