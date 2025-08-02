type Props = {
  children: React.ReactNode;
};
export function ResponsiveGrid({ children }: Props) {
  return (
    <div className="grid w-full grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-x-8 gap-y-10">
      {children}
    </div>
  );
}
