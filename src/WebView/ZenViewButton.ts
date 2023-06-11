import { getNonce } from "../Util/WebViewUtil";
import ZenViewElement from "./ZenViewElement";

export default class ZenViewButton implements ZenViewElement {
    public id: string = getNonce();
    
    public getHtml(): string {
        throw new Error("Method not implemented.");
    }

}