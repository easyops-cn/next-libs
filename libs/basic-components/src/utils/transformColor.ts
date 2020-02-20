export const colorMap: Record<string, string> = {
  green: "var(--theme-green-color)",
  red: "var(--theme-red-color)",
  blue: "var(--theme-blue-color)",
  orange: "var(--theme-orange-color)",
  cyan: "var(--theme-cyan-color)",
  purple: "var(--theme-purple-color)",
  geekblue: "var(--theme-geekblue-color)",
  gray: "var(--theme-gray-color)"
};

/**
 * 如果提供的颜色值是平台提供的规范颜色，则转换为使用平台规范的颜色，不是的话则原样输出。
 * @param color {string} 颜色值
 *  @return {string} 返回处理后的颜色值或 css变量
 */
export function transformColor(color: string): string {
  return colorMap[color] ?? color;
}
