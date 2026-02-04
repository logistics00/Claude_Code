I'm building a "Note Taking" web app.

In this app, users will be able to create and manage notes. A a "note" is simply a piece of text, created via a rich text editor (TipTap).

In detail, authenticated (!) users will be able to:
- create, view, update and delete notes
- share notes publicly (and also stop sharing)

I'Il build the app using Next.js with Bun & TypeScript. For styling, we'll use TailwindCSS. Authentication will be implemented using the better-auth library, the rich text editor will be implemented using the TipTap library.
I'Il provide basic rich text formatting:
- Bold, Italic
- 3 Heading Levels + Normal Text
- Inline Code + Code Snippets
- Bullet point lists
- Horizontal separator lines

The data will be stored as JSON in a SQLite database. I'Il use Bun's built-in SQLite client with raw SQL statements.

Do you need more information to create me a technical specification document which I can use as a foundation to then build this application?
