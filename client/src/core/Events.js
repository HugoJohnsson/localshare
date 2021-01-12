export default class Events {
    static trigger(type, data) {
        window.dispatchEvent(new CustomEvent(type, { detail: data }));
    }

    static listen(type, callback) {
        window.addEventListener(type, callback);
    }
}