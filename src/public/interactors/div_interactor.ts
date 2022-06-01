
// INTERACTOR DIV


let interactors_available = [interactor_selection, interactor_edge]

function deselect_all_interactor_div() {
    for (let div of document.getElementsByClassName("interactor")) {
        div.classList.remove("selected");
    }
}

function select_interactor_div(interactor: Interactor) {
    for (let div of document.getElementsByClassName("interactor")) {
        if (div.id == interactor.name) {
            div.classList.add("selected");
        }
    }
}


function setup_interactors_div() {
    let interactors_div = document.getElementById("interaction_mode_selector");
    for (let interactor of interactors_available) {
        let newDiv = document.createElement("div");
        newDiv.classList.add("interactor");
        newDiv.id = interactor.name;
        newDiv.onclick = function () {
            deselect_all_interactor_div()
            newDiv.classList.add("selected")
            interactor_loaded = interactor
        };
        newDiv.innerHTML = '<img src="img/interactor/' + interactor.img_src + '" width="27px" />';
        interactors_div.appendChild(newDiv);

        let div_recap = document.createElement("div");
        div_recap.classList.add("interactor_recap");
        div_recap.innerHTML = interactor.name + " " + interactor.shortcut;
        document.body.appendChild(div_recap);

        newDiv.onmousemove = function (e) {
            div_recap.style.left = String(e.clientX + 30)
            div_recap.style.top = String(e.clientY - 16)
        }

        newDiv.onmouseenter = function () {
            div_recap.style.display = "block"
            div_recap.style.opacity = "1"
        }

        newDiv.onmouseleave = function () {
            div_recap.style.display = "none"
            div_recap.style.opacity = "0"
        }
    }
}

