# Album Wall

Album Wall is a single-page app within the personal website for finding albums
and arranging their covers on a configurable wall. The MVP is local-first: it
has no account, server, or database.

## Layout

The desktop layout has two regions:

- A compact, fixed-width left sidebar. Search is at the top, an independently
  scrollable two-column results grid is in the middle, and grid settings remain
  at the bottom.
- A large album-wall canvas that occupies the remaining space. Its cells are
  square and arranged in a configurable grid. The complete grid fits inside the
  available canvas/viewport beneath the canvas header without internal
  horizontal or vertical scrolling.

The wall defaults to 5 rows by 5 columns. Rows and columns each use an exact
decrement/value/increment control with an allowed range of 1–7. Settings also
show occupancy, such as `12 / 25`.

The design is desktop-first. On narrower screens, the sidebar may move above the
wall or into a drawer, but touch and keyboard access must remain available. The
MVP does not prescribe a more detailed mobile layout.

## Search

Search is a labeled form with a text input and submit button; Enter submits the
form. Keep `draftQuery` separate from `submittedQuery` so typing does not make a
request. Album is the default search mode. Retain an optional inline Album/Song
toggle because the data layer supports both; Song mode returns the albums
containing matching songs.

Each result shows cover artwork, album title, and artist. The results area must
represent loading, no results, error, and query-too-short states without
replacing the stable sidebar controls.

The existing data layer calls Apple's Search API directly from the browser. A
provider adapter maps both album and song responses to the app's normalized
`Album` type, maps song matches to their parent albums, and deduplicates by
Apple collection ID. Search responses already contain artwork URLs: normal
browser image elements load the covers, with no manual JavaScript request per
cover. The adapter normalizes artwork URLs to the existing 600×600 convention.

Although form submission is the primary request boundary, the hook also applies
a defensive 300 ms debounce. It cancels superseded requests, keeps results in a
five-minute client cache, rejects malformed provider responses safely, and does
not request blank or too-short queries.

## Wall interactions

- Clicking a result adds it to the first empty wall cell.
- Dragging a result to the wall places it in the chosen empty cell.
- Dragging a wall album to an empty cell moves it.
- Dropping a wall album onto an occupied cell swaps the two albums. It never
  silently overwrites one.
- Duplicate albums are not allowed. An attempted duplicate add highlights and
  focuses that album's existing wall cell.
- If the wall is full, additions are blocked with concise feedback.
- Covers are the visual priority. Album title and artist appear when a tile is
  hovered or focused rather than remaining beneath every tile.
- Every occupied cell has an accessible remove action that appears on hover or
  focus.

Reducing rows or columns is allowed only when no album occupies a cell that the
resize would remove. If it would remove an album, keep the current dimensions
and tell the user to move or remove those albums first. The MVP avoids both
silent data loss and destructive confirmation dialogs.

## State and persistence

The recommended wall state is `rows`, `columns`, and a fixed-length, row-major
array of `Album | null`. A cell at a coordinate uses
`row * columns + column`. When dimensions change, copy surviving cells by their
coordinates into a newly sized array rather than merely truncating or extending
the old array.

Persist grid dimensions and wall contents to `localStorage` and restore them on
load. Use an app-specific key and a small versioned value:

```ts
type PersistedAlbumWallV1 = {
  version: 1
  rows: number
  columns: number
  cells: (Album | null)[]
}
```

Validate persisted data before use and fall back to a 5×5 empty wall if it is
missing, unsupported, or invalid. Keeping the version in the stored value gives
future releases an explicit migration boundary.

## Accessibility

- Give the search field, mode, and grid controls programmatic labels.
- Make result cards and occupied wall cells focusable. Enter and Space perform
  their primary click action.
- Preserve visible focus indicators throughout the app.
- Announce search status, full-wall feedback, duplicate focus, removal, moves,
  swaps, and blocked resizes through an appropriate status region.
- Every drag operation must have a keyboard-capable move equivalent as well as
  pointer and touch support.

## Dependencies

`@dnd-kit/react` is the only anticipated new dependency. It is a good fit for a
grid with multiple drag sources and targets, pointer, touch, and keyboard input,
accessibility support, and no imposed visual style. Its API is pre-1.0 and may
change, so all integration remains isolated inside Album Wall. It is installed
for the MVP implementation; keep the dependency scoped to this app and revisit
it if the pre-1.0 API changes materially.

MVP state and actions are small enough for React state plus focused hooks, so
Zustand or Redux would add unnecessary indirection. The existing search hook
already handles cancellation and caching, so TanStack Query is not needed.
Album Wall defines an app-local Mantine theme and connects its existing custom
CSS accent variables to that theme so future Mantine components and current
controls share the same palette.

## Proposed app structure

All modules stay inside `src/apps/album-wall/`:

- `sidebar/`: search form and mode, result grid and cards, search-state
  messages, and row/column settings.
- `wall/`: wall grid, square cells, album overlays, remove actions, and
  occupancy display where appropriate.
- `albums/`: the normalized album model, Apple provider adapter, and search
  hook.
- `state/`: wall operations, resize validation, duplicate/full-wall feedback,
  and the row-major state model.
- `persistence/`: versioned localStorage serialization, validation, restoration,
  and future migrations.
- `drag-and-drop/`: isolated dnd-kit sensors, sources, targets, keyboard
  behavior, and move/swap coordination.

The page-level Album Wall component composes these areas and owns only the state
and coordination that genuinely crosses their boundaries.

## Interaction flow

1. The app restores a valid saved wall or creates an empty 5×5 wall.
2. The user enters a query, optionally changes Album/Song mode, and submits.
3. Search status is announced and the two-column result grid updates.
4. The user clicks a result for first-empty placement or drags it to a specific
   cell. Duplicate and full-wall checks happen before mutation.
5. The user moves, swaps, or removes albums and adjusts valid dimensions.
6. Each accepted wall or dimension change is persisted locally.

## MVP non-goals

- Authentication or user accounts
- Cloud sync or collaboration
- Music playback
- Playlist creation or management
- A server or database
- Advanced mobile-specific editing workflows

## Acceptance criteria

- Album Wall renders as one page with the specified desktop sidebar and square
  wall regions; the wall initially contains 25 empty cells, and empty cells have
  no visible numeric index.
- The complete rows-by-columns wall grid fits within the available right-side
  canvas beneath its header for every supported 1×1 through 7×7 dimension; the
  canvas itself does not scroll on normal desktop layouts.
- Row and column controls enforce 1–7, display exact values and occupancy, and
  reject any shrink that would discard an occupied cell with actionable
  feedback.
- Search runs only on button or Enter submission, defaults to Album mode, and
  uses an inline Album/Song toggle without issuing requests for blank or
  too-short queries.
- Search results render in a scrollable, two-column sidebar grid with artwork,
  title, artist, and verifiable loading, empty, error, and too-short states.
- Apple album and song responses normalize to the same `Album` model; song
  matches resolve to parent albums, collection IDs are unique, and cover URLs
  use the 600×600 form.
- A superseded search is cancelled, repeated searches can use the five-minute
  cache, and malformed responses reach the error state without crashing.
- Click placement, targeted result placement, wall moves, occupied-cell swaps,
  removal, duplicate focus, and full-wall rejection behave as specified without
  overwriting or silently losing albums.
- Wall dimensions and contents survive reload through validated, versioned
  localStorage data.
- Search, album actions, grid settings, and move/swap behavior are operable by
  keyboard with visible focus and announced status changes; drag interactions
  also support pointer and touch input.
- Album Wall implementation and any eventual dnd-kit integration remain fully
  contained in `src/apps/album-wall/`.
