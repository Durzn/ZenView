import { getNonce } from "../Util/WebViewUtil";
import ZenViewElement from "./ZenViewElement";

export default class ZenViewInputBox implements ZenViewElement {
    public id: string = getNonce();

    public getHtml(): string {
        return `<label><input id="${this.id}"/></label>`;
    }
}