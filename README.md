## Usage

```js
import sql, { empty, join, raw } from "sql-template-tag";

const query = sql`SELECT * FROM books WHERE id = ${id}`;

query.sql; //=> "SELECT * FROM books WHERE id = ?"
query.text; //=> "SELECT * FROM books WHERE id = $1"
query.statement; //=> "SELECT * FROM books WHERE id = :1"
query.values; //=> [id]

pg.query(query); // Uses `text` and `values`.

// Embed SQL instances inside SQL instances.
const nested = sql`SELECT id FROM authors WHERE name = ${"Blake"}`;
const query = sql`SELECT * FROM books WHERE author_id IN (${nested})`;

// Join and "empty" helpers (useful for nested queries).
sql`SELECT * FROM books ${hasIds ? sql`WHERE ids IN (${join(ids)})` : empty}`;
```

### Join

Accepts an array of values or SQL, and returns SQL with the values joined together using the separator.

```js
const query = join([1, 2, 3]);

query.sql; //=> "?,?,?"
query.values; //=> [1, 2, 3]
```

**Tip:** You can set the second argument to change the join separator, for example:

```js
join(
  [sql`first_name LIKE ${firstName}`, sql`last_name LIKE ${lastName}`],
  " AND ",
); // => "first_name LIKE ? AND last_name LIKE ?"
```

### Raw

Accepts a string and returns a SQL instance, useful if you want some part of the SQL to be dynamic.

```js
raw("SELECT"); // == sql`SELECT`
```

**Do not** accept user input to `raw`, this will create a SQL injection vulnerability.

### Empty

Simple placeholder value for an empty SQL string. Equivalent to `raw("")`.

### Bulk

Accepts an array of arrays, and returns the SQL with the values joined together in a format useful for bulk inserts.

```js
const query = sql`INSERT INTO users (name) VALUES ${bulk([
  ["Blake"],
  ["Bob"],
  ["Joe"],
])}`;

query.sql; //=> "INSERT INTO users (name) VALUES (?),(?),(?)"
query.values; //=> ["Blake", "Bob", "Joe"]
```
