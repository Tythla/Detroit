export type Album = {
  id: string
  title: string
  artist: string
  artworkUrl: string | null
  url: string | null
  releaseDate: string | null
  genre: string | null
  trackCount: number | null
}

export type AlbumSearchBy = 'album' | 'song'
