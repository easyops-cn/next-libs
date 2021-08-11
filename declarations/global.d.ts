declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.css" {
  const css: string;
  export default css;
}

declare namespace JSX {
  interface IntrinsicAttributes {
    ref?: React.LegacyRef<HTMLElement>;
    className?: string;
  }
}

interface SvgrComponent
  extends React.StatelessComponent<React.SVGAttributes<SVGElement>> {}

declare module "*.svg" {
  const url: string;
  export default url;
  export const ReactComponent: SvgrComponent;
}
