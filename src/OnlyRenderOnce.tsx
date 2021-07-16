export default function OnlyRenderOnce({
  children,
}: {
  children: any;
  subscribeKey?: string;
}) {
  return children;
}
