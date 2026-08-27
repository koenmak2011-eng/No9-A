# CMS folder

This folder is the content management area for the No.9 Bubble Tea website.
Everything the menu shows is read from here at page load — no rebuild needed.

## `menu.csv`

One row per menu item. Columns:

| Column        | Required | Notes                                                                |
| ------------- | -------- | -------------------------------------------------------------------- |
| `id`          | yes      | Unique, max 3 characters. Category letter + number (e.g. `A1`, `B12`) |
| `category`    | yes      | Display name of the category. New values create new filter tabs       |
| `name`        | yes      | Item name shown on the card                                           |
| `description` | no       | Short line of copy under the name                                     |
| `price`       | yes      | Number in GBP, e.g. `4.50`                                            |
| `tags`        | no       | Optional badge, e.g. `Popular`, `Staff Pick`                          |
| `available`   | no       | `yes` (default) or `no` to hide the item without deleting the row     |

### ID prefixes in use

- `A` — Bubble Tea
- `B` — Fruit Tea
- `C` — Slush
- `D` — Waffles
- `E` — Toppings

Use the next free letter for a brand new category.

### Fields with commas

Wrap the value in double quotes, e.g. `"Sweet, creamy and cold"`.
Double quotes inside a quoted field are escaped by doubling them (`""`).

## `images/`

One PNG per menu item, named exactly after the item `id` — `A1.png`, `B2.png`.
Square images (around 768x768) with a transparent or white background look best.
If an image is missing the card falls back to a friendly placeholder, so the
page never breaks.

## Adding an item

1. Add a row to `menu.csv` with the next free id in that category.
2. Drop `<id>.png` into `images/`.
3. Commit. The site picks it up on the next page load.

Removing an item is the reverse: delete the row (or set `available` to `no`).
