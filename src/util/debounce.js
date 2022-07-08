export function debounce(func, wait, immediate = true) {
    // 定义一个timeout计时器
    let timeout
    return function () {
        // 如果每次进入函数的时候timeout有值，说明等待时间还没有过，不执行函数，清空timeout
        // 如果没有timeout，则说明过了等待期，可以执行函数
        if (timeout) clearTimeout(timeout)
        // 默认立即执行方法，延后执行的话，会让人感觉有卡顿
        if (immediate) {
            // 定义现在是否能执行
            let now = !timeout
            if (now) func.apply(this, arguments)
            // 不论timeout有没有值，都重新给timeout新添加一个定时器
            // 等待wait时间后，将timeout设为null，代表可以继续执行次function
            timeout = setTimeout(() => {
                timeout = null
            }, wait)
        } else {
            // 如果不是立即执行此函数，则在等待wait时间后执行方法
            timeout = setTimeout(() => {
                func.apply(this, arguments)
            }, wait)
        }
    }
}