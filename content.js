export function sortPosts(posts) {
 return [...posts].sort((a,b)=> (b.publishedAt || b.date).localeCompare(a.publishedAt || a.date));
}
