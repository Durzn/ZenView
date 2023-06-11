import { getNonce } from "../Util/WebViewUtil";

export default class ZenViewInputBox {
    private id: string = getNonce();

    public getHtml(): string {
        return ``;
    }
}