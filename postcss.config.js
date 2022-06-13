/*
 * @Author: liuxin
 * @Date: 2022-06-13 16:28:18
 * @LastEditors: liuxin
 * @LastEditTime: 2022-06-13 16:28:38
 * @Description: px转vw
 */
module.exports = {
    plugins: {
        'postcss-px-to-viewport': {
            viewportWidth: 1920,
            unitPrecision: 6, // 指定`px`转换为视窗单位值的小数位数
            viewportUnit: 'vw',
            selectorBlackList: ['.ignore', '.hairlines', '.train-msg', '.RM-mode-line'], // 指定不转换为视窗单位的类，可以无限添加
            minPixelValue: 1,
            mediaQuery: false, // 允许在媒体查询中转换`px`
            // 不转换的只能这么写 只写文件夹的名字，不写整个目录 如views下面的login,只写/login/
             // exclude: [/node_modules/],
        }
    }
}
