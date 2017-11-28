export function shuffle(arr) {
  return arr.sort((a, b) => {
    return Math.random() - 0.5;
  });
};
export function findSongIndex(list, song) {
  return list.findIndex((item) => {
    return item.id === song.id;
  });
}
