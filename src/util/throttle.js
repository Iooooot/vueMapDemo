export const throttle = (fn, delay) => {
    let prev = 0;
    return function () {
        let now = new Date();
        let context = this;
        let args = Array.prototype.slice.call(arguments)
        if (now - prev >= delay) {
            fn.apply(context, args)
            prev = now
        }
    }
}