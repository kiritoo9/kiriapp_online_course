## About
Kiriapp - Online Course (Services)

## Installations
Make sure you already install [bun runtime](https://bun.sh/)
```bash
bun install
```

[in case you didn't have prisma.model]
Run this to create prisma.model file (This is important)
```bash
bunx prisma db pull
```

Configure <code>.env</code> and run <code>seed</code> by run this command:
```bash
bunx prisma db seed
```

Then run the server:
```bash
bun run server.ts
```

## Author
[kiritoo9](https://github.com/kiritoo9) on github

## Version
0.1.1