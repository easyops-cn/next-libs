import React from "react";
import SVGA from "svgaplayerweb";

export interface GeneralPlayerProps {
  className?: string;
  containerStyle?: React.CSSProperties;
  src: string;
  loops?: number;
  clearsAfterStop?: boolean;
  fillMode?: "Forward" | "Backward";
  contentMode?: "Fill" | "AspectFill" | "AspectFit";
  onFinished?: () => void;
}

const parser = new SVGA.Parser();

export function LeacySvgaPlayer(
  props: GeneralPlayerProps,
  ref: React.Ref<SVGA.Player>
): React.ReactElement {
  const {
    src,
    className,
    containerStyle,
    loops = 0,
    clearsAfterStop = true,
    fillMode = "Forward",
    contentMode = "AspectFit",
    onFinished,
  } = props;

  const containerRef = React.useRef<any>();
  const playerRef = React.useRef<SVGA.Player>();
  const [playerInstance, setPlayerInstance] = React.useState<SVGA.Player>();

  React.useImperativeHandle(
    ref,
    () => {
      return playerInstance;
    },
    [playerInstance]
  );

  React.useEffect(() => {
    // istanbul ignore else
    if (containerRef.current) {
      const player = new SVGA.Player(containerRef.current);
      Object.assign(player, { loops, clearsAfterStop, fillMode });
      player.setContentMode(contentMode);
      onFinished && player.onFinished(onFinished);
      setPlayerInstance(player);
      playerRef.current = player;
      return () => player.clear();
    }
  }, [containerRef]);

  React.useEffect(() => {
    parser.load(
      src,
      (videoItem) => {
        playerRef.current.setVideoItem(videoItem);
        playerRef.current.startAnimation();
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.error(err);
      }
    );
  }, [src]);

  React.useEffect(() => {
    playerRef.current?.setContentMode?.(contentMode);
  }, [contentMode]);

  React.useEffect(() => {
    onFinished && playerRef.current?.onFinished?.(onFinished);
  }, [onFinished]);

  return (
    <div ref={containerRef} className={className} style={containerStyle}></div>
  );
}

export const SvgaPlayer = React.forwardRef(LeacySvgaPlayer);
