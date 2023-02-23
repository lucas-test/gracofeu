export function create_popup(id: string, title: string){
    const div = document.createElement("div");
    div.classList.add("popup");
    div.id = id;
    document.body.appendChild(div);

    // Close popup with Escape key
    window.addEventListener("keydown", (e) => {
        if (e.key == "Escape"){
            div.style.display = "none";
        }
    });

    // Title -----
    const title_div = document.createElement("div");
    title_div.classList.add("popup_header");
    const title_h2 = document.createElement("h2");
    title_h2.classList.add("popup_title");
    title_h2.textContent = title;
    title_div.appendChild(title_h2);
    div.appendChild(title_div);

    // Close button ------
    const close_button = document.createElement("div");
    close_button.classList.add("close_button");
    close_button.innerHTML = '<img src="img/parametor/plus.svg" alt="">';
    close_button.onclick = () => {
        div.style.display = "none";
    }
    div.appendChild(close_button);

    // Div content ---------
    const div_content = document.createElement("div");
    div_content.classList.add("popup_content");
    div_content.id = id + "_content";
    div.appendChild(div_content);
    
    return div;
}