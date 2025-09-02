import {ComponentDescription} from "../types.js";

export const IntegrationButton = (text: string, id?: string, classes?: string[]): string => {
    let attributes_string: string = "";

    if (id) attributes_string += `id=${id} `;

    if (classes) {

        attributes_string += "class=";

        for (let c of classes) attributes_string += c;

    }

    return (`
        <button ${attributes_string} >${text}</button> 
    `)
}


export const IntegrationButtons = (buttons: ComponentDescription[]): string => {
    let buttons_components: string = ``;

    for (let b of buttons) buttons_components += IntegrationButton(b.text);

    return (`
        <div>
            ${buttons_components}
        </div>
    `);
}