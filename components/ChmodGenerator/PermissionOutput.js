import { describePerms, toOctalString, toPermString } from './lib';

// The result: octal and symbolic notation, and what each entity can do, in words.
export function PermissionOutput({ perms }) {
  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <span className="text-5xl font-mono font-bold tracking-widest">{toOctalString(perms)}</span>
        <span className="text-3xl font-mono text-muted-foreground">{toPermString(perms)}</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        {describePerms(perms).map((line) => (
          <span key={line} className="text-sm text-muted-foreground">{line}</span>
        ))}
      </div>
    </>
  );
}
