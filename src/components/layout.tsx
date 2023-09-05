type PageLayoutProps = {
  children: React.ReactNode;
};

export const PageLayout = (props: PageLayoutProps) => {
  return (
    <main className="flex h-screen justify-center">
      <div className="h-full w-full border-x border-slate-500 md:max-w-2xl">
        {props.children}
      </div>
    </main>
  );
};

export const PageHeader = (props: PageLayoutProps) => {
  return (
    <div className="flex items-center justify-center border-b border-slate-500 bg-slate-950 px-4 py-2">
      {props.children}
    </div>
  );
};
